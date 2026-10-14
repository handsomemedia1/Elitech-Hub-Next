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
import { isPaystackLiveMode } from './config';

export interface PricingResolutionOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseClient?: any;
  enforceProductionRules?: boolean;
}

export function isProductionPricingEnforced(options?: PricingResolutionOptions): boolean {
  if (options?.enforceProductionRules !== undefined) {
    return options.enforceProductionRules;
  }
  return process.env.NODE_ENV === 'production' || isPaystackLiveMode();
}

// ============================================================
// CANONICAL NIGERIAN BASE PRICES (Fallback if DB is unreachable)
// Matches migration 008_product_prices.sql & PricingContext.tsx
// ============================================================
export type ProductStatus = 'active' | 'retired' | 'non_purchasable';

export interface ProductDefinition {
  id: string;
  type: ProductType;
  label: string;
  ngnBaseAmount: number;
  status: ProductStatus;
}

export const CANONICAL_PRODUCTS: Record<string, ProductDefinition> = Object.freeze({
  // Training Programmes
  // NOTE: 'bootcamp' (6-Week Cybersecurity Bootcamp) is retired from active public offerings.
  // Preserved for historical receipt lookup and transaction audit integrity only.
  // New checkout is strictly rejected by resolveAuthoritativePrice with PRODUCT_DISCONTINUED.
  'bootcamp': {
    id: 'bootcamp',
    type: 'programme',
    label: '6-Week Cybersecurity Bootcamp',
    ngnBaseAmount: 100000,
    status: 'retired',
  },
  'professional': {
    id: 'professional',
    type: 'programme',
    label: '16-Week Professional Cybersecurity Programme',
    ngnBaseAmount: 350000, // Updated: was ₦300,000
    status: 'active',
  },
  'ai_training': {
    id: 'ai_training',
    type: 'programme',
    label: 'AI-Powered Cybersecurity Programme',
    ngnBaseAmount: 100000, // 6 weeks, ₦100,000
    status: 'active',
  },
  'ai_security': {
    id: 'ai_security',
    type: 'programme',
    label: 'AI Security and Reverse Vulnerability',
    ngnBaseAmount: 200000, // 8 weeks, ₦200,000
    status: 'active',
  },
  // Internship: Part of 16-Week Professional Programme, non-purchasable separately
  'internship': {
    id: 'internship',
    type: 'programme',
    label: 'Internship Experience',
    ngnBaseAmount: 0,
    status: 'non_purchasable',
  },

  // Consultations
  'consultation-15': {
    id: 'consultation-15',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 15 Minutes',
    ngnBaseAmount: 15000,
    status: 'active',
  },
  'consultation-30': {
    id: 'consultation-30',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 30 Minutes',
    ngnBaseAmount: 30000,
    status: 'active',
  },
  'consultation-60': {
    id: 'consultation-60',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 60 Minutes',
    ngnBaseAmount: 50000,
    status: 'active',
  },
  'consultation-90': {
    id: 'consultation-90',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 90 Minutes',
    ngnBaseAmount: 70000,
    status: 'active',
  },
  'consultation-120': {
    id: 'consultation-120',
    type: 'consultation',
    label: 'Cybersecurity Consultation – 120 Minutes',
    ngnBaseAmount: 100000,
    status: 'active',
  },

  // Services
  'web-basic': { id: 'web-basic', type: 'service', label: 'Web Development – Basic', ngnBaseAmount: 250000, status: 'active' },
  'web-dynamic': { id: 'web-dynamic', type: 'service', label: 'Web Development – Dynamic', ngnBaseAmount: 350000, status: 'active' },
  'web-business': { id: 'web-business', type: 'service', label: 'Web Development – Business', ngnBaseAmount: 400000, status: 'active' },
  'web-ecommerce': { id: 'web-ecommerce', type: 'service', label: 'Web Development – E-Commerce', ngnBaseAmount: 700000, status: 'active' },
  'chatbot-basic': { id: 'chatbot-basic', type: 'service', label: 'AI Chatbot – Basic', ngnBaseAmount: 300000, status: 'active' },
  'chatbot-standard': { id: 'chatbot-standard', type: 'service', label: 'AI Chatbot – Standard', ngnBaseAmount: 500000, status: 'active' },
  'chatbot-premium': { id: 'chatbot-premium', type: 'service', label: 'AI Chatbot – Premium', ngnBaseAmount: 800000, status: 'active' },
  'script-basic': { id: 'script-basic', type: 'service', label: 'Custom Script – Basic', ngnBaseAmount: 300000, status: 'active' },
  'script-standard': { id: 'script-standard', type: 'service', label: 'Custom Script – Standard', ngnBaseAmount: 500000, status: 'active' },
  'script-premium': { id: 'script-premium', type: 'service', label: 'Custom Script – Premium', ngnBaseAmount: 800000, status: 'active' },
  'pentest-basic': { id: 'pentest-basic', type: 'service', label: 'Penetration Testing – Basic', ngnBaseAmount: 300000, status: 'active' },
  'pentest-standard': { id: 'pentest-standard', type: 'service', label: 'Penetration Testing – Standard', ngnBaseAmount: 500000, status: 'active' },
  'pentest-premium': { id: 'pentest-premium', type: 'service', label: 'Penetration Testing – Premium', ngnBaseAmount: 800000, status: 'active' },
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
// Strictly mapped to currencies directly supported by Paystack checkout (GHS, KES, ZAR, XOF).
export const AFRICAN_CURRENCY_MAP: Record<string, string> = {
  GH: 'GHS', // Ghana
  KE: 'KES', // Kenya
  ZA: 'ZAR', // South Africa
  // WAEMU member states using West African CFA franc (XOF)
  SN: 'XOF', CI: 'XOF', BF: 'XOF', ML: 'XOF', NE: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF',
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
  // 1. Cloudflare CF-IPCountry header represents the real visitor IP's country at the outermost CDN edge
  const cfCountry = request.headers.get('cf-ipcountry')?.trim().toUpperCase();
  if (cfCountry && cfCountry.length === 2 && cfCountry !== 'XX') {
    return cfCountry;
  }

  // 2. Vercel x-vercel-ip-country header (direct fallback when request bypasses Cloudflare)
  const vercelCountry = request.headers.get('x-vercel-ip-country')?.trim().toUpperCase();
  if (vercelCountry && vercelCountry.length === 2 && vercelCountry !== 'XX') {
    return vercelCountry;
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

// Approved international commercial pricing bands (USD)
// Business-approved prices for active programmes and consultations:
//   - ai_training:  $160 USD
//   - ai_security:  $250 USD
//   - professional: $500 USD
export const INTERNATIONAL_USD_FALLBACKS: Record<string, number> = {
  'professional': 500,
  'ai_training': 160,
  'ai_security': 250,
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
 * Rejects retired courses (PRODUCT_DISCONTINUED) and non-purchasable items (PRODUCT_UNAVAILABLE).
 */
export async function resolveAuthoritativePrice(
  rawProductId: string,
  rawProductType?: string,
  countryCode?: string,
  options?: PricingResolutionOptions
): Promise<ResolvedPrice> {
  const productId = normalizeProductId(rawProductId);
  const productDef = CANONICAL_PRODUCTS[productId];

  if (!productDef) {
    throw new PricingError(
      `Product "${rawProductId}" is unknown or unavailable.`,
      'UNKNOWN_PRODUCT'
    );
  }

  // 1. Enforce product lifecycle gates
  if (productDef.status === 'retired') {
    throw new PricingError(
      `Product "${productDef.label}" (${productId}) has been retired from active offerings and cannot be purchased.`,
      'PRODUCT_DISCONTINUED'
    );
  }

  if (productDef.status === 'non_purchasable') {
    throw new PricingError(
      `Product "${productDef.label}" (${productId}) is not available for individual purchase.`,
      'PRODUCT_UNAVAILABLE'
    );
  }

  const productType = (rawProductType || productDef.type) as ProductType;
  const productLabel = productDef.label;
  const mustEnforceProduction = isProductionPricingEnforced(options);

  // 2. Fetch base NGN price (authoritative from DB or fallback)
  let baseAmount = productDef.ngnBaseAmount;
  const baseCurrency = 'NGN';

  const supabase = options?.supabaseClient ?? (await getServiceClient());

  if (!supabase && mustEnforceProduction) {
    throw new PricingError(
      'The pricing database is unavailable. Checkout is temporarily disabled.',
      'PRICE_DATABASE_UNAVAILABLE'
    );
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('course_prices')
        .select('amount, currency_code, course_id, active')
        .eq('course_id', productId)
        .eq('currency_code', 'NGN')
        .maybeSingle();

      if (error) {
        console.error('[Pricing] Database query error for NGN price:', error.message);
        if (mustEnforceProduction) {
          throw new PricingError(
            'The authoritative price could not be verified due to a database error. Please try again later.',
            'PRICE_LOOKUP_FAILED'
          );
        }
      }

      if (data?.active === false) {
        throw new PricingError(
          `Product "${productDef.label}" (${productId}) has been retired from active offerings and cannot be purchased.`,
          'PRODUCT_DISCONTINUED'
        );
      }

      if (data?.amount !== undefined && data?.amount !== null) {
        const parsed = Number(data.amount);
        if (Number.isFinite(parsed) && parsed > 0) {
          baseAmount = parsed;
        } else if (mustEnforceProduction) {
          throw new PricingError(
            `Authoritative price data for "${productLabel}" (${productId}) is invalid in the database.`,
            'INVALID_PRICE_DATA'
          );
        }
      } else if (mustEnforceProduction) {
        throw new PricingError(
          `No active NGN price is configured in the database for "${productDef.label}" (${productId}).`,
          'PRICE_UNAVAILABLE'
        );
      }
    } catch (err) {
      if (err instanceof PricingError) {
        throw err;
      }
      if (mustEnforceProduction) {
        throw new PricingError(
          'The authoritative price could not be verified due to a database error. Please try again later.',
          'PRICE_LOOKUP_FAILED'
        );
      }
      console.warn('[Pricing] Supabase price lookup failed, using canonical fallback:', err);
    }
  }

  if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
    throw new PricingError(
      `Authoritative base price for "${productLabel}" (${productId}) is invalid.`,
      'INVALID_PRICE_DATA'
    );
  }

  // 3. Determine geographic market
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
      // African country without a direct Paystack checkout currency mapping routes to USD commercial pricing
      return resolveInternationalPrice(productId, productType, productLabel, baseAmount, 'USD', options);
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
    if (!Number.isFinite(convertedAmount) || convertedAmount <= 0) {
      throw new PricingError(
        `Calculated amount for "${targetCurrency}" is invalid.`,
        'INVALID_PRICE_DATA'
      );
    }

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
  // All non-African international checkouts use approved USD commercial pricing
  return resolveInternationalPrice(productId, productType, productLabel, baseAmount, 'USD', options);
}

/**
 * Resolves international commercial pricing band from DB or canonical fallbacks.
 * Enforces business approved prices and fails closed with PRICING_NOT_CONFIGURED
 * if no international price exists (never invents prices or defaults to generic numbers).
 */
export async function resolveInternationalPrice(
  productId: string,
  productType: ProductType,
  productLabel: string,
  baseAmount: number,
  currency: string = 'USD',
  options?: PricingResolutionOptions
): Promise<ResolvedPrice> {
  let finalAmount: number | null = null;
  const targetCurrency = currency.toUpperCase().trim();
  const mustEnforceProduction = isProductionPricingEnforced(options);

  const supabase = options?.supabaseClient ?? (await getServiceClient());

  if (!supabase && mustEnforceProduction) {
    throw new PricingError(
      'The pricing database is unavailable. Checkout is temporarily disabled.',
      'PRICE_DATABASE_UNAVAILABLE'
    );
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('course_prices')
        .select('amount, currency_code, course_id, active')
        .eq('course_id', productId)
        .eq('currency_code', targetCurrency)
        .maybeSingle();

      if (error) {
        console.error(`[Pricing] International price query for ${targetCurrency} failed:`, error.message);
        if (mustEnforceProduction) {
          throw new PricingError(
            'The authoritative price could not be verified due to a database error. Please try again later.',
            'PRICE_LOOKUP_FAILED'
          );
        }
      }

      if (data?.active === false) {
        throw new PricingError(
          `Product "${productLabel}" (${productId}) has been retired from active offerings and cannot be purchased.`,
          'PRODUCT_DISCONTINUED'
        );
      }

      if (data?.amount !== undefined && data?.amount !== null) {
        const parsed = Number(data.amount);
        if (Number.isFinite(parsed) && parsed > 0) {
          finalAmount = parsed;
        } else if (mustEnforceProduction) {
          throw new PricingError(
            `Authoritative international price data for "${productLabel}" (${productId}) is invalid in the database.`,
            'INVALID_PRICE_DATA'
          );
        }
      } else if (mustEnforceProduction) {
        throw new PricingError(
          `No active ${targetCurrency} price is configured in the database for "${productLabel}" (${productId}).`,
          'PRICE_UNAVAILABLE'
        );
      }
    } catch (err) {
      if (err instanceof PricingError) {
        throw err;
      }
      if (mustEnforceProduction) {
        throw new PricingError(
          'The authoritative price could not be verified due to a database error. Please try again later.',
          'PRICE_LOOKUP_FAILED'
        );
      }
      console.warn(`[Pricing] International price query for ${targetCurrency} failed:`, err);
    }
  }

  if (finalAmount === null && !mustEnforceProduction) {
    if (targetCurrency === 'USD' && INTERNATIONAL_USD_FALLBACKS[productId] !== undefined) {
      finalAmount = INTERNATIONAL_USD_FALLBACKS[productId];
    }
  }

  if (finalAmount === null || !Number.isFinite(finalAmount) || finalAmount <= 0) {
    throw new PricingError(
      `International pricing (${targetCurrency}) is not yet configured for "${productLabel}" (${productId}). Please contact support or register locally.`,
      'PRICING_NOT_CONFIGURED'
    );
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
    finalCurrency: targetCurrency,
  };
}
