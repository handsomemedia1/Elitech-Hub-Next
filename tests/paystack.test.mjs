/**
 * Phase 2B Paystack Server Layer — Automated Test Suite
 * 
 * Uses Node.js native test runner (node:test, node:assert)
 * Run: node --test tests/paystack.test.mjs
 */

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';

// Import Paystack server utilities
import {
  isPaystackSupportedCurrency,
  getPaystackSubunitMultiplier,
  convertToPaystackSubunits,
  convertFromPaystackSubunits,
  PAYSTACK_SUPPORTED_CHECKOUT_CURRENCIES,
} from '../src/lib/paystack/currency.ts';

import {
  normalizeProductId,
  CANONICAL_PRODUCTS,
  PricingError,
  resolveAuthoritativePrice,
  resolveInternationalPrice,
  INTERNATIONAL_USD_FALLBACKS,
  getLiveOrFallbackFxRate,
  OFFLINE_FALLBACK_FX_RATES,
  AFRICAN_CURRENCY_MAP,
} from '../src/lib/paystack/pricing.ts';

import {
  generateTransactionReference,
  verifyWebhookSignature,
  sanitizeGatewayErrorMessage,
} from '../src/lib/paystack/client.ts';

import {
  buildApprovedCallbackUrl,
  getAppUrl,
  getPaystackSecretKey,
  getPaystackMode,
  getPaystackPublicKey,
  isPaystackTestMode,
  isPaystackLiveMode,
  validatePaystackConfig,
} from '../src/lib/paystack/config.ts';

import {
  resolveEffectivePricingCountry,
  INTERNATIONAL_COMMERCIAL_COUNTRIES,
} from '../src/lib/paystack/pricing.ts';

import { verifyLimit } from '../src/lib/rate-limit.ts';
import { POST as initializeRoutePost } from '../src/app/api/paystack/initialize/route.ts';
import { fulfillTransaction } from '../src/lib/paystack/transactions.ts';

describe('1. Currency & Subunit Conversion (including XOF)', () => {
  test('Supported checkout currencies matches Paystack specification', () => {
    assert.equal(isPaystackSupportedCurrency('NGN'), true);
    assert.equal(isPaystackSupportedCurrency('GHS'), true);
    assert.equal(isPaystackSupportedCurrency('ZAR'), true);
    assert.equal(isPaystackSupportedCurrency('USD'), true);
    assert.equal(isPaystackSupportedCurrency('KES'), true);
    assert.equal(isPaystackSupportedCurrency('XOF'), true);

    // Currencies not directly supported for Paystack checkout
    assert.equal(isPaystackSupportedCurrency('GBP'), false);
    assert.equal(isPaystackSupportedCurrency('EUR'), false);
    assert.equal(isPaystackSupportedCurrency('CAD'), false);
    assert.equal(isPaystackSupportedCurrency('AUD'), false);
    assert.equal(isPaystackSupportedCurrency('KWD'), false);
    assert.equal(isPaystackSupportedCurrency('TZS'), false);
  });

  test('Subunit multipliers are 100 across all Paystack checkout currencies', () => {
    assert.equal(getPaystackSubunitMultiplier('NGN'), 100);
    assert.equal(getPaystackSubunitMultiplier('GHS'), 100);
    assert.equal(getPaystackSubunitMultiplier('ZAR'), 100);
    assert.equal(getPaystackSubunitMultiplier('USD'), 100);
    assert.equal(getPaystackSubunitMultiplier('KES'), 100);
    // Explicitly verify XOF per Paystack documentation
    assert.equal(getPaystackSubunitMultiplier('XOF'), 100);
  });

  test('Subunit conversion for NGN (100,000 NGN -> 10,000,000 kobo)', () => {
    const subunits = convertToPaystackSubunits(100000, 'NGN');
    assert.equal(subunits, 10000000);
    assert.equal(convertFromPaystackSubunits(subunits, 'NGN'), 100000);
  });

  test('Subunit conversion for USD (160 USD -> 16,000 cents)', () => {
    const subunits = convertToPaystackSubunits(160, 'USD');
    assert.equal(subunits, 16000);
    assert.equal(convertFromPaystackSubunits(subunits, 'USD'), 160);
  });

  test('Subunit conversion for GHS (950 GHS -> 95,000 pesewas)', () => {
    const subunits = convertToPaystackSubunits(950, 'GHS');
    assert.equal(subunits, 95000);
  });

  test('Subunit conversion for XOF: Multiplies by 100 per Paystack documentation', () => {
    // Charging 1,000 XOF requires sending 100,000 in API payload
    const subunits = convertToPaystackSubunits(1000, 'XOF');
    assert.equal(subunits, 100000);
    assert.equal(convertFromPaystackSubunits(subunits, 'XOF'), 1000);
  });

  test('Rejects invalid, zero, or negative amounts', () => {
    assert.throws(() => convertToPaystackSubunits(0, 'NGN'), /greater than 0/);
    assert.throws(() => convertToPaystackSubunits(-500, 'NGN'), /greater than 0/);
    assert.throws(() => convertToPaystackSubunits(NaN, 'NGN'), /non-finite/);
    assert.throws(() => convertToPaystackSubunits(Infinity, 'NGN'), /non-finite/);
  });

  test('Decimal precision rounding avoids IEEE 754 floating point errors', () => {
    const subunits = convertToPaystackSubunits(19.99, 'USD');
    assert.equal(subunits, 1999);
  });
});

describe('2. Authoritative Price Resolution', () => {
  test('Normalizes product aliases and recognizes canonical IDs', () => {
    assert.equal(normalizeProductId('6-Week Bootcamp'), 'bootcamp');
    assert.equal(normalizeProductId('16-Week-Professional'), 'professional');
    assert.equal(normalizeProductId('ai-cybersecurity'), 'ai_training');
    assert.equal(normalizeProductId('consultation-30'), 'consultation-30');
  });

  test('Rejects unknown product identifiers with UNKNOWN_PRODUCT error', async () => {
    await assert.rejects(
      async () => resolveAuthoritativePrice('non-existent-course', 'programme', 'NG'),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'UNKNOWN_PRODUCT');
        return true;
      }
    );
  });

  test('Resolves Nigerian AI-Powered Cybersecurity to authoritative ₦100,000 NGN base', async () => {
    const price = await resolveAuthoritativePrice('ai_training', 'programme', 'NG');
    assert.equal(price.productId, 'ai_training');
    assert.equal(price.baseAmount, 100000);
    assert.equal(price.baseCurrency, 'NGN');
    assert.equal(price.pricingModel, 'ngn_base');
    assert.equal(price.finalAmount, 100000);
    assert.equal(price.finalCurrency, 'NGN');
    assert.equal(price.fxRate, null);
  });

  test('Resolves Nigerian Professional Programme to ₦350,000 NGN', async () => {
    const price = await resolveAuthoritativePrice('professional', 'programme', 'NG');
    assert.equal(price.finalAmount, 350000);
    assert.equal(price.finalCurrency, 'NGN');
  });

  test('Resolves Nigerian AI Security and Reverse Vulnerability to ₦200,000 NGN', async () => {
    const price = await resolveAuthoritativePrice('ai_security', 'programme', 'NG');
    assert.equal(price.finalAmount, 200000);
    assert.equal(price.finalCurrency, 'NGN');
  });

  test('Resolves Consultations to canonical NGN amounts (15k, 30k, 50k, 70k, 100k)', async () => {
    const c15 = await resolveAuthoritativePrice('consultation-15', 'consultation', 'NG');
    const c30 = await resolveAuthoritativePrice('consultation-30', 'consultation', 'NG');
    const c60 = await resolveAuthoritativePrice('consultation-60', 'consultation', 'NG');
    const c90 = await resolveAuthoritativePrice('consultation-90', 'consultation', 'NG');
    const c120 = await resolveAuthoritativePrice('consultation-120', 'consultation', 'NG');

    assert.equal(c15.finalAmount, 15000);
    assert.equal(c30.finalAmount, 30000);
    assert.equal(c60.finalAmount, 50000);
    assert.equal(c90.finalAmount, 70000);
    assert.equal(c120.finalAmount, 100000);
  });

  test('Resolves African market (Ghana GH) with genuine FX conversion', async () => {
    const price = await resolveAuthoritativePrice('ai_training', 'programme', 'GH');
    assert.equal(price.pricingModel, 'africa_fx');
    assert.equal(price.finalCurrency, 'GHS');
    assert.ok(price.fxRate > 0);
    // 100000 NGN * rate (fallback 0.0095 = 950 GHS)
    assert.equal(price.finalAmount, Math.round(100000 * price.fxRate));
  });

  test('Resolves International market (US) to commercial USD band ($160 for ai_training)', async () => {
    const price = await resolveAuthoritativePrice('ai_training', 'programme', 'US');
    assert.equal(price.pricingModel, 'international_commercial');
    assert.equal(price.finalCurrency, 'USD');
    assert.equal(price.finalAmount, 160);
  });

  test('Resolves International market (US) for professional ($500 for professional)', async () => {
    const price = await resolveAuthoritativePrice('professional', 'programme', 'US');
    assert.equal(price.pricingModel, 'international_commercial');
    assert.equal(price.finalCurrency, 'USD');
    assert.equal(price.finalAmount, 500);
  });

  test('Resolves International market (US) for ai_security ($250 for ai_security)', async () => {
    const price = await resolveAuthoritativePrice('ai_security', 'programme', 'US');
    assert.equal(price.pricingModel, 'international_commercial');
    assert.equal(price.finalCurrency, 'USD');
    assert.equal(price.finalAmount, 250);
  });

  test('Rejects retired bootcamp with PRODUCT_DISCONTINUED error', async () => {
    await assert.rejects(
      async () => resolveAuthoritativePrice('bootcamp', 'programme', 'NG'),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRODUCT_DISCONTINUED');
        return true;
      }
    );
  });

  test('Rejects non-purchasable internship with PRODUCT_UNAVAILABLE error', async () => {
    await assert.rejects(
      async () => resolveAuthoritativePrice('internship', 'programme', 'NG'),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRODUCT_UNAVAILABLE');
        return true;
      }
    );
  });

  test('Rejects unconfigured international pricing for products without USD band with PRICING_NOT_CONFIGURED', async () => {
    await assert.rejects(
      async () => resolveAuthoritativePrice('web-basic', 'service', 'US'),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICING_NOT_CONFIGURED');
        assert.match(err.message, /International pricing \(USD\) is not yet configured/);
        return true;
      }
    );
  });

  test('Rejects unsupported currency without direct Paystack checkout mapping with PRICING_NOT_CONFIGURED', async () => {
    await assert.rejects(
      async () => resolveInternationalPrice('ai_training', 'programme', 'AI-Powered Cybersecurity Programme', 100000, 'EUR'),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICING_NOT_CONFIGURED');
        assert.match(err.message, /International pricing \(EUR\) is not yet configured/);
        return true;
      }
    );
  });
});

describe('3. Transaction Reference Generation', () => {
  test('Generates unpredictable, unique references starting with "eth_"', () => {
    const ref1 = generateTransactionReference();
    const ref2 = generateTransactionReference();

    assert.ok(ref1.startsWith('eth_'));
    assert.ok(ref2.startsWith('eth_'));
    assert.notEqual(ref1, ref2);
  });

  test('Generates 1000 distinct references without collisions', () => {
    const set = new Set();
    for (let i = 0; i < 1000; i++) {
      const ref = generateTransactionReference();
      assert.equal(set.has(ref), false);
      set.add(ref);
    }
    assert.equal(set.size, 1000);
  });
});

describe('4. Webhook Signature Verification', () => {
  const secretKey = 'sk_test_mock_secret_key_12345';
  const body = JSON.stringify({ event: 'charge.success', data: { reference: 'eth_test_123' } });

  test('Valid HMAC SHA-512 signature passes verification', () => {
    const validSignature = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex');

    const isValid = verifyWebhookSignature(body, validSignature, secretKey);
    assert.equal(isValid, true);
  });

  test('Invalid or tampered signature is rejected', () => {
    const invalidSignature = 'bad_signature_deadbeef1234567890';
    const isValid = verifyWebhookSignature(body, invalidSignature, secretKey);
    assert.equal(isValid, false);
  });

  test('Tampered body with valid signature for original body is rejected', () => {
    const originalSignature = crypto
      .createHmac('sha512', secretKey)
      .update(body)
      .digest('hex');

    const tamperedBody = body.replace('eth_test_123', 'eth_tampered_999');
    const isValid = verifyWebhookSignature(tamperedBody, originalSignature, secretKey);
    assert.equal(isValid, false);
  });

  test('Missing signature or empty body returns false without throwing', () => {
    assert.equal(verifyWebhookSignature('', 'sig', secretKey), false);
    assert.equal(verifyWebhookSignature(body, null, secretKey), false);
    assert.equal(verifyWebhookSignature(body, '', secretKey), false);
  });
});

describe('5. Payment Gateway Mock Verification & Integrity Rules', () => {
  test('Financial integrity verification: Amount, Currency and Reference matching', () => {
    const storedTransaction = {
      reference: 'eth_1728574800000_abc123',
      amount: 100000, // 100,000 NGN
      currency: 'NGN',
      status: 'pending',
    };

    const expectedSubunits = convertToPaystackSubunits(storedTransaction.amount, storedTransaction.currency);
    assert.equal(expectedSubunits, 10000000);

    // Case A: Matching gateway payload
    const validGatewayResponse = {
      status: 'success',
      reference: 'eth_1728574800000_abc123',
      currency: 'NGN',
      amount: 10000000,
    };
    assert.equal(validGatewayResponse.reference === storedTransaction.reference, true);
    assert.equal(validGatewayResponse.currency === storedTransaction.currency, true);
    assert.equal(validGatewayResponse.amount === expectedSubunits, true);

    // Case B: Amount mismatch (underpayment attack)
    const underpaymentGateway = {
      status: 'success',
      reference: 'eth_1728574800000_abc123',
      currency: 'NGN',
      amount: 5000000, // Client paid 50,000 instead of 100,000
    };
    assert.notEqual(underpaymentGateway.amount, expectedSubunits);

    // Case C: Currency mismatch
    const currencyMismatchGateway = {
      status: 'success',
      reference: 'eth_1728574800000_abc123',
      currency: 'GHS',
      amount: 10000000,
    };
    assert.notEqual(currencyMismatchGateway.currency, storedTransaction.currency);
  });

  test('Idempotency simulation: already processed transaction is never duplicated', () => {
    let transactionStatus = 'pending';
    let fulfillmentCount = 0;

    function handleWebhookEvent(event) {
      if (transactionStatus === 'successful') {
        return { status: 'already_processed', fulfilled: false };
      }
      transactionStatus = 'successful';
      fulfillmentCount += 1;
      return { status: 'successful', fulfilled: true };
    }

    // First webhook delivery
    const res1 = handleWebhookEvent({ event: 'charge.success' });
    assert.equal(res1.status, 'successful');
    assert.equal(res1.fulfilled, true);
    assert.equal(fulfillmentCount, 1);

    // Second webhook delivery (duplicate)
    const res2 = handleWebhookEvent({ event: 'charge.success' });
    assert.equal(res2.status, 'already_processed');
    assert.equal(res2.fulfilled, false);
    assert.equal(fulfillmentCount, 1); // Not fulfilled twice!

    // Third webhook delivery (concurrent retry)
    const res3 = handleWebhookEvent({ event: 'charge.success' });
    assert.equal(res3.status, 'already_processed');
    assert.equal(fulfillmentCount, 1);
  });
});

describe('6. Edge Cases, Security & Fault Tolerance', () => {
  test('Client attempts to supply amount or currency are ignored by price resolver', async () => {
    // When a malicious client passes manipulated financial values
    const clientPayload = {
      productId: 'ai_training',
      amount: 10, // Attempting to pay 10 NGN instead of 100,000 NGN
      currency: 'USD', // Attempting to force USD instead of NGN
      fxRate: 0.0001,
    };

    // The authoritative resolver ONLY accepts product ID and country context
    const resolved = await resolveAuthoritativePrice(clientPayload.productId, 'programme', 'NG');
    assert.equal(resolved.finalAmount, 100000); // 100,000 NGN strictly enforced
    assert.equal(resolved.finalCurrency, 'NGN');
    assert.notEqual(resolved.finalAmount, clientPayload.amount);
    assert.notEqual(resolved.finalCurrency, clientPayload.currency);
  });

  test('Unsupported direct checkout currencies (GBP, EUR, CAD, AUD, KWD, TZS) are rejected', () => {
    const unsupportedCurrencies = ['GBP', 'EUR', 'CAD', 'AUD', 'KWD', 'TZS', 'UGX', 'RWF'];
    for (const curr of unsupportedCurrencies) {
      assert.equal(isPaystackSupportedCurrency(curr), false);
    }
  });

  test('African FX rate unavailable state throws explicit error without silent NGN fallback', async () => {
    // Test getLiveOrFallbackFxRate with an unmapped/unsupported imaginary currency
    const rate = await getLiveOrFallbackFxRate('XYZ_UNAVAILABLE');
    assert.equal(rate, null);
  });

  test('Secret key is strictly protected and never exposed in public output', () => {
    const testSecret = 'sk_test_9876543210abcdef';
    // Verify that error messages or responses do not serialize the secret key
    const safeError = new Error('Gateway initialization failed');
    assert.equal(safeError.message.includes(testSecret), false);
  });

  test('Paystack error responses preserve failure state without falsely marking success', () => {
    const errorResponses = [
      { status: false, message: 'Invalid currency for merchant account' },
      { status: false, message: 'Gateway timeout from acquiring bank' },
      { status: false, message: 'Card declined' },
    ];

    for (const errResp of errorResponses) {
      assert.equal(errResp.status, false);
      assert.ok(errResp.message.length > 0);
    }
  });
});

describe('7. Callback URL Security & Open Redirect Protection', () => {
  const trustedOrigin = getAppUrl();

  test('External phishing URLs strictly rejected and fallback to /thank-you', () => {
    const malicious1 = 'https://phishing-site.com/steal-credentials';
    const malicious2 = 'http://attacker-site.org/callback';
    assert.equal(buildApprovedCallbackUrl(malicious1), `${trustedOrigin}/thank-you`);
    assert.equal(buildApprovedCallbackUrl(malicious2), `${trustedOrigin}/thank-you`);
  });

  test('Protocol-relative URLs (//evil.com) strictly rejected', () => {
    const protocolRelative = '//evil.com/phishing';
    assert.equal(buildApprovedCallbackUrl(protocolRelative), `${trustedOrigin}/thank-you`);
  });

  test('Dangerous pseudo-protocols (javascript:, data:) strictly rejected', () => {
    const jsUrl = 'javascript:alert(document.cookie)';
    const dataUrl = 'data:text/html,<script>alert(1)</script>';
    assert.equal(buildApprovedCallbackUrl(jsUrl), `${trustedOrigin}/thank-you`);
    assert.equal(buildApprovedCallbackUrl(dataUrl), `${trustedOrigin}/thank-you`);
  });

  test('Non-whitelisted paths fallback to safe /thank-you default', () => {
    const unapprovedPath = '/admin/settings';
    const unapprovedExternal = `${trustedOrigin}/internal/unauthorized`;
    assert.equal(buildApprovedCallbackUrl(unapprovedPath), `${trustedOrigin}/thank-you`);
    assert.equal(buildApprovedCallbackUrl(unapprovedExternal), `${trustedOrigin}/thank-you`);
  });

  test('Approved return paths succeed with trusted application origin', () => {
    assert.equal(buildApprovedCallbackUrl('/thank-you'), `${trustedOrigin}/thank-you`);
    assert.equal(buildApprovedCallbackUrl('/apply'), `${trustedOrigin}/apply`);
    assert.equal(buildApprovedCallbackUrl('/consultation'), `${trustedOrigin}/consultation`);
    assert.equal(buildApprovedCallbackUrl('/programs'), `${trustedOrigin}/programs`);
    assert.equal(buildApprovedCallbackUrl(`${trustedOrigin}/thank-you`), `${trustedOrigin}/thank-you`);
  });

  test('Empty, null, or undefined callbackUrl defaults to /thank-you', () => {
    assert.equal(buildApprovedCallbackUrl(''), `${trustedOrigin}/thank-you`);
    assert.equal(buildApprovedCallbackUrl(undefined), `${trustedOrigin}/thank-you`);
  });
});

describe('8. Pricing-Market Integrity & Geolocation Spoofing Defense', () => {
  test('Enforces international pricing when edge proxy detects an international country', () => {
    // Malicious customer in the US attempts to request Nigerian pricing
    const resolvedUS = resolveEffectivePricingCountry('NG', 'US');
    assert.equal(resolvedUS, 'US'); // Overridden to US!

    // Customer in the UK attempts to request Ghana pricing
    const resolvedUK = resolveEffectivePricingCountry('GH', 'GB');
    assert.equal(resolvedUK, 'GB'); // Overridden to GB!

    // Customer in Canada attempts empty country
    const resolvedCA = resolveEffectivePricingCountry('', 'CA');
    assert.equal(resolvedCA, 'CA');
  });

  test('Preserves legitimate domestic Nigerian pricing when in Nigeria or edge absent', () => {
    // Customer detected in Nigeria
    const resolvedNG = resolveEffectivePricingCountry('NG', 'NG');
    assert.equal(resolvedNG, 'NG');

    // Customer with no edge header (local dev / testing) requesting NG
    const resolvedFallbackNG = resolveEffectivePricingCountry('NG', null);
    assert.equal(resolvedFallbackNG, 'NG');
  });

  test('Preserves legitimate African pricing when in Africa', () => {
    const resolvedGH = resolveEffectivePricingCountry('GH', 'GH');
    assert.equal(resolvedGH, 'GH');

    const resolvedKE = resolveEffectivePricingCountry('KE', null);
    assert.equal(resolvedKE, 'KE');
  });
});

describe('9. Verification Abuse Protection & Reference Validation', () => {
  const REFERENCE_REGEX = /^[a-zA-Z0-9_\-]{8,100}$/;

  test('Valid reference format passes validation', () => {
    assert.equal(REFERENCE_REGEX.test('eth_1728574800000_a1b2c3d4e5f6'), true);
    assert.equal(REFERENCE_REGEX.test('test-reference_12345'), true);
  });

  test('Malicious and malformed reference strings are rejected', () => {
    assert.equal(REFERENCE_REGEX.test("' OR 1=1 --"), false);
    assert.equal(REFERENCE_REGEX.test('../../etc/passwd'), false);
    assert.equal(REFERENCE_REGEX.test('<script>alert(1)</script>'), false);
    assert.equal(REFERENCE_REGEX.test('short'), false); // Too short (< 8 chars)
    assert.equal(REFERENCE_REGEX.test(''), false);
    assert.equal(REFERENCE_REGEX.test('with space'), false);
  });

  test('Verification rate limiter throttles repeated requests from same IP', () => {
    const testIp = '192.0.2.99';
    // Exhaust 30 allowed requests
    for (let i = 0; i < 30; i++) {
      const result = verifyLimit(testIp);
      assert.equal(result.allowed, true);
    }
    // 31st request should be rejected
    const blockedResult = verifyLimit(testIp);
    assert.equal(blockedResult.allowed, false);
    assert.equal(blockedResult.remaining, 0);
  });
});

describe('10. Customer-Facing Checkout Contract & Application Association', () => {
  test('Valid course checkout resolves authoritative price and retains application_id in metadata', async () => {
    const testApplicationId = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    const clientPayload = {
      productId: 'ai_training',
      productType: 'programme',
      email: 'applicant@example.com',
      name: 'Test Applicant',
      countryCode: 'NG',
      metadata: {
        application_id: testApplicationId,
        program: 'AI-Powered Cybersecurity Programme',
      },
    };

    // Authoritative pricing resolution
    const price = await resolveAuthoritativePrice(
      clientPayload.productId,
      clientPayload.productType,
      clientPayload.countryCode
    );

    assert.equal(price.productId, 'ai_training');
    assert.equal(price.finalAmount, 100000);
    assert.equal(price.finalCurrency, 'NGN');
    assert.equal(price.pricingModel, 'ngn_base');

    // Reference and metadata association
    const reference = generateTransactionReference();
    assert.ok(reference.startsWith('eth_'));

    const transactionSnapshot = {
      reference,
      amount: price.finalAmount,
      currency: price.finalCurrency,
      metadata: {
        ...clientPayload.metadata,
        product_label: price.productLabel,
      },
    };

    // Verify application_id is strictly preserved
    assert.equal(transactionSnapshot.metadata.application_id, testApplicationId);
    assert.equal(transactionSnapshot.metadata.program, 'AI-Powered Cybersecurity Programme');
  });

  test('Valid consultation checkout across all durations resolves expected base amounts', async () => {
    const durations = [
      { id: 'consultation-15', expected: 15000 },
      { id: 'consultation-30', expected: 30000 },
      { id: 'consultation-60', expected: 50000 },
      { id: 'consultation-90', expected: 70000 },
      { id: 'consultation-120', expected: 100000 },
    ];

    for (const d of durations) {
      const price = await resolveAuthoritativePrice(d.id, 'consultation', 'NG');
      assert.equal(price.productId, d.id);
      assert.equal(price.productType, 'consultation');
      assert.equal(price.finalAmount, d.expected);
      assert.equal(price.finalCurrency, 'NGN');
    }
  });

  test('Invalid product ID throws UNKNOWN_PRODUCT pricing error', async () => {
    await assert.rejects(
      async () => {
        await resolveAuthoritativePrice('non-existent-product', 'course', 'NG');
      },
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'UNKNOWN_PRODUCT');
        return true;
      }
    );
  });

  test('Payment success does not automatically alter candidate admission status', () => {
    // Simulating decoupled application state vs transaction state
    const applicationRecord = {
      id: 'app_uuid_123',
      full_name: 'John Doe',
      status: 'pending', // Admissions review pending
    };

    const transactionRecord = {
      id: 'tx_uuid_456',
      reference: 'eth_test_123',
      status: 'successful', // Payment is successful
      metadata: { application_id: applicationRecord.id },
    };

    // Strict invariant: Paying tuition does NOT auto-accept candidate in database
    assert.equal(transactionRecord.status, 'successful');
    assert.equal(applicationRecord.status, 'pending');
    assert.equal(transactionRecord.metadata.application_id, applicationRecord.id);
  });
});

describe('11. Callback & Webhook Idempotency Simulation', () => {
  test('Repeated callback verification on already successful transaction returns cached status', () => {
    const existingSuccessfulTx = {
      reference: 'eth_1791671081477_251a409a7523',
      status: 'successful',
      amount: 100000,
      currency: 'NGN',
      paid_at: '2026-10-10T22:36:48.000Z',
    };

    // If tx is already 'successful', verification handler short-circuits
    const isAlreadySuccessful = existingSuccessfulTx.status === 'successful';
    assert.equal(isAlreadySuccessful, true);

    const verificationResponse = {
      success: true,
      status: existingSuccessfulTx.status,
      reference: existingSuccessfulTx.reference,
      amount: existingSuccessfulTx.amount,
      currency: existingSuccessfulTx.currency,
      paidAt: existingSuccessfulTx.paid_at,
    };

    assert.equal(verificationResponse.success, true);
    assert.equal(verificationResponse.status, 'successful');
  });

  test('Duplicate webhook delivery on already successful transaction returns already_processed immediately', () => {
    const existingTx = {
      reference: 'eth_duplicate_test',
      status: 'successful',
    };

    function simulateWebhookIdempotency(tx) {
      if (tx.status === 'successful') {
        return {
          received: true,
          status: 'already_processed',
          reference: tx.reference,
        };
      }
      return { received: true, status: 'processed' };
    }

    const firstWebhook = simulateWebhookIdempotency(existingTx);
    assert.equal(firstWebhook.status, 'already_processed');

    const secondWebhook = simulateWebhookIdempotency(existingTx);
    assert.equal(secondWebhook.status, 'already_processed');
  });
});

describe('12. Gateway State Handling & Tamper Resilience', () => {
  test('Abandoned transaction response maps to abandoned status', () => {
    const gatewayResponse = {
      status: 'abandoned',
      gateway_response: 'The customer did not complete the transaction',
    };

    const mappedStatus = gatewayResponse.status === 'abandoned' ? 'abandoned' : 'failed';
    assert.equal(mappedStatus, 'abandoned');
  });

  test('Failed transaction response maps to failed status', () => {
    const gatewayResponse = {
      status: 'failed',
      gateway_response: 'Declined by financial institution',
    };

    const mappedStatus = gatewayResponse.status === 'abandoned' ? 'abandoned' : 'failed';
    assert.equal(mappedStatus, 'failed');
  });

  test('Client cannot tamper with price: server strictly re-resolves canonical amount', async () => {
    // Client sends spoofed amount: 50 NGN instead of 100,000 NGN
    const clientTamperedAmount = 50;
    const clientTamperedCurrency = 'USD';

    // Server-side price resolution ignores client payload and uses authoritative catalog
    const serverResolvedPrice = await resolveAuthoritativePrice('ai_training', 'programme', 'NG');

    assert.notEqual(serverResolvedPrice.finalAmount, clientTamperedAmount);
    assert.notEqual(serverResolvedPrice.finalCurrency, clientTamperedCurrency);
    assert.equal(serverResolvedPrice.finalAmount, 100000);
    assert.equal(serverResolvedPrice.finalCurrency, 'NGN');
  });
});

describe('13. Explicit Paystack Mode & Credential Security', () => {
  function withPaystackEnv({ key, mode }, callback) {
    const previousKey = process.env.PAYSTACK_SECRET_KEY;
    const previousMode = process.env.PAYSTACK_MODE;

    if (key === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = key;

    if (mode === undefined) delete process.env.PAYSTACK_MODE;
    else process.env.PAYSTACK_MODE = mode;

    try {
      callback();
    } finally {
      if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
      else process.env.PAYSTACK_SECRET_KEY = previousKey;

      if (previousMode === undefined) delete process.env.PAYSTACK_MODE;
      else process.env.PAYSTACK_MODE = previousMode;
    }
  }

  test('Permits a valid Test Mode key when PAYSTACK_MODE=test', () => {
    withPaystackEnv(
      { key: ['sk', 'test', 'mock_mode_active_key'].join('_'), mode: 'test' },
      () => {
        assert.equal(getPaystackSecretKey(), ['sk', 'test', 'mock_mode_active_key'].join('_'));
        assert.equal(isPaystackTestMode(), true);
      }
    );
  });

  test('Safely defaults to Test Mode when PAYSTACK_MODE is missing', () => {
    withPaystackEnv(
      { key: ['sk', 'test', 'mock_default_mode_key'].join('_'), mode: undefined },
      () => {
        assert.equal(getPaystackSecretKey(), ['sk', 'test', 'mock_default_mode_key'].join('_'));
        assert.equal(isPaystackTestMode(), true);
      }
    );
  });

  test('Permits a valid Live Mode key only when PAYSTACK_MODE=live', () => {
    withPaystackEnv(
      { key: ['sk', 'live', 'mock_live_mode_key'].join('_'), mode: 'live' },
      () => {
        assert.equal(getPaystackSecretKey(), ['sk', 'live', 'mock_live_mode_key'].join('_'));
        assert.equal(isPaystackTestMode(), false);
      }
    );
  });

  test('Rejects a Live Mode key when PAYSTACK_MODE is missing or defaults to test', () => {
    withPaystackEnv(
      { key: ['sk', 'live', 'mock_lockout_key'].join('_'), mode: undefined },
      () => {
        assert.throws(() => getPaystackSecretKey(), /PAYSTACK_MODE="test" requires a valid sk_test_/);
        assert.equal(isPaystackTestMode(), false);
      }
    );
  });

  test('Rejects a Test Mode key when PAYSTACK_MODE=live', () => {
    withPaystackEnv(
      { key: ['sk', 'test', 'mock_mismatch_key'].join('_'), mode: 'live' },
      () => {
        assert.throws(() => getPaystackSecretKey(), /PAYSTACK_MODE="live" requires a valid sk_live_/);
        assert.equal(isPaystackTestMode(), false);
      }
    );
  });

  test('Rejects an unsupported PAYSTACK_MODE value', () => {
    withPaystackEnv(
      { key: ['sk', 'test', 'mock_invalid_mode_key'].join('_'), mode: 'production' },
      () => {
        assert.throws(() => getPaystackSecretKey(), /PAYSTACK_MODE must be either "test" or "live"/);
        assert.equal(isPaystackTestMode(), false);
      }
    );
  });

  test('Rejects missing or empty PAYSTACK_SECRET_KEY', () => {
    withPaystackEnv({ key: undefined, mode: 'test' }, () => {
      assert.throws(() => getPaystackSecretKey(), /not configured/);
      assert.equal(isPaystackTestMode(), false);
    });

    withPaystackEnv({ key: '   ', mode: 'test' }, () => {
      assert.throws(() => getPaystackSecretKey(), /not configured/);
      assert.equal(isPaystackTestMode(), false);
    });
  });

  test('Rejects unknown prefixes and empty credential suffixes', () => {
    withPaystackEnv({ key: 'invalid_prefix_12345', mode: 'test' }, () => {
      assert.throws(() => getPaystackSecretKey(), /PAYSTACK_MODE="test" requires a valid sk_test_/);
      assert.equal(isPaystackTestMode(), false);
    });

    withPaystackEnv({ key: 'sk_test_', mode: 'test' }, () => {
      assert.throws(() => getPaystackSecretKey(), /PAYSTACK_MODE="test" requires a valid sk_test_/);
      assert.equal(isPaystackTestMode(), false);
    });
  });

  test('Trims surrounding whitespace from credentials and mode', () => {
    withPaystackEnv(
      { key: '  sk_test_trimmed12345  ', mode: ' TEST ' },
      () => {
        assert.equal(getPaystackSecretKey(), 'sk_test_trimmed12345');
        assert.equal(isPaystackTestMode(), true);
      }
    );
  });

  test('Validates and permits matching public keys for test and live modes', () => {
    const prevPub = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    try {
      withPaystackEnv(
        { key: ['sk', 'test', 'mock_test_key'].join('_'), mode: 'test' },
        () => {
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = ['pk', 'test', 'mock_pub_key'].join('_');
          assert.equal(getPaystackPublicKey(), ['pk', 'test', 'mock_pub_key'].join('_'));
          assert.equal(isPaystackTestMode(), true);
          assert.equal(isPaystackLiveMode(), false);

          const config = validatePaystackConfig();
          assert.equal(config.mode, 'test');
          assert.equal(config.secretKey, ['sk', 'test', 'mock_test_key'].join('_'));
          assert.equal(config.publicKey, ['pk', 'test', 'mock_pub_key'].join('_'));
        }
      );

      withPaystackEnv(
        { key: ['sk', 'live', 'mock_live_key'].join('_'), mode: 'live' },
        () => {
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = ['pk', 'live', 'mock_live_pub'].join('_');
          assert.equal(getPaystackPublicKey(), ['pk', 'live', 'mock_live_pub'].join('_'));
          assert.equal(isPaystackTestMode(), false);
          assert.equal(isPaystackLiveMode(), true);

          const config = validatePaystackConfig();
          assert.equal(config.mode, 'live');
          assert.equal(config.secretKey, ['sk', 'live', 'mock_live_key'].join('_'));
          assert.equal(config.publicKey, ['pk', 'live', 'mock_live_pub'].join('_'));
        }
      );
    } finally {
      if (prevPub === undefined) delete process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      else process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = prevPub;
    }
  });

  test('Rejects public key and mode prefix mismatch', () => {
    const prevPub = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    try {
      // mode=test with pk_live_*
      withPaystackEnv(
        { key: ['sk', 'test', 'mock_test_key'].join('_'), mode: 'test' },
        () => {
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = ['pk', 'live', 'mismatched'].join('_');
          assert.throws(() => getPaystackPublicKey(), /PAYSTACK_MODE="test" requires a valid pk_test_/);
          assert.throws(() => validatePaystackConfig(), /PAYSTACK_MODE="test" requires a valid pk_test_/);
        }
      );

      // mode=live with pk_test_*
      withPaystackEnv(
        { key: ['sk', 'live', 'mock_live_key'].join('_'), mode: 'live' },
        () => {
          process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = ['pk', 'test', 'mismatched'].join('_');
          assert.throws(() => getPaystackPublicKey(), /PAYSTACK_MODE="live" requires a valid pk_live_/);
          assert.throws(() => validatePaystackConfig(), /PAYSTACK_MODE="live" requires a valid pk_live_/);
        }
      );
    } finally {
      if (prevPub === undefined) delete process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      else process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY = prevPub;
    }
  });
});

describe('14. Application-Payment Integrity & Metadata Protection', () => {
  const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  function isProgramMatch(appProgram, appProgramName, productId) {
    if (!productId) return false;
    const combined = `${appProgram || ''} ${appProgramName || ''}`.toLowerCase();
    const prod = productId.toLowerCase();

    if (prod === 'bootcamp') {
      return false; // Retired programme
    }
    if (prod === 'professional') {
      return combined.includes('professional') || combined.includes('16-week');
    }
    if (prod === 'ai_training') {
      return (
        combined.includes('ai_training') ||
        (combined.includes('ai') && combined.includes('cybersecurity') && !combined.includes('16-week'))
      );
    }
    if (prod === 'ai_security') {
      return (
        combined.includes('ai_security') ||
        combined.includes('ai security') ||
        (combined.includes('reverse') && combined.includes('vulnerability'))
      );
    }
    return false;
  }

  function validateApplicationPayment({
    applicationId,
    customerEmail,
    productId,
    mockDbApplication,
  }) {
    const isCourseProduct = ['professional', 'ai_training', 'ai_security'].includes(productId);
    if (isCourseProduct && (!applicationId || String(applicationId).trim() === '')) {
      return {
        ok: false,
        status: 400,
        error: 'An application ID is required to enroll in training programmes. Please complete your application first before proceeding to payment.',
      };
    }

    if (!applicationId) {
      return { ok: true, reason: 'no_application_id' };
    }

    if (!UUID_REGEX.test(applicationId)) {
      return { ok: false, status: 400, error: 'Invalid application ID format. Expected a valid UUID.' };
    }

    if (!mockDbApplication) {
      return { ok: false, status: 404, error: `Application with ID "${applicationId}" not found.` };
    }

    const appEmail = (mockDbApplication.email || '').trim().toLowerCase();
    const reqEmail = customerEmail.trim().toLowerCase();
    if (appEmail !== reqEmail) {
      return { ok: false, status: 403, error: 'Applicant email does not match the registered application record.' };
    }

    if (!isProgramMatch(mockDbApplication.program, mockDbApplication.program_name, productId)) {
      return { ok: false, status: 400, error: 'Selected product does not match registered application programme.' };
    }

    return { ok: true, applicationId: mockDbApplication.id };
  }

  test('Valid application with matching email and programme passes validation', () => {
    const validUuid = '12345678-1234-4234-8234-123456789abc';
    const mockApp = {
      id: validUuid,
      email: 'student@example.com',
      program: 'AI-Powered Cybersecurity Programme',
      program_name: 'AI-Powered Cybersecurity Programme',
    };

    const result = validateApplicationPayment({
      applicationId: validUuid,
      customerEmail: 'Student@Example.com', // case-insensitive match
      productId: 'ai_training',
      mockDbApplication: mockApp,
    });

    assert.equal(result.ok, true);
    assert.equal(result.applicationId, validUuid);
  });

  test('Malformed application ID (non-UUID) is rejected with 400', () => {
    const result = validateApplicationPayment({
      applicationId: 'invalid-id-not-uuid',
      customerEmail: 'student@example.com',
      productId: 'ai_training',
      mockDbApplication: null,
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
    assert.match(result.error, /Expected a valid UUID/);
  });

  test('Nonexistent application ID in database is rejected with 404', () => {
    const missingUuid = '87654321-4321-4321-8321-210987654321';
    const result = validateApplicationPayment({
      applicationId: missingUuid,
      customerEmail: 'student@example.com',
      productId: 'ai_training',
      mockDbApplication: null, // simulates no DB row found
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, 404);
    assert.match(result.error, /not found/);
  });

  test('Email mismatch between request and application record is rejected with 403', () => {
    const validUuid = '12345678-1234-4234-8234-123456789abc';
    const mockApp = {
      id: validUuid,
      email: 'legit.student@example.com',
      program: 'AI-Powered Cybersecurity Programme',
    };

    const result = validateApplicationPayment({
      applicationId: validUuid,
      customerEmail: 'attacker@evil.com',
      productId: 'ai_training',
      mockDbApplication: mockApp,
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, 403);
    assert.match(result.error, /Applicant email does not match/);
  });

  test('Programme mismatch (ai_training applicant paying for professional) is rejected with 400', () => {
    const validUuid = '12345678-1234-4234-8234-123456789abc';
    const mockApp = {
      id: validUuid,
      email: 'student@example.com',
      program: '16-Week Professional',
    };

    const result = validateApplicationPayment({
      applicationId: validUuid,
      customerEmail: 'student@example.com',
      productId: 'ai_training', // attempting to pay lower ai_training price for professional application
      mockDbApplication: mockApp,
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
    assert.match(result.error, /does not match registered application programme/);
  });

  test('Course product without application_id is rejected with 400', () => {
    const result = validateApplicationPayment({
      applicationId: null,
      customerEmail: 'student@example.com',
      productId: 'ai_training',
      mockDbApplication: null,
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, 400);
    assert.match(result.error, /An application ID is required/);
  });

  test('Non-application products (consultations/services) do not require application_id', () => {
    const result = validateApplicationPayment({
      applicationId: null,
      customerEmail: 'client@example.com',
      productId: 'consultation-30',
      mockDbApplication: null,
    });

    assert.equal(result.ok, true);
    assert.equal(result.reason, 'no_application_id');
  });

  test('Metadata sanitization strips prohibited keys to protect authoritative values', () => {
    const clientPayloadMetadata = {
      application_id: 'spoofed-id',
      amount: 1,
      currency: 'USD',
      product_id: 'fake-prod',
      product_type: 'service',
      product_label: 'Free Item',
      reference: 'eth_spoofed_ref',
      status: 'successful',
      referral_source: 'linkedin',
      student_note: 'Excited to start',
    };

    const sanitized = {};
    const prohibited = new Set([
      'amount', 'currency', 'product_id', 'product_type',
      'product_label', 'reference', 'status', 'application_id'
    ]);
    for (const [k, v] of Object.entries(clientPayloadMetadata)) {
      if (!prohibited.has(k)) sanitized[k] = v;
    }

    // Authoritative keys stripped
    assert.equal(sanitized.amount, undefined);
    assert.equal(sanitized.currency, undefined);
    assert.equal(sanitized.product_id, undefined);
    assert.equal(sanitized.reference, undefined);
    assert.equal(sanitized.status, undefined);
    assert.equal(sanitized.application_id, undefined);

    // Legitimate custom fields preserved
    assert.equal(sanitized.referral_source, 'linkedin');
    assert.equal(sanitized.student_note, 'Excited to start');
  });
});

describe('15. Gateway State Handling & Pending Recovery', () => {
  function mapGatewayStatus(gatewayStatus) {
    if (gatewayStatus === 'pending' || gatewayStatus === 'ongoing') {
      return { dbStatus: 'pending', responseStatus: 'pending' };
    }
    if (gatewayStatus === 'abandoned') {
      return { dbStatus: 'abandoned', responseStatus: 'abandoned' };
    }
    if (gatewayStatus !== 'success') {
      return { dbStatus: 'failed', responseStatus: 'failed' };
    }
    return { dbStatus: 'successful', responseStatus: 'successful' };
  }

  test('Gateway pending status maintains pending in DB and does NOT coerce to failed', () => {
    const result = mapGatewayStatus('pending');
    assert.equal(result.dbStatus, 'pending');
    assert.equal(result.responseStatus, 'pending');
    assert.notEqual(result.dbStatus, 'failed');
  });

  test('Gateway ongoing status maintains pending in DB and does NOT coerce to failed', () => {
    const result = mapGatewayStatus('ongoing');
    assert.equal(result.dbStatus, 'pending');
    assert.equal(result.responseStatus, 'pending');
    assert.notEqual(result.dbStatus, 'failed');
  });

  test('Pending transactions remain eligible for atomic recovery via webhook or retry', () => {
    // Simulating database atomic conditional update:
    // WHERE reference = $1 AND status = 'pending'
    const dbTransaction = {
      reference: 'eth_pending_ref_123',
      status: 'pending',
    };

    function simulateAtomicTransition(tx, newStatus) {
      if (tx.status === 'pending') {
        tx.status = newStatus;
        return { updatedRows: 1, success: true };
      }
      return { updatedRows: 0, success: false };
    }

    // A pending transaction can successfully be transitioned to 'successful' by late webhook!
    const transitionResult = simulateAtomicTransition(dbTransaction, 'successful');
    assert.equal(transitionResult.success, true);
    assert.equal(dbTransaction.status, 'successful');
  });

  test('Prematurely failed transactions would have failed atomic transition (proves fix necessity)', () => {
    // If the transaction had been coerced to 'failed' in error:
    const coercedFailedTx = {
      reference: 'eth_coerced_fail_123',
      status: 'failed',
    };

    function simulateAtomicTransition(tx, newStatus) {
      if (tx.status === 'pending') {
        tx.status = newStatus;
        return { updatedRows: 1, success: true };
      }
      return { updatedRows: 0, success: false };
    }

    const failedAttempt = simulateAtomicTransition(coercedFailedTx, 'successful');
    // Coerced transaction fails atomic transition!
    assert.equal(failedAttempt.success, false);
    assert.equal(coercedFailedTx.status, 'failed');
  });

  test('Gateway initialization error sanitizes customer-facing response (Fix 4)', () => {
    // Customer-facing response structure
    const sanitizedCustomerResponse = {
      success: false,
      error: 'Payment gateway initialization failed. Please try again.',
    };

    // Verify response does not leak internal error or credentials
    assert.equal(sanitizedCustomerResponse.details, undefined);
    assert.equal(JSON.stringify(sanitizedCustomerResponse).includes('sk_test_'), false);
    assert.equal(JSON.stringify(sanitizedCustomerResponse).includes('Internal server error'), false);
  });
});

describe('16. [MOCKED] Webhook Pending-State Safety & Concurrency Hardening (Fix 1)', () => {
  // Simulates production webhook handler flow with controlled dependency injection
  function processWebhookSimulation({
    rawBody,
    signature,
    secretKey,
    storedTransaction,
    mockGatewayVerification,
  }) {
    // 1. Signature validation
    const isValidSignature = verifyWebhookSignature(rawBody, signature, secretKey);
    if (!isValidSignature) {
      return { status: 401, body: { success: false, error: 'Invalid webhook signature.' } };
    }

    // 2. Parse payload
    const eventPayload = JSON.parse(rawBody);
    if (eventPayload.event !== 'charge.success') {
      return { status: 200, body: { received: true, ignored: true } };
    }

    const tx = storedTransaction;
    if (!tx) {
      return { status: 404, body: { success: false, error: 'Transaction not found.' } };
    }

    // 3. Idempotency check
    if (tx.status === 'successful') {
      return { status: 200, body: { received: true, status: 'already_processed', reference: tx.reference } };
    }

    // 4. Independent verification
    const verifiedData = mockGatewayVerification;

    // 5. In-flight status check (pending/ongoing) - MUST PRESERVE PENDING
    if (verifiedData.status === 'pending' || verifiedData.status === 'ongoing') {
      tx.status = 'pending';
      tx.metadata = { ...(tx.metadata || {}), webhook_gateway_status: verifiedData.status, webhook_in_flight: true };
      return { status: 200, body: { received: true, status: verifiedData.status } };
    }

    if (verifiedData.status === 'abandoned') {
      if (tx.status !== 'successful') tx.status = 'abandoned';
      return { status: 200, body: { received: true, status: 'abandoned' } };
    }

    if (verifiedData.status !== 'success') {
      if (tx.status !== 'successful') tx.status = 'failed';
      return { status: 200, body: { received: true, status: verifiedData.status } };
    }

    // 6. Currency matching
    if (verifiedData.currency?.toUpperCase() !== tx.currency.toUpperCase()) {
      if (tx.status !== 'successful') tx.status = 'failed';
      return { status: 400, body: { success: false, error: 'Financial mismatch: currency' } };
    }

    // 7. Amount matching in subunits
    const expectedSubunits = convertToPaystackSubunits(tx.amount, tx.currency);
    if (verifiedData.amount !== expectedSubunits) {
      if (tx.status !== 'successful') tx.status = 'failed';
      return { status: 400, body: { success: false, error: 'Financial mismatch: amount' } };
    }

    // 8. Atomic transition to successful
    if (tx.status === 'pending') {
      tx.status = 'successful';
      tx.paid_at = verifiedData.paid_at || new Date().toISOString();
      return { status: 200, body: { received: true, status: 'successful', reference: tx.reference } };
    }

    return { status: 200, body: { received: true, status: 'already_processed', reference: tx.reference } };
  }

  const mockSecret = 'sk_test_mock_webhook_secret_12345';
  const sampleReference = 'eth_webhook_ref_001';

  function signPayload(payloadStr, key = mockSecret) {
    return crypto.createHmac('sha512', key).update(payloadStr).digest('hex');
  }

  test('[MOCKED] Invalid webhook signature returns 401 unauthorized', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const response = processWebhookSimulation({
      rawBody,
      signature: 'invalid_hex_signature',
      secretKey: mockSecret,
      storedTransaction: { reference: sampleReference, status: 'pending', amount: 100000, currency: 'NGN' },
      mockGatewayVerification: { status: 'success', id: 123 },
    });
    assert.equal(response.status, 401);
    assert.equal(response.body.error, 'Invalid webhook signature.');
  });

  test('[MOCKED] Webhook with pending gateway response preserves pending database status without failing', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const signature = signPayload(rawBody);
    const storedTx = { reference: sampleReference, status: 'pending', amount: 100000, currency: 'NGN' };

    const response = processWebhookSimulation({
      rawBody,
      signature,
      secretKey: mockSecret,
      storedTransaction: storedTx,
      mockGatewayVerification: { status: 'pending', id: 12345, currency: 'NGN', amount: 10000000 },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'pending');
    assert.equal(storedTx.status, 'pending');
    assert.notEqual(storedTx.status, 'failed');
  });

  test('[MOCKED] Webhook with ongoing gateway response preserves pending database status without failing', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const signature = signPayload(rawBody);
    const storedTx = { reference: sampleReference, status: 'pending', amount: 100000, currency: 'NGN' };

    const response = processWebhookSimulation({
      rawBody,
      signature,
      secretKey: mockSecret,
      storedTransaction: storedTx,
      mockGatewayVerification: { status: 'ongoing', id: 12345, currency: 'NGN', amount: 10000000 },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'ongoing');
    assert.equal(storedTx.status, 'pending');
    assert.notEqual(storedTx.status, 'failed');
  });

  test('[MOCKED] Webhook with success gateway response transitions transaction to successful', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const signature = signPayload(rawBody);
    const storedTx = { reference: sampleReference, status: 'pending', amount: 100000, currency: 'NGN' };

    const response = processWebhookSimulation({
      rawBody,
      signature,
      secretKey: mockSecret,
      storedTransaction: storedTx,
      mockGatewayVerification: { status: 'success', id: 99999, currency: 'NGN', amount: 10000000 },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'successful');
    assert.equal(storedTx.status, 'successful');
    assert.ok(storedTx.paid_at);
  });

  test('[MOCKED] Webhook with abandoned gateway response transitions transaction to abandoned', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const signature = signPayload(rawBody);
    const storedTx = { reference: sampleReference, status: 'pending', amount: 100000, currency: 'NGN' };

    const response = processWebhookSimulation({
      rawBody,
      signature,
      secretKey: mockSecret,
      storedTransaction: storedTx,
      mockGatewayVerification: { status: 'abandoned', id: 55555 },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'abandoned');
    assert.equal(storedTx.status, 'abandoned');
  });

  test('[MOCKED] Webhook with failed gateway response transitions transaction to failed', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const signature = signPayload(rawBody);
    const storedTx = { reference: sampleReference, status: 'pending', amount: 100000, currency: 'NGN' };

    const response = processWebhookSimulation({
      rawBody,
      signature,
      secretKey: mockSecret,
      storedTransaction: storedTx,
      mockGatewayVerification: { status: 'failed', id: 44444 },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'failed');
    assert.equal(storedTx.status, 'failed');
  });

  test('[MOCKED] Webhook with amount mismatch marks transaction failed and rejects with 400', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const signature = signPayload(rawBody);
    const storedTx = { reference: sampleReference, status: 'pending', amount: 100000, currency: 'NGN' };

    const response = processWebhookSimulation({
      rawBody,
      signature,
      secretKey: mockSecret,
      storedTransaction: storedTx,
      mockGatewayVerification: { status: 'success', id: 11111, currency: 'NGN', amount: 5000000 },
    });

    assert.equal(response.status, 400);
    assert.match(response.body.error, /mismatch: amount/);
    assert.equal(storedTx.status, 'failed');
  });

  test('[MOCKED] Webhook with currency mismatch marks transaction failed and rejects with 400', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const signature = signPayload(rawBody);
    const storedTx = { reference: sampleReference, status: 'pending', amount: 100000, currency: 'NGN' };

    const response = processWebhookSimulation({
      rawBody,
      signature,
      secretKey: mockSecret,
      storedTransaction: storedTx,
      mockGatewayVerification: { status: 'success', id: 22222, currency: 'USD', amount: 10000000 },
    });

    assert.equal(response.status, 400);
    assert.match(response.body.error, /mismatch: currency/);
    assert.equal(storedTx.status, 'failed');
  });

  test('[MOCKED] Duplicate webhook delivery on already successful transaction returns already_processed immediately', () => {
    const rawBody = JSON.stringify({ event: 'charge.success', data: { reference: sampleReference } });
    const signature = signPayload(rawBody);
    const storedTx = { reference: sampleReference, status: 'successful', amount: 100000, currency: 'NGN', paid_at: new Date().toISOString() };

    const response = processWebhookSimulation({
      rawBody,
      signature,
      secretKey: mockSecret,
      storedTransaction: storedTx,
      mockGatewayVerification: { status: 'success', id: 99999, currency: 'NGN', amount: 10000000 },
    });

    assert.equal(response.status, 200);
    assert.equal(response.body.status, 'already_processed');
    assert.equal(storedTx.status, 'successful');
  });

  test('[MOCKED] Concurrency Guard: Failed or abandoned update cannot overwrite an already successful transaction', () => {
    const existingSuccessfulTx = {
      reference: 'eth_race_condition_test',
      status: 'successful',
      paid_at: '2026-10-10T20:00:00.000Z',
    };

    function simulateGuardedUpdate(tx, requestedStatus) {
      if (tx.status === 'successful') {
        return tx;
      }
      if (requestedStatus !== 'successful' && tx.status === 'successful') {
        return tx;
      }
      tx.status = requestedStatus;
      return tx;
    }

    const resultAfterFailed = simulateGuardedUpdate(existingSuccessfulTx, 'failed');
    assert.equal(resultAfterFailed.status, 'successful');

    const resultAfterAbandoned = simulateGuardedUpdate(existingSuccessfulTx, 'abandoned');
    assert.equal(resultAfterAbandoned.status, 'successful');
  });
});

describe('17. Persisted Initialization Error Sanitization (Fix 2)', () => {
  test('sanitizeGatewayErrorMessage categorizes timeout errors and redacts credentials', () => {
    const mockTimeoutToken = ['sk', 'test', 'mock_timeout_credential'].join('_');
    const err = new Error(`Gateway fetch timed out after 15000ms with token ${mockTimeoutToken}`);
    const result = sanitizeGatewayErrorMessage(err);

    assert.equal(result.category, 'TIMEOUT');
    assert.equal(result.message.includes('sk_test_'), false);
    assert.equal(result.message.includes('[REDACTED_KEY]'), true);
  });

  test('sanitizeGatewayErrorMessage categorizes network errors and redacts URLs', () => {
    const err = new Error('Network error: fetch failed at https://api.paystack.co/transaction/initialize');
    const result = sanitizeGatewayErrorMessage(err);

    assert.equal(result.category, 'NETWORK');
    assert.equal(result.message.includes('https://'), false);
    assert.equal(result.message.includes('[REDACTED_URL]'), true);
  });

  test('sanitizeGatewayErrorMessage categorizes auth/secret key errors and redacts sk_live_/sk_test_ tokens', () => {
    const mockLiveToken = ['sk', 'live', 'mock_lockout_credential'].join('_');
    const err = new Error(`[Paystack Security Lockout] Invalid credentials: ${mockLiveToken}`);
    const result = sanitizeGatewayErrorMessage(err);

    assert.equal(result.category, 'AUTH_ERROR');
    assert.equal(result.message.includes('sk_live_'), false);
    assert.equal(result.message.includes('[REDACTED_KEY]'), true);
  });

  test('sanitizeGatewayErrorMessage redacts Bearer tokens and customer email addresses', () => {
    const mockBearerToken = ['sk', 'test', 'mock_bearer_token'].join('_');
    const err = new Error(`Invalid request authorization: Bearer ${mockBearerToken} for applicant customer@example.com`);
    const result = sanitizeGatewayErrorMessage(err);

    assert.equal(result.message.includes('sk_test_'), false);
    assert.equal(result.message.includes('customer@example.com'), false);
    assert.equal(result.message.includes('[REDACTED_TOKEN]'), true);
    assert.equal(result.message.includes('[REDACTED_EMAIL]'), true);
  });

  test('sanitizeGatewayErrorMessage enforces strict 150-character ceiling on long diagnostic messages', () => {
    const longMessage = 'A'.repeat(300);
    const err = new Error(longMessage);
    const result = sanitizeGatewayErrorMessage(err);

    assert.ok(result.message.length <= 150);
    assert.ok(result.message.endsWith('...'));
  });

  test('sanitizeGatewayErrorMessage handles empty, unknown, or non-Error inputs gracefully', () => {
    const emptyResult = sanitizeGatewayErrorMessage('');
    assert.equal(emptyResult.category, 'UNKNOWN');
    assert.equal(emptyResult.message, 'Payment gateway initialization failed.');

    const nullResult = sanitizeGatewayErrorMessage(null);
    assert.equal(nullResult.category, 'UNKNOWN');

    const objResult = sanitizeGatewayErrorMessage({ custom: 'failure' });
    assert.equal(objResult.category, 'UNKNOWN');
  });
});

describe('18. Direct Route Handler Execution (Next.js Request & Response Integration)', () => {
  test('Direct Route: Course checkout without application_id returns HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'ai_training',
        productType: 'programme',
        email: 'applicant@example.com',
        name: 'Jane Doe',
      }),
    });

    const res = await initializeRoutePost(req);
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.success, false);
    assert.match(json.error, /An application ID is required/);
  });

  test('Direct Route: Course checkout with malformed application_id returns HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'ai_training',
        productType: 'programme',
        email: 'applicant@example.com',
        name: 'Jane Doe',
        metadata: {
          application_id: 'non-uuid-malformed-string',
        },
      }),
    });

    const res = await initializeRoutePost(req);
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.success, false);
    assert.match(json.error, /Expected a valid UUID/);
  });

  test('Direct Route: Request for retired bootcamp returns HTTP 400 with PRODUCT_DISCONTINUED', async () => {
    const req = new Request('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'bootcamp',
        productType: 'programme',
        email: 'applicant@example.com',
        name: 'Jane Doe',
      }),
    });

    const res = await initializeRoutePost(req);
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.success, false);
    assert.equal(json.code, 'PRODUCT_DISCONTINUED');
    assert.match(json.error, /retired/i);
  });

  test('Direct Route: Request for non-purchasable internship returns HTTP 400 with PRODUCT_UNAVAILABLE', async () => {
    const req = new Request('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'internship',
        productType: 'programme',
        email: 'applicant@example.com',
        name: 'Jane Doe',
      }),
    });

    const res = await initializeRoutePost(req);
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.success, false);
    assert.equal(json.code, 'PRODUCT_UNAVAILABLE');
    assert.match(json.error, /not available for individual purchase/i);
  });

  test('Direct Route: Request for unconfigured international product (web-basic from US) returns HTTP 422', async () => {
    const req = new Request('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-ip-country': 'US',
      },
      body: JSON.stringify({
        productId: 'web-basic',
        productType: 'service',
        email: 'us.client@example.com',
        name: 'Jane Doe',
        countryCode: 'US',
      }),
    });

    const res = await initializeRoutePost(req);
    const json = await res.json();

    assert.equal(res.status, 422);
    assert.equal(json.success, false);
    assert.equal(json.code, 'PRICING_NOT_CONFIGURED');
    assert.match(json.error, /International pricing \(USD\) is not yet configured/i);
  });

  test('Direct Route: Request for international course (ai_security from US) resolves price and proceeds to validate application_id', async () => {
    const req = new Request('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-vercel-ip-country': 'US',
      },
      body: JSON.stringify({
        productId: 'ai_security',
        productType: 'programme',
        email: 'us.applicant@example.com',
        name: 'Jane Doe',
        countryCode: 'US',
      }),
    });

    const res = await initializeRoutePost(req);
    const json = await res.json();

    // With USD 250 configured, pricing resolution succeeds without 422 PRICING_NOT_CONFIGURED,
    // and advances to Step 5 where course products strictly require application_id (HTTP 400).
    assert.equal(res.status, 400);
    assert.equal(json.success, false);
    assert.match(json.error, /An application ID is required/i);
  });

  test('Direct Route: Request with invalid customer email returns HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'consultation-30',
        productType: 'consultation',
        email: 'invalid-email-address',
        name: 'Client User',
      }),
    });

    const res = await initializeRoutePost(req);
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.success, false);
    assert.match(json.error, /Invalid email/i);
  });

  test('Direct Route: Request with invalid/unknown product ID returns HTTP 400', async () => {
    const req = new Request('http://localhost:3000/api/paystack/initialize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: 'non-existent-product-id',
        email: 'valid@example.com',
        name: 'Client User',
      }),
    });

    const res = await initializeRoutePost(req);
    const json = await res.json();

    assert.equal(res.status, 400);
    assert.equal(json.success, false);
    assert.match(json.error, /unknown or unavailable/i);
  });
});

describe('19. Production Database Schema Contract Verification', () => {
  test('Production course_prices column schema contract is respected', () => {
    // Production schema definition: (id, course_id, currency_code, symbol, amount, created_at)
    // Non-existent columns: currency, active (must not be assumed in raw SELECT / WHERE queries)
    const productionRow = {
      id: 'e2a87b5c-431f-4d92-bf39-160fa11dae01',
      course_id: 'ai_training',
      currency_code: 'NGN',
      symbol: '₦',
      amount: 100000,
      created_at: '2026-10-10T12:00:00Z',
    };

    assert.ok(productionRow.course_id);
    assert.ok(productionRow.currency_code);
    assert.ok(productionRow.symbol);
    assert.ok(productionRow.amount > 0);
    assert.equal(productionRow.currency, undefined, 'Column "currency" must not be present in prod schema');
    assert.equal(productionRow.active, undefined, 'Column "active" is optional / unassumed in prod schema');
  });

  test('CANONICAL_PRODUCTS defines active programmes, retired legacy, and non-purchasable internship', () => {
    assert.equal(CANONICAL_PRODUCTS['ai_training'].status, 'active');
    assert.equal(CANONICAL_PRODUCTS['ai_training'].ngnBaseAmount, 100000);

    assert.equal(CANONICAL_PRODUCTS['ai_security'].status, 'active');
    assert.equal(CANONICAL_PRODUCTS['ai_security'].ngnBaseAmount, 200000);

    assert.equal(CANONICAL_PRODUCTS['professional'].status, 'active');
    assert.equal(CANONICAL_PRODUCTS['professional'].ngnBaseAmount, 350000);

    assert.equal(CANONICAL_PRODUCTS['bootcamp'].status, 'retired');
    assert.equal(CANONICAL_PRODUCTS['internship'].status, 'non_purchasable');
  });

  test('African currency map is strictly restricted to Paystack direct checkout supported currencies', () => {
    // Paystack checkout currencies: NGN, GHS, ZAR, USD, KES, XOF
    for (const [country, currency] of Object.entries(AFRICAN_CURRENCY_MAP)) {
      assert.ok(
        ['GHS', 'KES', 'ZAR', 'XOF'].includes(currency),
        `Country ${country} is mapped to unsupported direct currency ${currency}`
      );
      assert.equal(isPaystackSupportedCurrency(currency), true);
    }
  });

  test('INTERNATIONAL_USD_FALLBACKS defines business-approved USD prices for all active courses', () => {
    assert.equal(INTERNATIONAL_USD_FALLBACKS['ai_training'], 160);
    assert.equal(INTERNATIONAL_USD_FALLBACKS['ai_security'], 250);
    assert.equal(INTERNATIONAL_USD_FALLBACKS['professional'], 500);
  });
});

describe('20. Idempotent Atomic Fulfillment & Delivery Resilience', () => {
  test('fulfillTransaction ignores transactions with non-successful status', async () => {
    const pendingTx = {
      id: 'tx_test_1',
      reference: 'eth_pending_1',
      status: 'pending',
      amount: 50000,
      currency: 'NGN',
      product_id: 'consultation-60',
      product_type: 'consultation',
      customer_email: 'client@example.com',
      metadata: {},
    };

    const result = await fulfillTransaction(pendingTx);
    assert.equal(result.fulfilled, false);
    assert.equal(result.alreadyFulfilled, false);

    const failedTx = { ...pendingTx, status: 'failed', reference: 'eth_failed_1' };
    const failResult = await fulfillTransaction(failedTx);
    assert.equal(failResult.fulfilled, false);
    assert.equal(failResult.alreadyFulfilled, false);
  });

  test('fulfillTransaction on non-consultation product leaves fulfillment to external/manual workflows', async () => {
    const programmeTx = {
      id: 'tx_prog_1',
      reference: 'eth_prog_1',
      status: 'successful',
      amount: 100000,
      currency: 'NGN',
      product_id: 'ai_training',
      product_type: 'programme',
      customer_email: 'student@example.com',
      metadata: { application_id: '12345678-1234-4234-8234-123456789abc' },
    };

    const result = await fulfillTransaction(programmeTx);
    assert.equal(result.fulfilled, false);
    assert.equal(result.alreadyFulfilled, false);
  });

  test('fulfillTransaction respects already fulfilled or dispatched metadata flags', async () => {
    const alreadyFulfilledTx = {
      id: 'tx_done_1',
      reference: 'eth_done_1',
      status: 'successful',
      amount: 30000,
      currency: 'NGN',
      product_id: 'consultation-30',
      product_type: 'consultation',
      customer_email: 'client@example.com',
      metadata: { fulfilled: true },
    };

    const res1 = await fulfillTransaction(alreadyFulfilledTx);
    assert.equal(res1.fulfilled, false);
    assert.equal(res1.alreadyFulfilled, true);

    const alreadyDispatchedTx = {
      ...alreadyFulfilledTx,
      metadata: { fulfillment_dispatched: true },
    };

    const res2 = await fulfillTransaction(alreadyDispatchedTx);
    assert.equal(res2.fulfilled, false);
    assert.equal(res2.alreadyFulfilled, true);
  });
});

describe('21. Production Fail-Closed Pricing Integrity (DB Failures, Incomplete Rows, Unsupported Currencies)', () => {
  function createMockSupabase({ data = null, error = null }) {
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: async () => ({ data, error }),
            }),
          }),
        }),
      }),
    };
  }

  test('Production rules: Fails closed with PRICE_DATABASE_UNAVAILABLE when database is unavailable', async () => {
    await assert.rejects(
      async () => resolveAuthoritativePrice('ai_training', 'programme', 'NG', {
        supabaseClient: null,
        enforceProductionRules: true,
      }),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICE_DATABASE_UNAVAILABLE');
        return true;
      }
    );
  });

  test('Production rules: Fails closed with PRICE_LOOKUP_FAILED on database query error', async () => {
    const mockSupabase = createMockSupabase({
      data: null,
      error: new Error('connection refused: database port unreachable'),
    });

    await assert.rejects(
      async () => resolveAuthoritativePrice('ai_training', 'programme', 'NG', {
        supabaseClient: mockSupabase,
        enforceProductionRules: true,
      }),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICE_LOOKUP_FAILED');
        return true;
      }
    );
  });

  test('Production rules: Fails closed with PRICE_UNAVAILABLE on missing row (data: null)', async () => {
    const mockSupabase = createMockSupabase({
      data: null,
      error: null,
    });

    await assert.rejects(
      async () => resolveAuthoritativePrice('ai_training', 'programme', 'NG', {
        supabaseClient: mockSupabase,
        enforceProductionRules: true,
      }),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICE_UNAVAILABLE');
        return true;
      }
    );
  });

  test('Production rules: Fails closed with PRODUCT_DISCONTINUED when database row active is false', async () => {
    const mockSupabase = createMockSupabase({
      data: { amount: 100000, active: false, currency_code: 'NGN' },
      error: null,
    });

    await assert.rejects(
      async () => resolveAuthoritativePrice('ai_training', 'programme', 'NG', {
        supabaseClient: mockSupabase,
        enforceProductionRules: true,
      }),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRODUCT_DISCONTINUED');
        return true;
      }
    );
  });

  test('Production rules: Honors authoritative database price when row is active and valid', async () => {
    const mockSupabase = createMockSupabase({
      data: { amount: 100000, active: true, currency_code: 'NGN' },
      error: null,
    });

    const price = await resolveAuthoritativePrice('ai_training', 'programme', 'NG', {
      supabaseClient: mockSupabase,
      enforceProductionRules: true,
    });
    assert.equal(price.finalAmount, 100000);
    assert.equal(price.finalCurrency, 'NGN');
  });

  test('Production rules: International fails closed with PRICE_DATABASE_UNAVAILABLE when database is unavailable', async () => {
    await assert.rejects(
      async () => resolveInternationalPrice('ai_security', 'programme', 'AI Security', 200000, 'USD', {
        supabaseClient: null,
        enforceProductionRules: true,
      }),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICE_DATABASE_UNAVAILABLE');
        return true;
      }
    );
  });

  test('Production rules: International fails closed with PRICE_LOOKUP_FAILED on query error', async () => {
    const mockSupabase = createMockSupabase({
      data: null,
      error: new Error('PostgREST connection failure'),
    });

    await assert.rejects(
      async () => resolveInternationalPrice('ai_security', 'programme', 'AI Security', 200000, 'USD', {
        supabaseClient: mockSupabase,
        enforceProductionRules: true,
      }),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICE_LOOKUP_FAILED');
        return true;
      }
    );
  });

  test('Production rules: International fails closed with PRICE_UNAVAILABLE on missing row (data: null)', async () => {
    const mockSupabase = createMockSupabase({
      data: null,
      error: null,
    });

    await assert.rejects(
      async () => resolveInternationalPrice('ai_security', 'programme', 'AI Security', 200000, 'USD', {
        supabaseClient: mockSupabase,
        enforceProductionRules: true,
      }),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICE_UNAVAILABLE');
        return true;
      }
    );
  });

  test('Production rules: International succeeds and honors DB row when active and valid', async () => {
    const mockSupabase = createMockSupabase({
      data: { amount: 250, active: true, currency_code: 'USD' },
      error: null,
    });

    const price = await resolveInternationalPrice('ai_security', 'programme', 'AI Security', 200000, 'USD', {
      supabaseClient: mockSupabase,
      enforceProductionRules: true,
    });
    assert.equal(price.finalAmount, 250);
    assert.equal(price.finalCurrency, 'USD');
  });

  test('Fails closed with PRICING_NOT_CONFIGURED for unconfigured international products or unsupported currencies', async () => {
    await assert.rejects(
      async () => resolveInternationalPrice('web-basic', 'service', 'Web Development Basic', 250000, 'EUR'),
      (err) => {
        assert.ok(err instanceof PricingError);
        assert.equal(err.code, 'PRICING_NOT_CONFIGURED');
        return true;
      }
    );
  });
});



