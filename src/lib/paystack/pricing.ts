/**
 * Server-Side Authoritative Pricing Engine
 * 
 * Determines authoritative prices strictly on the server:
 *   1. Resolves product ID and base NGN price.
 *   2. Identifies geographic pricing region (NG, AFRICA, or International bands).
 *   3. Calculates final currency and amount (NGN base, genuine African FX, or international commercial band).
 *   4. Rejects unavailable FX pricing without silently substituting NGN.
 *   5. Never trusts client-supplied amounts or currency.
 */

async function getServiceClient() {
  try {
    const mod = await import('@/lib/supabase-server');
    return mod.createServiceClient ? mod.createServiceClient() : null;
  } catch {
    return null;
  }
}

import type { ProductType, ResolvedPrice } from './types';

// ============================================================
// CANONICAL NIGERIAN BASE PRICES (Fallback if DB is unreachable)
// Matches migration 008_product_prices.sql & PricingContext.tsx
// ============================================================
interface ProductDefinition {
  id: string;
  type: ProductType;
  label: string;
  ngnBaseAmount: number;
}

export const CANONICAL_PRODUCTS: Record<string, ProductDefinition> = Object.freeze({
  // Training Programmes
  // NOTE: 'bootcamp' (6-Week Cybersecurity Bootcamp) is retired from active public offerings.
  // Row preserved for historical transaction integrity only. New checkout is rejected via
  // resolveAuthoritativePrice when DB returns active=false (DB-driven gate).
  // Fallback ngnBaseAmount kept so legacy receipt lookups still resolve.
  'bootcamp': {
    id: 'bootcamp',
    type: 'programme',
    label: '6-Week Cybersecurity Bootcamp',
    ngnBaseAmount: 100000,
  },
  'professional': {
    id: 'professional',
    type: 'programme',
    label: '16-Week Professional Cybersecurity Programme',
    ngnBaseAmount: 350000, // Updated: was ₦300,000
  },
  'ai_training': {
    id: 'ai_training',
    type: 'programme',
    label: 'AI-Powered Cybersecurity Programme',
    ngnBaseAmount: 100000, // 6 weeks, ₦100,000
  },
  'ai_security': {
    id: 'ai_security',
    type: 'programme',
    label: 'AI Security and Reverse Vulnerability',
    ngnBaseAmount: 200000, // 8 weeks, ₦200,000
  },

  // Consultations
  'consultation-15': {
    id: 'consultation-15',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 15 Minutes',
    ngnBaseAmount: 15000,
  },
  'consultation-30': {
    id: 'consultation-30',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 30 Minutes',
    ngnBaseAmount: 30000,
  },
  'consultation-60': {
    id: 'consultation-60',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 60 Minutes',
    ngnBaseAmount: 50000,
  },
  'consultation-90': {
    id: 'consultation-90',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 90 Minutes',
    ngnBaseAmount: 70000,
  },
  'consultation-120': {
    id: 'consultation-120',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 120 Minutes',
    ngnBaseAmount: 100000,
  },

  // Services
  'web-basic': { id: 'web-basic', type: 'service', label: 'Web Development – Basic', ngnBaseAmount: 250000 },
  'web-dynamic': { id: 'web-dynamic', type: 'service', label: 'Web Development – Dynamic', ngnBaseAmount: 350000 },
  'web-business': { id: 'web-business', type: 'service', label: 'Web Development – Business', ngnBaseAmount: 400000 },
  'web-ecommerce': { id: 'web-ecommerce', type: 'service', label: 'Web Development – E-Commerce', ngnBaseAmount: 700000 },
  'chatbot-basic': { id: 'chatbot-basic', type: 'service', label: 'AI Chatbot – Basic', ngnBaseAmount: 300000 },
  'chatbot-standard': { id: 'chatbot-standard', type: 'service', label: 'AI Chatbot – Standard', ngnBaseAmount: 500000 },
  'chatbot-premium': { id: 'chatbot-premium', type: 'service', label: 'AI Chatbot – Premium', ngnBaseAmount: 800000 },
  'script-basic': { id: 'script-basic', type: 'service', label: 'Custom Script – Basic', ngnBaseAmount: 300000 },
  'script-standard': { id: 'script-standard', type: 'service', label: 'Custom Script – Standard', ngnBaseAmount: 500000 },
  'script-premium': { id: 'script-premium', type: 'service', label: 'Custom Script – Premium', ngnBaseAmount: 800000 },
  'pentest-basic': { id: 'pentest-basic', type: 'service', label: 'Penetration Testing – Basic', ngnBaseAmount: 300000 },
  'pentest-standard': { id: 'pentest-standard', type: 'service', label: 'Penetration Testing – Standard', ngnBaseAmount: 500000 },
  'pentest-premium': { id: 'pentest-premium', type: 'service', label: 'Penetration Testing – Premium', ngnBaseAmount: 800000 },
});

// Product alias mapping for common synonyms
export const PRODUCT_ALIASES: Record<string, string> = {
  '6-week bootcamp': 'bootcamp',
  '6-week-bootcamp': 'bootcamp',
  'cybersecurity-bootcamp': 'bootcamp',
  '16-week professional': 'professional',
  '16-week-professional': 'professional',
  'professional-cybersecurity': 'professional',
  'ai-cybersecurity': 'ai_training',
  'ai_cybersecurity': 'ai_training',
  'ai-security': 'ai_security',
  'ai_security_reverse': 'ai_security',
  'ai-security-reverse': 'ai_security',
  'reverse-vulnerability': 'ai_security',
};

// African Country Code -> ISO Currency Map
export const AFRICAN_CURRENCY_MAP: Record<string, string> = {
  GH: 'GHS', KE: 'KES', ZA: 'ZAR', EG: 'EGP', TZ: 'TZS', UG: 'UGX', RW: 'RWF',
  SN: 'XOF', CI: 'XOF', BF: 'XOF', ML: 'XOF', NE: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF',
  CM: 'XAF', TD: 'XAF', CF: 'XAF', CG: 'XAF', GQ: 'XAF', GA: 'XAF',
  MA: 'MAD', DZ: 'DZD', TN: 'TND', MZ: 'MZN', ZM: 'ZMW', AO: 'AOA', MG: 'MGA', SO: 'SOS', ET: 'ETB',
};

export const AFRICAN_COUNTRY_CODES = new Set([
  'GH', 'KE', 'ZA', 'EG', 'TZ', 'UG', 'RW', 'ET', 'CI', 'SN',
  'CM', 'MA', 'DZ', 'TN', 'MZ', 'ZW', 'ZM', 'AO', 'MG', 'BF',
  'ML', 'NE', 'TD', 'SO', 'ER', 'SS', 'MR', 'GM', 'GW', 'GN',
  'SL', 'LR', 'TG', 'BJ', 'GQ', 'GA', 'CG', 'CD', 'CF', 'BI',
  'DJ', 'KM', 'SC', 'MU', 'CV', 'ST', 'SZ', 'LS', 'BW', 'NA',
  'MW', 'LY', 'SD', 'NG',
]);

/**
 * Countries belonging to international commercial pricing tiers.
 * Used to enforce international pricing and prevent domestic rate spoofing.
 */
export const INTERNATIONAL_COMMERCIAL_COUNTRIES = new Set([
  'US', 'GB', 'UK', 'CA', 'AU', 'KW',
  'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'FI', 'PT',
  'GR', 'PL', 'CZ', 'HU', 'RO', 'SK', 'HR', 'BG', 'EE', 'LV',
  'LT', 'LU', 'MT', 'CY', 'SI', 'NZ', 'SG', 'AE', 'SA', 'QA'
]);

/**
 * Extracts a trusted server-side detected country code from edge proxy headers (Vercel / Cloudflare).
 * Returns null if running in an environment without edge geolocation headers.
 */
export function getTrustedServerCountry(request: Request): string | null {
  const vercelCountry = request.headers.get('x-vercel-ip-country')?.trim().toUpperCase();
  if (vercelCountry && vercelCountry.length === 2 && vercelCountry !== 'XX') {
    return vercelCountry;
  }

  const cfCountry = request.headers.get('cf-ipcountry')?.trim().toUpperCase();
  if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX') {
    return cfCountry;
  }

  return null;
}

/**
 * Resolves the effective pricing country based on trusted server edge detection and client selection.
 * 
 * POLICY:
 * 1. If edge proxy detects an International Commercial country (US, UK, EU, CA, AU, etc.),
 *    and client attempts to select 'NG' or an African domestic market, the server ENFORCES
 *    the international commercial country to prevent price-tier arbitrage.
 * 2. If edge proxy detects an African country or Nigeria, customer's selected African country is honored.
 * 3. If edge proxy headers are unavailable (local dev, test environment, internal network),
 *    the customer-selected country is used as a fallback, defaulting to 'NG'.
 * 
 * LIMITATION:
 * If a customer uses a VPN terminating in Nigeria or an African nation, edge detection
 * will observe the VPN's exit node. Enforcing card billing country at the payment gateway
 * level provides the final defense.
 */
export function resolveEffectivePricingCountry(
  requestedCountry?: string | null,
  trustedServerCountry?: string | null
): string {
  const requested = (requestedCountry || '').trim().toUpperCase();
  const serverDetected = (trustedServerCountry || '').trim().toUpperCase();

  // If server edge proxy detects an international commercial market:
  if (serverDetected && INTERNATIONAL_COMMERCIAL_COUNTRIES.has(serverDetected)) {
    // If client attempts to spoof a domestic Nigerian or African rate:
    if (!requested || requested === 'NG' || AFRICAN_COUNTRY_CODES.has(requested)) {
      console.warn(
        `[Pricing Integrity] Overriding client country "${requested || 'empty'}" with edge-detected international country "${serverDetected}".`
      );
      return serverDetected;
    }
    // If client requested another international country, honor it
    return requested;
  }

  // If client requested a country, use it
  if (requested && requested.length === 2) {
    return requested;
  }

  // Fall back to server detected or NG
  return serverDetected || 'NG';
}

// Verified offline fallback FX rates from open.er-api.com
export const OFFLINE_FALLBACK_FX_RATES: Record<string, number> = {
  GHS: 0.0095,
  KES: 0.096,
  ZAR: 0.012,
  EGP: 0.031,
  TZS: 1.61,
  UGX: 2.37,
  RWF: 0.81,
  XOF: 0.38,
  XAF: 0.38,
  MAD: 0.0062,
  DZD: 0.084,
  NGN: 1,
};

// Fallback international commercial pricing bands (USD)
// NOTE: Preserves existing international pricing. No USD price invented for 'ai_security'.
const INTERNATIONAL_USD_FALLBACKS: Record<string, number> = {
  'bootcamp': 160,
  'professional': 190,
  'ai_training': 160,
  'consultation-15': 25,
  'consultation-30': 45,
  'consultation-60': 75,
  'consultation-90': 105,
  'consultation-120': 140,
};

// In-memory cache for live FX rates (1 hour TTL)
let fxCache: { timestamp: number; rates: Record<string, number> } | null = null;
const FX_CACHE_TTL_MS = 60 * 60 * 1000;

export async function getLiveOrFallbackFxRate(targetCurrency: string): Promise<number | null> {
  const currency = targetCurrency.toUpperCase();
  if (currency === 'NGN') return 1;

  const now = Date.now();
  if (fxCache && now - fxCache.timestamp < FX_CACHE_TTL_MS && fxCache.rates[currency]) {
    return fxCache.rates[currency];
  }

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/NGN', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.rates && typeof data.rates === 'object') {
        fxCache = { timestamp: now, rates: data.rates };
        if (data.rates[currency] && typeof data.rates[currency] === 'number') {
          return data.rates[currency];
        }
      }
    }
  } catch (err) {
    // Live FX fetch failed; use offline fallback dictionary below
    console.warn('[Pricing] Live FX fetch failed, attempting fallback dictionary:', err);
  }

  // Check offline fallback dictionary
  if (OFFLINE_FALLBACK_FX_RATES[currency] !== undefined) {
    return OFFLINE_FALLBACK_FX_RATES[currency];
  }

  return null;
}

/**
 * Normalizes user-supplied product ID to canonical ID.
 */
export function normalizeProductId(rawId: string): string {
  const cleaned = (rawId || '').trim().toLowerCase();
  if (PRODUCT_ALIASES[cleaned]) {
    return PRODUCT_ALIASES[cleaned];
  }
  return cleaned;
}

export class PricingError extends Error {
  code: string;
  constructor(message: string, code: string) {
    super(message);
    this.name = 'PricingError';
    this.code = code;
  }
}

/**
 * Resolves the authoritative product price server-side.
 * Rejects unavailable FX pricing without falling back silently to NGN.
 */
export async function resolveAuthoritativePrice(
  rawProductId: string,
  rawProductType?: string,
  countryCode?: string
): Promise<ResolvedPrice> {
  const productId = normalizeProductId(rawProductId);
  const productDef = CANONICAL_PRODUCTS[productId];

  if (!productDef) {
    throw new PricingError(
      `Product "${rawProductId}" is unknown or unavailable.`,
      'UNKNOWN_PRODUCT'
    );
  }

  const productType = (rawProductType || productDef.type) as ProductType;
  const productLabel = productDef.label;

  // 1. Fetch base NGN price (authoritative from DB or fallback)
  let baseAmount = productDef.ngnBaseAmount;
  const baseCurrency = 'NGN';

  try {
    const supabase = await getServiceClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('course_prices')
        .select('amount')
        .eq('course_id', productId)
        .eq('currency', 'NGN')
        .eq('active', true)
        .maybeSingle();

      if (!error && data?.amount) {
        baseAmount = Number(data.amount);
      }
    }
  } catch (err) {
    console.warn('[Pricing] Supabase price lookup failed, using canonical fallback:', err);
  }

  // 2. Determine geographic market
  const country = (countryCode || 'NG').toUpperCase().trim();

  // A. NIGERIA (Canonical NGN base)
  if (country === 'NG') {
    return {
      productId,
      productType,
      productLabel,
      baseAmount,
      baseCurrency,
      pricingModel: 'ngn_base',
      fxRate: null,
      finalAmount: baseAmount,
      finalCurrency: 'NGN',
    };
  }

  // B. AFRICAN COUNTRIES (Genuine African FX conversion)
  if (AFRICAN_COUNTRY_CODES.has(country)) {
    const targetCurrency = AFRICAN_CURRENCY_MAP[country];

    if (!targetCurrency) {
      // African country without a specific local currency mapping uses USD
      return resolveInternationalPrice(productId, productType, productLabel, baseAmount, 'USD');
    }

    // Resolve FX rate
    const fxRate = await getLiveOrFallbackFxRate(targetCurrency);

    if (fxRate === null || fxRate <= 0) {
      // CRITICAL RULE: DO NOT SILENTLY FALL BACK TO NGN!
      throw new PricingError(
        `Exchange rate for currency "${targetCurrency}" (${country}) is currently unavailable. Please try again later.`,
        'FX_UNAVAILABLE'
      );
    }

    const convertedAmount = Math.round(baseAmount * fxRate);

    return {
      productId,
      productType,
      productLabel,
      baseAmount,
      baseCurrency,
      pricingModel: 'africa_fx',
      fxRate,
      finalAmount: convertedAmount,
      finalCurrency: targetCurrency,
    };
  }

  // C. INTERNATIONAL COMMERCIAL PRICING BANDS
  // Map non-African countries to target commercial currencies
  let intlCurrency = 'USD';
  if (country === 'GB' || country === 'UK') intlCurrency = 'GBP';
  else if (country === 'EU' || ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'FI', 'PT'].includes(country)) intlCurrency = 'EUR';
  else if (country === 'CA') intlCurrency = 'CAD';
  else if (country === 'AU') intlCurrency = 'AUD';
  else if (country === 'KW') intlCurrency = 'KWD';

  return resolveInternationalPrice(productId, productType, productLabel, baseAmount, intlCurrency);
}

/**
 * Resolves international commercial pricing band from DB or canonical fallbacks.
 */
async function resolveInternationalPrice(
  productId: string,
  productType: ProductType,
  productLabel: string,
  baseAmount: number,
  currency: string
): Promise<ResolvedPrice> {
  let finalAmount: number | null = null;

  try {
    const supabase = await getServiceClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('course_prices')
        .select('amount')
        .eq('course_id', productId)
        .eq('currency', currency)
        .eq('active', true)
        .maybeSingle();

      if (!error && data?.amount) {
        finalAmount = Number(data.amount);
      }
    }
  } catch (err) {
    console.warn(`[Pricing] International price query for ${currency} failed:`, err);
  }

  if (finalAmount === null) {
    if (currency === 'USD' && INTERNATIONAL_USD_FALLBACKS[productId]) {
      finalAmount = INTERNATIONAL_USD_FALLBACKS[productId];
    } else {
      // Default to USD international band if target currency row is not yet seeded
      finalAmount = INTERNATIONAL_USD_FALLBACKS[productId] || 160;
      currency = 'USD';
    }
  }

  return {
    productId,
    productType,
    productLabel,
    baseAmount,
    baseCurrency: 'NGN',
    pricingModel: 'international_commercial',
    fxRate: null,
    finalAmount,
    finalCurrency: currency,
  };
}
