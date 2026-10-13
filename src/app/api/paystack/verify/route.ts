/**
 * GET /api/paystack/verify
 * 
 * Verifies a transaction against Paystack from the server:
 *   1. Rate-limits incoming verification requests by IP.
 *   2. Validates transaction reference format.
 *   3. Retrieves internal transaction record.
 *   4. Short-circuits immediately if already successful (avoids upstream API calls).
 *   5. Calls Paystack API verify endpoint.
 *   6. Validates provider status, reference, currency, and expected amount (in subunits).
 *   7. Uses atomic conditional update to transition state without race conditions.
 *   8. Never marks transaction successful based on client claim alone.
 */

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { sanitizeText } from '@/lib/validators';
import { getClientIp, verifyLimit } from '@/lib/rate-limit';
import {
  getTransactionByReference,
  updateTransactionStatus,
  transitionTransactionToSuccessful,
  fulfillTransaction,
  verifyPaystackTransaction,
  convertToPaystackSubunits,
  DatabaseMigrationRequiredError,
} from '@/lib/paystack';

// Strict reference format: alphanumeric, underscore, hyphen, 8 to 100 characters
const REFERENCE_REGEX = /^[a-zA-Z0-9_\-]{8,100}$/;

export async function GET(request: Request) {
  // ── 1. Abuse Protection / Rate Limiting ────────────────────────
  const ip = getClientIp(request);
  const limit = verifyLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: 'Too many verification attempts. Please wait a few minutes before trying again.',
      },
      { status: 429 }
    );
  }

  // ── 2. Reference Validation ────────────────────────────────────
  const { searchParams } = new URL(request.url);
  const rawReference = searchParams.get('reference');

  const reference = sanitizeText(rawReference);
  if (!reference) {
    return NextResponse.json(
      { success: false, error: 'Transaction reference is required.' },
      { status: 400 }
    );
  }

  if (!REFERENCE_REGEX.test(reference)) {
    return NextResponse.json(
      { success: false, error: 'Invalid transaction reference format.' },
      { status: 400 }
    );
  }

  // ── 3. Query Internal Transaction ──────────────────────────────
  let tx;
  try {
    tx = await getTransactionByReference(reference);
  } catch (err: unknown) {
    if (err instanceof DatabaseMigrationRequiredError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 503 }
      );
    }
    console.error('[Paystack Verify] DB lookup error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to look up transaction.' },
      { status: 500 }
    );
  }

  if (!tx) {
    return NextResponse.json(
      { success: false, error: `Transaction with reference "${reference}" not found.` },
      { status: 404 }
    );
  }

  // ── 4. Idempotency Check: Already Processed ────────────────────
  // Avoids redundant calls to Paystack upstream verify API
  if (tx.status === 'successful') {
    await fulfillTransaction(tx);
    return NextResponse.json({
      success: true,
      status: 'successful',
      reference: tx.reference,
      product: {
        id: tx.product_id,
        type: tx.product_type,
      },
      amount: tx.amount,
      currency: tx.currency,
      paidAt: tx.paid_at,
    });
  }

  // ── 5. Verify Server-to-Server with Paystack ───────────────────
  let paystackResult;
  try {
    paystackResult = await verifyPaystackTransaction(reference);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gateway verification request failed';
    console.error(`[Paystack Verify] Gateway error for ref ${reference}:`, err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 502 }
    );
  }

  const gatewayData = paystackResult.data;

  // ── 6. Security & Financial Integrity Checks ───────────────────
  // A. Check gateway transaction status
  if (gatewayData.status === 'pending' || gatewayData.status === 'ongoing') {
    // Payment is ongoing/pending confirmation; do not coerce to 'failed' in DB
    await updateTransactionStatus(reference, {
      status: 'pending',
      providerReference: gatewayData.id ? String(gatewayData.id) : undefined,
      metadata: {
        gateway_response: gatewayData.gateway_response,
        gateway_status: gatewayData.status,
        last_verified_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: false,
      status: 'pending',
      reference,
      message: gatewayData.gateway_response || 'Payment is currently pending confirmation.',
    });
  }

  if (gatewayData.status === 'abandoned') {
    await updateTransactionStatus(reference, {
      status: 'abandoned',
      providerReference: gatewayData.id ? String(gatewayData.id) : undefined,
      metadata: {
        gateway_response: gatewayData.gateway_response,
        gateway_status: 'abandoned',
        verified_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: false,
      status: 'abandoned',
      reference,
      message: gatewayData.gateway_response || 'Payment was abandoned by the customer.',
    });
  }

  if (gatewayData.status !== 'success') {
    await updateTransactionStatus(reference, {
      status: 'failed',
      providerReference: gatewayData.id ? String(gatewayData.id) : undefined,
      metadata: {
        gateway_response: gatewayData.gateway_response,
        gateway_status: gatewayData.status,
        verified_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: false,
      status: 'failed',
      reference,
      message: gatewayData.gateway_response || `Payment status is ${gatewayData.status}.`,
    });
  }

  // B. Check reference matches
  if (gatewayData.reference !== tx.reference) {
    console.error(
      `[Paystack Security Alert] Reference mismatch! Expected: ${tx.reference}, Received: ${gatewayData.reference}`
    );
    await updateTransactionStatus(reference, {
      status: 'failed',
      metadata: {
        security_violation: 'reference_mismatch',
        received_reference: gatewayData.reference,
      },
    });
    return NextResponse.json(
      { success: false, error: 'Verification failed: Reference mismatch.' },
      { status: 400 }
    );
  }

  // C. Check currency matches stored snapshot
  if (gatewayData.currency?.toUpperCase() !== tx.currency.toUpperCase()) {
    console.error(
      `[Paystack Security Alert] Currency mismatch! Expected: ${tx.currency}, Received: ${gatewayData.currency}`
    );
    await updateTransactionStatus(reference, {
      status: 'failed',
      metadata: {
        security_violation: 'currency_mismatch',
        expected_currency: tx.currency,
        received_currency: gatewayData.currency,
      },
    });
    return NextResponse.json(
      { success: false, error: 'Verification failed: Currency mismatch.' },
      { status: 400 }
    );
  }

  // D. Check amount in subunits matches stored snapshot
  const expectedSubunits = convertToPaystackSubunits(tx.amount, tx.currency);
  if (gatewayData.amount !== expectedSubunits) {
    console.error(
      `[Paystack Security Alert] Amount mismatch! Expected subunits: ${expectedSubunits}, Received: ${gatewayData.amount}`
    );
    await updateTransactionStatus(reference, {
      status: 'failed',
      metadata: {
        security_violation: 'amount_mismatch',
        expected_subunits: expectedSubunits,
        received_subunits: gatewayData.amount,
      },
    });
    return NextResponse.json(
      { success: false, error: 'Verification failed: Amount mismatch.' },
      { status: 400 }
    );
  }

  // ── 7. Atomic Transition to Successful ─────────────────────────
  const paidAt = gatewayData.paid_at || new Date().toISOString();
  const { transaction: updatedTx } = await transitionTransactionToSuccessful(reference, {
    providerReference: String(gatewayData.id),
    paidAt,
    metadata: {
      channel: gatewayData.channel,
      gateway_response: gatewayData.gateway_response,
      verified_via: 'api_verify',
      verified_at: new Date().toISOString(),
    },
  });

  // Trigger idempotent fulfilment (e.g. consultation intake & scheduling email)
  await fulfillTransaction(updatedTx);

  return NextResponse.json({
    success: true,
    status: 'successful',
    reference: updatedTx.reference,
    product: {
      id: updatedTx.product_id,
      type: updatedTx.product_type,
    },
    amount: updatedTx.amount,
    currency: updatedTx.currency,
    paidAt: updatedTx.paid_at,
  });
}
