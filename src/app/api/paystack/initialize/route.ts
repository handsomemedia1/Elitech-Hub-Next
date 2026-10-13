/**
 * POST /api/paystack/initialize
 * 
 * Initializes a secure Paystack transaction:
 *   1. Accepts product selection and customer details.
 *   2. Never trusts browser-supplied amounts, currencies, or FX rates.
 *   3. Resolves authoritative price on the server.
 *   4. Rejects unavailable FX pricing without falling back to NGN.
 *   5. Validates Paystack currency compatibility.
 *   6. Converts to Paystack integer subunits (including documented XOF multiplier).
 *   7. Persists pending transaction record with complete pricing snapshot.
 *   8. Calls Paystack initialize API and returns checkout URL.
 */

export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { validateEmail, sanitizeText } from '@/lib/validators';
import { getClientIp, formLimit } from '@/lib/rate-limit';
import { createServiceClient } from '@/lib/supabase-server';
import {
  resolveAuthoritativePrice,
  isPaystackSupportedCurrency,
  convertToPaystackSubunits,
  generateTransactionReference,
  createPendingTransaction,
  updateTransactionStatus,
  initializePaystackTransaction,
  buildApprovedCallbackUrl,
  getTrustedServerCountry,
  resolveEffectivePricingCountry,
  PricingError,
  DatabaseMigrationRequiredError,
  sanitizeGatewayErrorMessage,
} from '@/lib/paystack';

// Strict UUID format: matches Supabase uuid column type
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Validates that the selected product matches the application's intended programme.
 */
function isProgramMatch(
  appProgram?: string | null,
  appProgramName?: string | null,
  productId?: string | null
): boolean {
  if (!productId) return false;
  const combined = `${appProgram || ''} ${appProgramName || ''}`.toLowerCase();
  const prod = productId.toLowerCase();

  if (prod === 'bootcamp') {
    // 6-Week Cybersecurity Bootcamp is retired from active offerings
    return false;
  }
  if (prod === 'professional') {
    return combined.includes('professional') || combined.includes('16-week') || combined.includes('prof16');
  }
  if (prod === 'ai_security') {
    return (
      combined.includes('ai_security') ||
      combined.includes('ai-security') ||
      combined.includes('reverse') ||
      combined.includes('vulnerability') ||
      combined.includes('ai security and reverse') ||
      combined.includes('ai security & reverse')
    );
  }
  if (prod === 'ai_training') {
    // Exclude AI Security and Reverse Vulnerability applications
    const isAiSecurity =
      combined.includes('reverse') ||
      combined.includes('vulnerability') ||
      combined.includes('ai_security') ||
      combined.includes('ai-security');
    if (isAiSecurity) return false;

    return (
      combined.includes('ai_training') ||
      combined.includes('ai-training') ||
      combined.includes('ai6') ||
      combined.includes('ai-powered') ||
      (combined.includes('ai') && combined.includes('cybersecurity') && !combined.includes('16-week'))
    );
  }
  return false;
}

export async function POST(request: Request) {
  // ── 1. Rate Limiting ───────────────────────────────────────────
  const ip = getClientIp(request);
  const limit = formLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { success: false, error: 'Too many requests. Please try again later.' },
      { status: 429 }
    );
  }

  // ── 2. Parse & Validate Request Body ───────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON request body.' },
      { status: 400 }
    );
  }

  const rawProductId = sanitizeText(body.productId);
  if (!rawProductId) {
    return NextResponse.json(
      { success: false, error: 'Product identifier ("productId") is required.' },
      { status: 400 }
    );
  }

  const rawEmail = body.email;
  const emailValidation = validateEmail(rawEmail);
  if (!emailValidation.valid) {
    return NextResponse.json(
      { success: false, error: emailValidation.error || 'A valid email address is required.' },
      { status: 400 }
    );
  }
  const customerEmail = emailValidation.value;

  const customerName = sanitizeText(body.name || body.customerName).slice(0, 100) || null;
  const rawProductType = sanitizeText(body.productType);

  // ── 3. Trusted Market & Country Resolution ─────────────────────
  // Inspects trusted edge headers (Vercel/Cloudflare) and enforces international tier
  // if client attempts to spoof a domestic Nigerian/African price.
  const clientRequestedCountry = sanitizeText(body.countryCode || body.country).slice(0, 5).toUpperCase() || null;
  const serverDetectedCountry = getTrustedServerCountry(request);
  const effectiveCountry = resolveEffectivePricingCountry(clientRequestedCountry, serverDetectedCountry);

  // Security check: Warn and ignore client attempts to dictate financial values
  if (body.amount !== undefined || body.currency !== undefined || body.fxRate !== undefined) {
    console.warn(
      `[Paystack Init Security] Client (${customerEmail}) attempted to supply financial fields (amount: ${body.amount}, currency: ${body.currency}). These are strictly ignored.`
    );
  }

  // ── 4. Resolve Authoritative Price Server-Side ─────────────────
  let price;
  try {
    price = await resolveAuthoritativePrice(rawProductId, rawProductType, effectiveCountry);
  } catch (err: unknown) {
    if (err instanceof PricingError) {
      if (err.code === 'FX_UNAVAILABLE' || err.code === 'PRICING_NOT_CONFIGURED' || err.code === 'PRICE_UNAVAILABLE') {
        return NextResponse.json(
          {
            success: false,
            code: err.code,
            error: err.message,
          },
          { status: 422 } // Unprocessable Entity
        );
      }
      if (err.code === 'PRODUCT_DISCONTINUED' || err.code === 'PRODUCT_UNAVAILABLE') {
        return NextResponse.json(
          { success: false, code: err.code, error: err.message },
          { status: 400 }
        );
      }
      if (err.code === 'PRICE_DATABASE_UNAVAILABLE' || err.code === 'PRICE_LOOKUP_FAILED') {
        return NextResponse.json(
          { success: false, code: err.code, error: err.message },
          { status: 503 } // Service Unavailable
        );
      }
      return NextResponse.json(
        { success: false, code: err.code, error: err.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to resolve authoritative price.' },
      { status: 500 }
    );
  }

  // Explicit safety check: Resolved price must be a finite, positive number
  if (!Number.isFinite(price.finalAmount) || price.finalAmount <= 0) {
    return NextResponse.json(
      { success: false, error: 'Resolved price is invalid.' },
      { status: 500 }
    );
  }

  // ── 5. Validate Currency for Paystack Checkout ─────────────────
  if (!isPaystackSupportedCurrency(price.finalCurrency)) {
    return NextResponse.json(
      {
        success: false,
        code: 'UNSUPPORTED_CHECKOUT_CURRENCY',
        error: `Currency "${price.finalCurrency}" is not currently supported for direct checkout via Paystack. Please checkout using NGN or USD.`,
        resolvedCurrency: price.finalCurrency,
      },
      { status: 400 }
    );
  }

  // ── 6. Convert to Subunits ─────────────────────────────────────
  let subunitAmount: number;
  try {
    subunitAmount = convertToPaystackSubunits(price.finalAmount, price.finalCurrency);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Subunit calculation failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }

  // ── 7. Validate Application Association ────────────────────────
  const rawClientMetadata = (typeof body.metadata === 'object' && body.metadata !== null)
    ? (body.metadata as Record<string, unknown>)
    : {};

  const rawAppId = rawClientMetadata.application_id ?? body.applicationId;
  let validatedApplicationId: string | null = null;

  // Active course products strictly require an existing, validated application record
  const isCourseProduct = price.productType === 'programme' || ['professional', 'ai_training', 'ai_security'].includes(price.productId);

  if (isCourseProduct && (rawAppId === undefined || rawAppId === null || String(rawAppId).trim() === '')) {
    return NextResponse.json(
      {
        success: false,
        error: 'An application ID is required to enroll in training programmes. Please complete your application first before proceeding to payment.',
      },
      { status: 400 }
    );
  }

  if (rawAppId !== undefined && rawAppId !== null && String(rawAppId).trim() !== '') {
    const candidateAppId = String(rawAppId).trim();

    // 1. Validate UUID format against database column type
    if (!UUID_REGEX.test(candidateAppId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid application ID format. Expected a valid UUID.' },
        { status: 400 }
      );
    }

    // 2. Retrieve application record using server-side service-role client
    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json(
        { success: false, error: 'Database service is currently unavailable.' },
        { status: 500 }
      );
    }

    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, email, program, program_name')
      .eq('id', candidateAppId)
      .maybeSingle();

    if (appError) {
      console.error('[Paystack Init] Application verification error:', appError.message);
      return NextResponse.json(
        { success: false, error: 'Failed to verify application record.' },
        { status: 500 }
      );
    }

    if (!application) {
      return NextResponse.json(
        { success: false, error: `Application with ID "${candidateAppId}" not found.` },
        { status: 404 }
      );
    }

    // 3. Case-insensitive email match: Verify application belongs to the intended applicant
    const appEmail = (application.email || '').trim().toLowerCase();
    const reqEmail = customerEmail.trim().toLowerCase();
    if (appEmail !== reqEmail) {
      return NextResponse.json(
        {
          success: false,
          error: 'Applicant email does not match the registered application record.',
        },
        { status: 403 }
      );
    }

    // 4. Verify selected product matches application programme
    if (!isProgramMatch(application.program, application.program_name, price.productId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Selected product does not match registered application programme.',
        },
        { status: 400 }
      );
    }

    validatedApplicationId = application.id;
  }

  // ── 8. Sanitize Client-Supplied Metadata ───────────────────────
  // Strictly prevents client from overriding authoritative financial/audit keys
  const sanitizedClientMetadata: Record<string, unknown> = {};
  const prohibitedKeys = new Set([
    'amount',
    'currency',
    'product_id',
    'product_type',
    'product_label',
    'reference',
    'status',
    'application_id',
  ]);
  for (const [key, val] of Object.entries(rawClientMetadata)) {
    if (!prohibitedKeys.has(key)) {
      sanitizedClientMetadata[key] = val;
    }
  }

  // ── 9. Generate Reference & Persist Pending Record ─────────────
  const reference = generateTransactionReference();
  
  // Strict callback security: Enforces trusted application origin and approved path
  const callbackUrl = buildApprovedCallbackUrl(
    typeof body.callbackUrl === 'string' ? body.callbackUrl : undefined
  );

  try {
    await createPendingTransaction({
      reference,
      provider: 'paystack',
      provider_reference: null,
      customer_email: customerEmail,
      customer_name: customerName,
      user_id: sanitizeText(body.userId) || null,
      product_type: price.productType,
      product_id: price.productId,
      amount: price.finalAmount,
      currency: price.finalCurrency,
      pricing_model: price.pricingModel,
      base_amount: price.baseAmount,
      base_currency: price.baseCurrency,
      fx_rate: price.fxRate,
      status: 'pending',
      metadata: {
        ...sanitizedClientMetadata,
        ...(validatedApplicationId ? { application_id: validatedApplicationId } : {}),
        product_label: price.productLabel,
        effective_country: effectiveCountry,
        client_requested_country: clientRequestedCountry,
        server_detected_country: serverDetectedCountry,
        client_ip: ip,
        initialized_at: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    if (err instanceof DatabaseMigrationRequiredError) {
      return NextResponse.json(
        {
          success: false,
          code: 'DATABASE_MIGRATION_REQUIRED',
          error: err.message,
        },
        { status: 503 }
      );
    }
    console.error('[Paystack Init] Transaction insertion error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to record pending transaction.' },
      { status: 500 }
    );
  }

  // ── 10. Initialize with Paystack Gateway ───────────────────────
  try {
    const paystackResponse = await initializePaystackTransaction({
      email: customerEmail,
      amount: subunitAmount,
      currency: price.finalCurrency,
      reference,
      callback_url: callbackUrl,
      metadata: {
        product_id: price.productId,
        product_type: price.productType,
        product_label: price.productLabel,
        customer_name: customerName,
        reference,
        ...(validatedApplicationId ? { application_id: validatedApplicationId } : {}),
        custom_fields: [
          {
            display_name: 'Product',
            variable_name: 'product_label',
            value: price.productLabel,
          },
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: customerName || 'N/A',
          },
          ...(validatedApplicationId ? [{
            display_name: 'Application ID',
            variable_name: 'application_id',
            value: validatedApplicationId,
          }] : []),
        ],
      },
    });

    return NextResponse.json({
      success: true,
      reference,
      authorizationUrl: paystackResponse.data.authorization_url,
      accessCode: paystackResponse.data.access_code,
      amount: price.finalAmount,
      currency: price.finalCurrency,
      product: {
        id: price.productId,
        type: price.productType,
        label: price.productLabel,
      },
    });
  } catch (err: unknown) {
    const sanitizedError = sanitizeGatewayErrorMessage(err);
    console.error(
      `[Paystack Init Gateway Error] Reference: ${reference}, Category: ${sanitizedError.category}, Error: ${sanitizedError.message}`
    );

    // Update internal transaction to 'failed' state to maintain audit trail
    try {
      await updateTransactionStatus(reference, {
        status: 'failed',
        metadata: {
          gateway_init_error: sanitizedError.message,
          gateway_error_category: sanitizedError.category,
          gateway_init_failed_at: new Date().toISOString(),
        },
      });
    } catch (updateErr) {
      console.error('[Paystack Init] Failed to record failure state:', updateErr);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Payment gateway initialization failed. Please try again.',
      },
      { status: 502 }
    );
  }
}
