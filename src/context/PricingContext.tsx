'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================================
// ELITECH HUB PRICING ENGINE
// ============================================================
// Single source of truth for all product pricing displayed on the frontend.
// Architecture:
//   1. Database (course_prices table) is the authoritative source.
//   2. This context fetches prices per detected/selected market region.
//   3. Nigerian base prices (NGN) are the canonical anchor for all products.
//   4. African countries use the AFRICA region — the DB or FX layer provides their price.
//   5. International (non-African) markets use controlled business-target prices from the DB.
//   6. Fallback prices below are ONLY used when the DB is unreachable.
//      They must always match the NGN prices in the DB exactly.
//   7. The payment system (Phase 2) will independently validate prices server-side.
//      Browser-supplied prices are NEVER trusted for payment amounts.
// ============================================================

// Internal business pricing region
export type PricingRegion = 'NG' | 'US' | 'UK' | 'EU' | 'KW' | 'AU' | 'CA' | 'AFRICA' | 'INTL';

export type PriceInfo = {
  course_id: string;
  currency_code: string;
  symbol: string;
  amount: number;
};

export type FxState = 'success' | 'fallback' | 'unavailable' | 'none';

type PricingContextType = {
  fxState: FxState;
  detectedCountry: string;
  selectedMarket: string;
  pricingRegion: PricingRegion;
  currency: string;
  symbol: string;
  prices: Record<string, PriceInfo>;
  loading: boolean;
  formatPrice: (courseId: string) => string;
  getPriceInfo: (courseId: string) => PriceInfo | null;
  changeMarket: (newMarket: string) => void;
};

// ============================================================
// FALLBACK PRICES
// These are used ONLY when the database is unreachable.
// They MUST match the NGN seed data in migration 008_product_prices.sql.
// Do NOT change these numbers without also updating the DB migration seed.
// ============================================================
const fallbackPrices: Record<string, PriceInfo> = {
  // === TRAINING PROGRAMMES ===
  'bootcamp':            { course_id: 'bootcamp',         currency_code: 'NGN', symbol: '₦', amount: 100000 },
  'professional':        { course_id: 'professional',     currency_code: 'NGN', symbol: '₦', amount: 300000 },
  'ai_training':         { course_id: 'ai_training',      currency_code: 'NGN', symbol: '₦', amount: 100000 },
  // === CONSULTATIONS ===
  'consultation-15':     { course_id: 'consultation-15',  currency_code: 'NGN', symbol: '₦', amount: 15000  },
  'consultation-30':     { course_id: 'consultation-30',  currency_code: 'NGN', symbol: '₦', amount: 30000  },
  'consultation-60':     { course_id: 'consultation-60',  currency_code: 'NGN', symbol: '₦', amount: 50000  },
  'consultation-90':     { course_id: 'consultation-90',  currency_code: 'NGN', symbol: '₦', amount: 70000  },
  'consultation-120':    { course_id: 'consultation-120', currency_code: 'NGN', symbol: '₦', amount: 100000 },
  // === SERVICES ===
  'web-basic':           { course_id: 'web-basic',        currency_code: 'NGN', symbol: '₦', amount: 250000 },
  'web-dynamic':         { course_id: 'web-dynamic',      currency_code: 'NGN', symbol: '₦', amount: 350000 },
  'web-business':        { course_id: 'web-business',     currency_code: 'NGN', symbol: '₦', amount: 400000 },
  'web-ecommerce':       { course_id: 'web-ecommerce',    currency_code: 'NGN', symbol: '₦', amount: 700000 },
  'chatbot-basic':       { course_id: 'chatbot-basic',    currency_code: 'NGN', symbol: '₦', amount: 300000 },
  'chatbot-standard':    { course_id: 'chatbot-standard', currency_code: 'NGN', symbol: '₦', amount: 500000 },
  'chatbot-premium':     { course_id: 'chatbot-premium',  currency_code: 'NGN', symbol: '₦', amount: 800000 },
  'script-basic':        { course_id: 'script-basic',     currency_code: 'NGN', symbol: '₦', amount: 300000 },
  'script-standard':     { course_id: 'script-standard',  currency_code: 'NGN', symbol: '₦', amount: 500000 },
  'script-premium':      { course_id: 'script-premium',   currency_code: 'NGN', symbol: '₦', amount: 800000 },
  'pentest-basic':       { course_id: 'pentest-basic',    currency_code: 'NGN', symbol: '₦', amount: 300000 },
  'pentest-standard':    { course_id: 'pentest-standard', currency_code: 'NGN', symbol: '₦', amount: 500000 },
  'pentest-premium':     { course_id: 'pentest-premium',  currency_code: 'NGN', symbol: '₦', amount: 800000 },
};

// African country codes — these markets use the AFRICA region (genuine FX conversion from NGN base)
// The DB should eventually carry GHS, KES, ZAR etc. rows.
// Until then, AFRICA region falls back to NGN to avoid artificial conversions.

const AFRICAN_CURRENCY_MAP: Record<string, string> = {
  GH: 'GHS', KE: 'KES', ZA: 'ZAR', EG: 'EGP', TZ: 'TZS', UG: 'UGX', RW: 'RWF',
  SN: 'XOF', CI: 'XOF', BF: 'XOF', ML: 'XOF', NE: 'XOF', TG: 'XOF', BJ: 'XOF', GW: 'XOF',
  CM: 'XAF', TD: 'XAF', CF: 'XAF', CG: 'XAF', GQ: 'XAF', GA: 'XAF',
  MA: 'MAD', DZ: 'DZD', TN: 'TND', MZ: 'MZN', ZM: 'ZMW', AO: 'AOA', MG: 'MGA', SO: 'SOS', ET: 'ETB'
};

  const AFRICAN_COUNTRY_CODES = new Set([
  'GH', 'KE', 'ZA', 'EG', 'TZ', 'UG', 'RW', 'ET', 'CI', 'SN',
  'CM', 'MA', 'DZ', 'TN', 'MZ', 'ZW', 'ZM', 'AO', 'MG', 'BF',
  'ML', 'NE', 'TD', 'SO', 'ER', 'SS', 'MR', 'GM', 'GW', 'GN',
  'SL', 'LR', 'TG', 'BJ', 'GQ', 'GA', 'CG', 'CD', 'CF', 'BI',
  'DJ', 'KM', 'SC', 'MU', 'CV', 'ST', 'SZ', 'LS', 'BW', 'NA',
  'MW', 'LY', 'SD', 'NG', // NG handled separately but included for completeness
]);

const PricingContext = createContext<PricingContextType>({
  fxState: 'none',
  detectedCountry: 'NG',
  selectedMarket: 'NG',
  pricingRegion: 'NG',
  currency: 'NGN',
  symbol: '₦',
  prices: fallbackPrices,
  loading: true,
  formatPrice: () => '...',
  getPriceInfo: () => null,
  changeMarket: () => {},
});

export const usePricing = () => useContext(PricingContext);

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [detectedCountry, setDetectedCountry] = useState('Unknown');
  const [selectedMarket, setSelectedMarket] = useState('Unknown');
  const [pricingRegion, setPricingRegion] = useState<PricingRegion>('NG');
  const [currency, setCurrency] = useState('NGN');
  const [symbol, setSymbol] = useState('₦');
  const [prices, setPrices] = useState<Record<string, PriceInfo>>(fallbackPrices);
  const [fxState, setFxState] = useState<FxState>('none');
  const [loading, setLoading] = useState(true);

  // ============================================================
  // REGION DETECTION
  // Maps any ISO country code to an internal pricing region.
  // Priority: NG → named regions → AFRICA → INTL
  // ============================================================
  const determinePricingRegion = (countryCode: string): PricingRegion => {
    const code = countryCode.toUpperCase();
    if (code === 'NG') return 'NG';
    if (code === 'US') return 'US';
    if (code === 'GB' || code === 'UK') return 'UK';
    if (code === 'KW') return 'KW';
    if (code === 'AU') return 'AU';
    if (code === 'CA') return 'CA';
    // EU Countries
    const euCountries = new Set(['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'IE', 'FI', 'PT',
      'GR', 'PL', 'CZ', 'HU', 'RO', 'SK', 'HR', 'BG', 'EE', 'LV', 'LT', 'LU', 'MT', 'CY', 'SI']);
    if (euCountries.has(code)) return 'EU';
    // African countries (excluding NG already handled above)
    if (AFRICAN_COUNTRY_CODES.has(code) && code !== 'NG') return 'AFRICA';
    return 'INTL'; // All other regions fall back to INTL (USD)
  };

  // ============================================================
  // CURRENCY MAPPING
  // Maps a pricing region to the ISO currency code stored in the DB.
  // ============================================================
  const regionToCurrency = (region: PricingRegion, countryCode: string): string => {
    switch (region) {
      case 'NG':     return 'NGN';
      case 'US':     return 'USD';
      case 'UK':     return 'GBP';
      case 'EU':     return 'EUR';
      case 'KW':     return 'KWD';
      case 'AU':     return 'AUD';
      case 'CA':     return 'CAD';
      case 'AFRICA': return AFRICAN_CURRENCY_MAP[countryCode] || 'USD'; // Genuine FX conversion targets this currency
      case 'INTL':   return 'USD'; // All other international markets use USD
      default:       return 'NGN';
    }
  };

  // Currency display symbols
  const CURRENCY_SYMBOLS: Record<string, string> = {
    NGN: '₦', USD: '$', EUR: '€', GBP: '£', KWD: 'KD', AUD: 'A$', CAD: 'C$',
    GHS: 'GH₵', KES: 'KSh', ZAR: 'R', EGP: 'E£', TZS: 'TSh', UGX: 'USh',
  };

  const getCookie = (name: string) => {
    if (typeof document === 'undefined') return null;
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
  };

  // ============================================================
  // PRICE FETCHER
  // Fetches all prices for the given region's currency from Supabase.
  // Falls back: requested currency → USD → NGN → in-memory fallback
  // ============================================================
  const fetchPricesForRegion = async (region: PricingRegion, countryCode: string) => {
    setLoading(true);
    let targetCurrency = regionToCurrency(region, countryCode);

    try {
      if (region === 'AFRICA' && targetCurrency !== 'NGN' && targetCurrency !== 'USD') {
        // --- AFRICAN FX CONVERSION PATH ---
        const { data: ngnData } = await supabase
          .from('course_prices')
          .select('course_id, currency, amount')
          .eq('currency', 'NGN')
          .eq('active', true);

        let rate = 1;
        let currentFxState: FxState = 'unavailable';
        try {
          const fxRes = await fetch('/api/fx');
          const fxData = await fxRes.json();
          if (fxData && fxData.rates && fxData.rates[targetCurrency]) {
            rate = fxData.rates[targetCurrency];
            currentFxState = fxData.result === 'fallback' ? 'fallback' : 'success';
          } else {
            console.warn('[Pricing] FX rate for ' + targetCurrency + ' not found.');
            currentFxState = 'unavailable';
          }
        } catch (e) {
          console.error('[Pricing] Failed to fetch FX rates.', e);
          currentFxState = 'unavailable';
        }

        const currentSymbol = CURRENCY_SYMBOLS[targetCurrency] || (targetCurrency + ' ');
        const priceMap: Record<string, PriceInfo> = {};
        const baseData = (ngnData && ngnData.length > 0) ? ngnData : Object.values(fallbackPrices);

        if (currentFxState !== 'unavailable') {
          baseData.forEach((p: { course_id: string; amount: number | string }) => {
            const rawConverted = Number(p.amount) * rate;
            priceMap[p.course_id] = {
              course_id: p.course_id,
              currency_code: targetCurrency,
              symbol: currentSymbol,
              amount: Math.round(rawConverted),
            };
          });

          const finalPrices: Record<string, PriceInfo> = {};
          for (const [courseId, fbPrice] of Object.entries(fallbackPrices)) {
               const rawConv = fbPrice.amount * rate;
               finalPrices[courseId] = {
                   course_id: courseId,
                   currency_code: targetCurrency,
                   symbol: currentSymbol,
                   amount: Math.round(rawConv)
               };
          }

          setPrices({ ...finalPrices, ...priceMap });
          setSymbol(currentSymbol);
          setCurrency(targetCurrency);
          setFxState(currentFxState);
        } else {
          // DO NOT SILENTLY CHANGE TO NGN.
          // Keep the targetCurrency as GHS, set prices to empty, set unavailable.
          setPrices({});
          setSymbol(currentSymbol);
          setCurrency(targetCurrency);
          setFxState('unavailable');
        }
      } else {
        // --- STANDARD INTERNATIONAL/NGN PATH ---
        const { data: initialPriceData, error } = await supabase
          .from('course_prices')
          .select('course_id, currency, amount')
          .eq('currency', targetCurrency)
          .eq('active', true);

        let priceData = initialPriceData;

        if (error || !priceData || priceData.length === 0) {
          console.warn('[Pricing] No data for ' + targetCurrency + '. Falling back to USD.');
          const usdFetch = await supabase
            .from('course_prices')
            .select('course_id, currency, amount')
            .eq('currency', 'USD')
            .eq('active', true);
          if (usdFetch.data && usdFetch.data.length > 0) {
            priceData = usdFetch.data;
            targetCurrency = 'USD';
          } else {
            console.warn('[Pricing] No USD data. Falling back to NGN.');
            const ngnFetch = await supabase
              .from('course_prices')
              .select('course_id, currency, amount')
              .eq('currency', 'NGN')
              .eq('active', true);
            priceData = ngnFetch.data || [];
            targetCurrency = 'NGN';
          }
        }

        const currentSymbol = CURRENCY_SYMBOLS[targetCurrency] || (targetCurrency + ' ');

        if (priceData && priceData.length > 0) {
          const priceMap: Record<string, PriceInfo> = {};
          priceData.forEach((p: { course_id: string; currency: string; amount: number }) => {
            priceMap[p.course_id] = {
              course_id: p.course_id,
              currency_code: p.currency,
              symbol: currentSymbol,
              amount: Number(p.amount),
            };
          });
          setPrices({ ...fallbackPrices, ...priceMap });
          setSymbol(currentSymbol);
          setCurrency(targetCurrency);
          setFxState('none');
        } else {
          setPrices(fallbackPrices);
          setSymbol('₦');
          setCurrency('NGN');
          setFxState('none');
        }
      }
    } catch (err) {
      console.error('[Pricing] Fetch error:', err);
      // Fallback explicitly to unavailable if we were in Africa
      if (region === 'AFRICA' && targetCurrency !== 'NGN' && targetCurrency !== 'USD') {
        setPrices({});
        setFxState('unavailable');
      } else {
        setPrices(fallbackPrices);
        setSymbol('₦');
        setCurrency('NGN');
        setFxState('none');
      }
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INITIALISATION
  // Priority: explicit user selection → edge country cookie → ipapi fallback → NG default
  // ============================================================
  useEffect(() => {
    async function initPricing() {
      // 1. Explicit user market selection (highest authority)
      const savedMarket = localStorage.getItem('elitech_market');

      // 2. Server/edge detected country (injected via Middleware cookie)
      const edgeCountry = getCookie('detected_country');

      // We do NOT use timezone or navigator.language as authoritative signals.

      let finalCountry = 'Unknown';
      let finalMarket = 'Unknown';

      if (edgeCountry) {
        finalCountry = edgeCountry.toUpperCase();
      } else {
        // 3. Weak browser fallback (ipapi) — only if edge detection fails
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data.country_code) {
              finalCountry = data.country_code.toUpperCase();
            }
          }
        } catch {
          console.warn('[Pricing] Geolocation detection failed. Using NG default.');
        }
      }

      setDetectedCountry(finalCountry);

      // User-selected market takes precedence over detected country
      if (savedMarket) {
        finalMarket = savedMarket;
      } else {
        // Defined safe fallback: if detection entirely fails, default to NG
        finalMarket = finalCountry !== 'Unknown' ? finalCountry : 'NG';
      }

      setSelectedMarket(finalMarket);

      const region = determinePricingRegion(finalMarket);
      setPricingRegion(region);

      await fetchPricesForRegion(region, finalMarket);
    }

    initPricing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // MARKET CHANGE (manual user override)
  // ============================================================
  const changeMarket = async (newMarket: string) => {
    localStorage.setItem('elitech_market', newMarket);
    setSelectedMarket(newMarket);
    const region = determinePricingRegion(newMarket);
    setPricingRegion(region);
    await fetchPricesForRegion(region, newMarket);
  };

  // ============================================================
  // PUBLIC API
  // ============================================================
  const getPriceInfo = (courseId: string): PriceInfo | null => {
    return prices[courseId] || fallbackPrices[courseId] || null;
  };

  const formatPrice = (courseId: string): string => {
    if (loading && Object.keys(prices).length === 0) return '...';

    const info = getPriceInfo(courseId);
    if (!info) return '...';

    // For whole-number amounts, show no decimal places
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: Number.isInteger(info.amount) ? 0 : 2,
      maximumFractionDigits: 2,
    }).format(info.amount);

    return `${info.symbol}${formattedAmount}`;
  };

  return (
    <PricingContext.Provider value={{
      detectedCountry,
      selectedMarket,
      pricingRegion,
      currency,
      fxState,
      symbol,
      prices,
      loading,
      formatPrice,
      getPriceInfo,
      changeMarket,
    }}>
      {children}
    </PricingContext.Provider>
  );
}
