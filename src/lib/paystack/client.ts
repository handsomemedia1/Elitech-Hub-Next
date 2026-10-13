/**
 * Paystack API Client & Security Utilities
 * Server-only module for communicating with api.paystack.co
 */

import crypto from 'node:crypto';
import { getPaystackSecretKey, PAYSTACK_API_BASE_URL } from './config';
import type {
  PaystackInitializeParams,
  PaystackInitializeResponse,
  PaystackVerifyResponse,
} from './types';

/**
 * Generates a unique, cryptographically random, unpredictable transaction reference.
 * Format: eth_{timestamp}_{12_hex_chars}
 * Example: eth_1728574800000_a1b2c3d4e5f6
 */
export function generateTransactionReference(): string {
  const timestamp = Date.now();
  const entropy = crypto.randomBytes(6).toString('hex');
  return `eth_${timestamp}_${entropy}`;
}

/**
 * Validates the x-paystack-signature header using HMAC SHA-512
 * with constant-time comparison to prevent timing attacks.
 */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null,
  secretKeyOverride?: string
): boolean {
  if (!rawBody || !signature || typeof signature !== 'string') {
    return false;
  }

  let secretKey: string;
  try {
    secretKey = secretKeyOverride || getPaystackSecretKey();
  } catch {
    return false;
  }

  try {
    const computedHash = crypto
      .createHmac('sha512', secretKey)
      .update(rawBody)
      .digest('hex');

    const expectedBuffer = Buffer.from(computedHash, 'hex');
    const providedBuffer = Buffer.from(signature.trim(), 'hex');

    if (expectedBuffer.length !== providedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
  } catch (err) {
    console.error('[Paystack] Error during signature verification:', err);
    return false;
  }
}

/**
 * Initializes a transaction with Paystack.
 * Endpoint: POST https://api.paystack.co/transaction/initialize
 */
export async function initializePaystackTransaction(
  params: PaystackInitializeParams
): Promise<PaystackInitializeResponse> {
  const secretKey = getPaystackSecretKey();

  const response = await fetch(`${PAYSTACK_API_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(15000), // 15-second timeout
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    const message = data.message || `Paystack initialization failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  return data as PaystackInitializeResponse;
}

/**
 * Verifies a transaction with Paystack server-to-server.
 * Endpoint: GET https://api.paystack.co/transaction/verify/:reference
 */
export async function verifyPaystackTransaction(
  reference: string
): Promise<PaystackVerifyResponse> {
  const secretKey = getPaystackSecretKey();
  const safeReference = encodeURIComponent(reference.trim());

  const response = await fetch(`${PAYSTACK_API_BASE_URL}/transaction/verify/${safeReference}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${secretKey}`,
      'Accept': 'application/json',
    },
    signal: AbortSignal.timeout(15000), // 15-second timeout
  });

  const data = await response.json();

  if (!response.ok || !data.status) {
    const message = data.message || `Paystack verification failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  return data as PaystackVerifyResponse;
}

export type GatewayErrorCategory = 'TIMEOUT' | 'NETWORK' | 'AUTH_ERROR' | 'GATEWAY_ERROR' | 'UNKNOWN';

export interface SanitizedGatewayError {
  category: GatewayErrorCategory;
  message: string;
}

/**
 * Sanitizes and categorizes raw payment gateway errors before persistence or logging.
 * Strictly strips API keys, Bearer tokens, emails, sensitive credentials,
 * enforces a strict length ceiling (150 chars), and maps to safe diagnostic categories.
 */
export function sanitizeGatewayErrorMessage(rawError: unknown): SanitizedGatewayError {
  const rawString =
    rawError instanceof Error
      ? rawError.message
      : typeof rawError === 'string'
      ? rawError
      : 'Unknown gateway error';

  const lower = rawString.toLowerCase();

  // Categorize into bounded safe diagnostic categories
  let category: GatewayErrorCategory = 'GATEWAY_ERROR';
  if (
    lower.includes('timeout') ||
    lower.includes('timed out') ||
    lower.includes('time out') ||
    lower.includes('aborted') ||
    lower.includes('aborterror')
  ) {
    category = 'TIMEOUT';
  } else if (
    lower.includes('network') ||
    lower.includes('enotfound') ||
    lower.includes('econnrefused') ||
    lower.includes('fetch failed')
  ) {
    category = 'NETWORK';
  } else if (
    lower.includes('unauthorized') ||
    lower.includes('forbidden') ||
    lower.includes('401') ||
    lower.includes('403') ||
    lower.includes('secret key') ||
    lower.includes('lockout')
  ) {
    category = 'AUTH_ERROR';
  } else if (!rawString || rawString === 'Unknown gateway error') {
    category = 'UNKNOWN';
  }

  // Redact secrets, credential tokens, Bearer strings, URLs, and emails
  // Note: Run Bearer redaction before standalone key regex to capture authorization tokens cleanly
  let sanitized = rawString
    .replace(/Bearer\s+\S+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/(?:sk|pk)_(?:test|live)_[0-9a-zA-Z]+/gi, '[REDACTED_KEY]')
    .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[REDACTED_EMAIL]')
    .replace(/https?:\/\/[^\s]+/gi, '[REDACTED_URL]')
    .trim();

  // Enforce strict length boundary (150 chars max)
  if (sanitized.length > 150) {
    sanitized = sanitized.slice(0, 147) + '...';
  }

  return {
    category,
    message: sanitized || 'Payment gateway initialization failed.',
  };
}
