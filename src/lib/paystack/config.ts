/**
 * Paystack Server-Only Configuration.
 *
 * PAYSTACK_MODE is an explicit server-side switch: "test" or "live".
 * Missing/blank mode safely defaults to "test". A key must match the selected
 * mode, so setting a live key alone can never silently enable live payments.
 */
export function getPaystackSecretKey(): string {
  const rawKey = process.env.PAYSTACK_SECRET_KEY;
  if (!rawKey || !rawKey.trim()) {
    throw new Error('PAYSTACK_SECRET_KEY environment variable is not configured.');
  }

  const key = rawKey.trim();
  const configuredMode = process.env.PAYSTACK_MODE?.trim().toLowerCase() || 'test';
  if (configuredMode !== 'test' && configuredMode !== 'live') {
    throw new Error('[Paystack Security Lockout] PAYSTACK_MODE must be either "test" or "live".');
  }

  const requiredPrefix = configuredMode === 'live' ? 'sk_live_' : 'sk_test_';
  if (!key.startsWith(requiredPrefix) || key.length <= requiredPrefix.length) {
    throw new Error(
      `[Paystack Security Lockout] PAYSTACK_MODE="${configuredMode}" requires a valid ${requiredPrefix} secret key.`
    );
  }

  return key;
}

/**
 * Returns whether the configured Paystack credentials are valid Test Mode
 * credentials. Missing/invalid configuration returns false.
 */
export function isPaystackTestMode(): boolean {
  try {
    return getPaystackSecretKey().startsWith('sk_test_');
  } catch {
    return false;
  }
}

/**
 * Resolves the trusted application URL for callbacks and redirects.
 * Strictly uses configured environment variables, never untrusted client headers.
 */
export function getAppUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.FRONTEND_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NODE_ENV === 'production' ? 'https://www.elitechub.com' : 'http://localhost:3000');
  return url.replace(/\/+$/, '');
}

/**
 * Allowlist of approved payment return paths within Elitech Hub.
 */
export const APPROVED_CALLBACK_PATHS = Object.freeze([
  '/thank-you',
  '/apply',
  '/consultation',
  '/programs',
] as const);

/**
 * Builds a secure callback URL guaranteed to belong to the trusted application origin.
 * Strictly rejects external URLs, protocol-relative URLs, open redirects, and non-whitelisted paths.
 * 
 * @param requestedUrl - Optional client-requested return path or URL
 * @returns Fully-qualified, trusted callback URL
 */
export function buildApprovedCallbackUrl(requestedUrl?: string): string {
  const trustedBase = getAppUrl();
  const defaultPath = '/thank-you';

  if (!requestedUrl || typeof requestedUrl !== 'string') {
    return `${trustedBase}${defaultPath}`;
  }

  const trimmed = requestedUrl.trim();

  // Reject protocol-relative URLs (e.g. "//evil.com")
  if (trimmed.startsWith('//')) {
    return `${trustedBase}${defaultPath}`;
  }

  // Reject javascript:, data:, and other dangerous pseudo-protocols
  if (trimmed.toLowerCase().startsWith('javascript:') || trimmed.toLowerCase().startsWith('data:')) {
    return `${trustedBase}${defaultPath}`;
  }

  let parsedPath: string;

  try {
    // If client supplied a full URL, parse it and verify origin
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      const parsed = new URL(trimmed);
      const trustedOrigin = new URL(trustedBase).origin.toLowerCase();
      
      // If origin does not match the trusted app origin, reject open redirect
      if (parsed.origin.toLowerCase() !== trustedOrigin) {
        return `${trustedBase}${defaultPath}`;
      }
      parsedPath = parsed.pathname;
    } else {
      // Relative path: parse using trustedBase as dummy root
      const parsed = new URL(trimmed, 'https://internal.elitechub.local');
      parsedPath = parsed.pathname;
    }
  } catch {
    return `${trustedBase}${defaultPath}`;
  }

  // Normalize path
  const normalizedPath = parsedPath.toLowerCase().replace(/\/+$/, '') || '/';

  // Check against approved paths allowlist
  const isApproved = APPROVED_CALLBACK_PATHS.some(
    (allowed) => allowed === normalizedPath || (allowed === '/thank-you' && normalizedPath === '')
  );

  if (isApproved) {
    return `${trustedBase}${normalizedPath}`;
  }

  // Fallback to safe default
  return `${trustedBase}${defaultPath}`;
}

export const PAYSTACK_API_BASE_URL = 'https://api.paystack.co';
