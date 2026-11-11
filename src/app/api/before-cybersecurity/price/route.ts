import { NextResponse } from 'next/server';
import {
  getTrustedServerCountry,
  resolveAuthoritativePrice,
  resolveEffectivePricingCountry,
  PricingError,
} from '@/lib/paystack/pricing';

export const dynamic = 'force-dynamic';

/**
 * Returns the Before Cybersecurity price for the visitor's country, worked out
 * on the server from the visitor's location. Checkout uses the same function,
 * so the price shown on the page is always the price charged.
 */
export async function GET(request: Request) {
  const detected = getTrustedServerCountry(request);
  const country = resolveEffectivePricingCountry(null, detected);

  try {
    const price = await resolveAuthoritativePrice('before-cybersecurity', 'book', country);
    let formatted: string;
    try {
      formatted = new Intl.NumberFormat('en', {
        style: 'currency',
        currency: price.finalCurrency,
        maximumFractionDigits: 0,
      }).format(price.finalAmount);
    } catch {
      formatted = `${price.finalCurrency} ${price.finalAmount.toLocaleString('en')}`;
    }

    return NextResponse.json(
      {
        country,
        detected: !!detected,
        amount: price.finalAmount,
        currency: price.finalCurrency,
        formatted,
      },
      // Personal to the visitor's location: never cache in shared caches.
      { headers: { 'Cache-Control': 'private, no-store' } }
    );
  } catch (err) {
    const message = err instanceof PricingError ? err.message : 'Price unavailable';
    console.error('[Before-Cybersecurity Price]', err);
    return NextResponse.json({ error: message }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
