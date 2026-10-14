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

export type GatewayErrorCategory = 'TIMEOUT' | 'NETWORK' | 'AUTH_ERROR' | 'GATEWAY_ERROR' | 'UNKNOWN';

export interface SanitizedGatewayError {
  category: GatewayErrorCategory;
  message: string;
}

export class PaystackGatewayError extends Error {
  status: number;
  category: GatewayErrorCategory;
  code?: string;

  constructor(
    message: string,
    status: number,
    category: GatewayErrorCategory = 'GATEWAY_ERROR',
    code?: string
  ) {
    super(message);
    this.name = 'PaystackGatewayError';
    this.status = status;
    this.category = category;
    this.code = code;
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

  let response: Response;
  try {
    response = await fetch(`${PAYSTACK_API_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(params),
      signal: AbortSignal.timeout(15000), // 15-second timeout
    });
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError' || err.message.toLowerCase().includes('timeout'));
    throw new PaystackGatewayError(
      isTimeout ? 'Paystack gateway connection timed out.' : 'Unable to connect to Paystack gateway.',
      isTimeout ? 504 : 503,
      isTimeout ? 'TIMEOUT' : 'NETWORK'
    );
  }

  let data: Record<string, unknown> | null = null;
  try {
    data = await response.json();
  } catch {
    throw new PaystackGatewayError(
      `Paystack returned an invalid non-JSON response (HTTP ${response.status}).`,
      response.status >= 500 ? 502 : 400,
      'GATEWAY_ERROR'
    );
  }

  if (!response.ok || !data || !data.status) {
    const rawMessage =
      typeof data?.message === 'string'
        ? data.message
        : `Paystack initialization failed (HTTP ${response.status})`;
    const isCurrencyIssue =
      data?.code === 'unsupported_currency' ||
      rawMessage.toLowerCase().includes('currency not supported') ||
      rawMessage.toLowerCase().includes('unsupported currency');
    const isAuthIssue =
      response.status === 401 ||
      response.status === 403 ||
      rawMessage.toLowerCase().includes('secret key') ||
      rawMessage.toLowerCase().includes('unauthorized');

    const category: GatewayErrorCategory = isCurrencyIssue
      ? 'GATEWAY_ERROR'
      : isAuthIssue
      ? 'AUTH_ERROR'
      : 'GATEWAY_ERROR';

    const code = isCurrencyIssue ? 'unsupported_currency' : (typeof data?.code === 'string' ? data.code : undefined);

    throw new PaystackGatewayError(rawMessage, response.status, category, code);
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

  let response: Response;
  try {
    response = await fetch(`${PAYSTACK_API_BASE_URL}/transaction/verify/${safeReference}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(15000), // 15-second timeout
    });
  } catch (err: unknown) {
    const isTimeout =
      err instanceof Error &&
      (err.name === 'TimeoutError' || err.name === 'AbortError' || err.message.toLowerCase().includes('timeout'));
    throw new PaystackGatewayError(
      isTimeout ? 'Paystack gateway verification timed out.' : 'Unable to connect to Paystack gateway for verification.',
      isTimeout ? 504 : 503,
      isTimeout ? 'TIMEOUT' : 'NETWORK'
    );
  }

  let data: Record<string, unknown> | null = null;
  try {
    data = await response.json();
  } catch {
    throw new PaystackGatewayError(
      `Paystack returned an invalid non-JSON response on verification (HTTP ${response.status}).`,
      response.status >= 500 ? 502 : 400,
      'GATEWAY_ERROR'
    );
  }

  if (!response.ok || !data || !data.status) {
    const rawMessage =
      typeof data?.message === 'string'
        ? data.message
        : `Paystack verification failed (HTTP ${response.status})`;
    const isAuthIssue =
      response.status === 401 ||
      response.status === 403 ||
      rawMessage.toLowerCase().includes('secret key') ||
      rawMessage.toLowerCase().includes('unauthorized');

    throw new PaystackGatewayError(
      rawMessage,
      response.status,
      isAuthIssue ? 'AUTH_ERROR' : 'GATEWAY_ERROR',
      typeof data?.code === 'string' ? data.code : undefined
    );
  }

  return data as PaystackVerifyResponse;
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
