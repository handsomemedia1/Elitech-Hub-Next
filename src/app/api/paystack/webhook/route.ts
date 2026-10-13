/**
 * POST /api/paystack/webhook
 * 
 * Paystack Webhook Handler:
 *   1. Reads raw request body.
 *   2. Validates x-paystack-signature using HMAC SHA-512 with constant-time comparison.
 *   3. Uses the documented Paystack secret key directly.
 *   4. Handles charge.success with independent server-to-server verification.
 *   5. Matches reference, currency, and subunit amount against stored snapshot.
 *   6. Enforces strict idempotency (returns 200 immediately if already processed).
 *   7. Transitions transaction state safely.
 *   8. Acknowledges webhook promptly without long-running blocking operations.
 */

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  getTransactionByReference,
  updateTransactionStatus,
  transitionTransactionToSuccessful,
  fulfillTransaction,
  verifyPaystackTransaction,
  convertToPaystackSubunits,
  DatabaseMigrationRequiredError,
} from '@/lib/paystack';

export async function POST(request: Request) {
  // ── 1. Read Raw Body & Signature ───────────────────────────────
  const rawBody = await request.text();
  const signature = request.headers.get('x-paystack-signature');

  // ── 2. Validate Signature ──────────────────────────────────────
  const isValidSignature = verifyWebhookSignature(rawBody, signature);
  if (!isValidSignature) {
    console.warn('[Paystack Webhook] Invalid or missing x-paystack-signature header.');
    return NextResponse.json(
      { success: false, error: 'Invalid webhook signature.' },
      { status: 401 }
    );
  }

  // ── 3. Parse Event Payload ─────────────────────────────────────
  let eventPayload: { event: string; data: Record<string, unknown> };
  try {
    eventPayload = JSON.parse(rawBody);
  } catch (err) {
    console.error('[Paystack Webhook] JSON parse error:', err);
    return NextResponse.json(
      { success: false, error: 'Malformed JSON payload.' },
      { status: 400 }
    );
  }

  const { event, data } = eventPayload;

  // Acknowledge non-charge events promptly
  if (event !== 'charge.success') {
    return NextResponse.json({ received: true, ignored: true, event });
  }

  const reference = typeof data?.reference === 'string' ? data.reference.trim() : '';
  if (!reference) {
    console.warn('[Paystack Webhook] charge.success missing reference.');
    return NextResponse.json(
      { success: false, error: 'Missing reference in event data.' },
      { status: 400 }
    );
  }

  // ── 4. Retrieve Internal Transaction ───────────────────────────
  let tx;
  try {
    tx = await getTransactionByReference(reference);
  } catch (err: unknown) {
    if (err instanceof DatabaseMigrationRequiredError) {
      console.error('[Paystack Webhook] Database migration 009 not applied!');
      return NextResponse.json(
        { success: false, error: 'Database service unavailable.' },
        { status: 503 }
      );
    }
    console.error(`[Paystack Webhook] DB error looking up ${reference}:`, err);
    return NextResponse.json(
      { success: false, error: 'Database query error.' },
      { status: 500 }
    );
  }

  if (!tx) {
    console.warn(`[Paystack Webhook] Received webhook for unknown reference: "${reference}".`);
    // Return 404 so Paystack will retry if transaction creation had slight latency
    return NextResponse.json(
      { success: false, error: `Transaction with reference "${reference}" not found.` },
      { status: 404 }
    );
  }

  // ── 5. Idempotency Check ───────────────────────────────────────
  // If transaction is already successful, acknowledge immediately to prevent duplicate processing
  if (tx.status === 'successful') {
    await fulfillTransaction(tx);
    return NextResponse.json({
      received: true,
      status: 'already_processed',
      reference: tx.reference,
    });
  }

  // ── 6. Independent Server-to-Server Verification ──────────────
  let verification;
  try {
    verification = await verifyPaystackTransaction(reference);
  } catch (err: unknown) {
    console.error(`[Paystack Webhook] Verification API failed for ${reference}:`, err);
    // Return 502 so Paystack will retry the webhook delivery
    return NextResponse.json(
      { success: false, error: 'Failed to verify transaction with gateway.' },
      { status: 502 }
    );
  }

  const verifiedData = verification.data;

  // ── 7. Validate Status & Financial Matching ────────────────────
  if (verifiedData.status === 'pending' || verifiedData.status === 'ongoing') {
    console.warn(`[Paystack Webhook] Gateway reported in-flight status: ${verifiedData.status} for ${reference}`);
    await updateTransactionStatus(reference, {
      status: 'pending',
      providerReference: verifiedData.id ? String(verifiedData.id) : undefined,
      metadata: {
        webhook_gateway_status: verifiedData.status,
        webhook_received_at: new Date().toISOString(),
        webhook_in_flight: true,
      },
    });
    return NextResponse.json({ received: true, status: verifiedData.status });
  }

  if (verifiedData.status === 'abandoned') {
    console.warn(`[Paystack Webhook] Gateway reported abandoned status for ${reference}`);
    await updateTransactionStatus(reference, {
      status: 'abandoned',
      providerReference: verifiedData.id ? String(verifiedData.id) : undefined,
      metadata: {
        webhook_gateway_status: 'abandoned',
        webhook_received_at: new Date().toISOString(),
      },
    });
    return NextResponse.json({ received: true, status: 'abandoned' });
  }

  if (verifiedData.status !== 'success') {
    console.warn(`[Paystack Webhook] Gateway reported failure status: ${verifiedData.status} for ${reference}`);
    await updateTransactionStatus(reference, {
      status: 'failed',
      providerReference: verifiedData.id ? String(verifiedData.id) : undefined,
      metadata: {
        webhook_gateway_status: verifiedData.status,
        webhook_received_at: new Date().toISOString(),
      },
    });
    return NextResponse.json({ received: true, status: verifiedData.status });
  }

  // Validate currency match
  if (verifiedData.currency?.toUpperCase() !== tx.currency.toUpperCase()) {
    console.error(
      `[Paystack Webhook Security] Currency mismatch! Stored: ${tx.currency}, Gateway: ${verifiedData.currency}`
    );
    await updateTransactionStatus(reference, {
      status: 'failed',
      metadata: {
        security_violation: 'currency_mismatch_webhook',
        expected_currency: tx.currency,
        received_currency: verifiedData.currency,
      },
    });
    return NextResponse.json(
      { success: false, error: 'Financial mismatch: currency' },
      { status: 400 }
    );
  }

  // Validate amount in subunits match
  const expectedSubunits = convertToPaystackSubunits(tx.amount, tx.currency);
  if (verifiedData.amount !== expectedSubunits) {
    console.error(
      `[Paystack Webhook Security] Amount mismatch! Expected: ${expectedSubunits}, Gateway: ${verifiedData.amount}`
    );
    await updateTransactionStatus(reference, {
      status: 'failed',
      metadata: {
        security_violation: 'amount_mismatch_webhook',
        expected_subunits: expectedSubunits,
        received_subunits: verifiedData.amount,
      },
    });
    return NextResponse.json(
      { success: false, error: 'Financial mismatch: amount' },
      { status: 400 }
    );
  }

  // ── 8. Atomically Transition State to Successful ───────────────
  const paidAt = verifiedData.paid_at || new Date().toISOString();
  const { transaction: updatedTx, transitioned } = await transitionTransactionToSuccessful(reference, {
    providerReference: String(verifiedData.id),
    paidAt,
    metadata: {
      channel: verifiedData.channel,
      gateway_response: verifiedData.gateway_response,
      verified_via: 'webhook',
      webhook_processed_at: new Date().toISOString(),
    },
  });

  // Idempotency: If another worker won the atomic transition race, acknowledge without duplicate processing
  if (!transitioned) {
    return NextResponse.json({
      received: true,
      status: 'already_processed',
      reference: updatedTx.reference,
    });
  }

  // Sole winning request: Trigger idempotent fulfilment (e.g. consultation intake & scheduling email)
  await fulfillTransaction(updatedTx);

  return NextResponse.json({
    received: true,
    status: 'successful',
    reference: updatedTx.reference,
  });
}
