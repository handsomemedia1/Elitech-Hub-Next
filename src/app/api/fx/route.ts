import { NextResponse } from 'next/server';

export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/NGN', {
      next: { revalidate: 3600 }
    });
    
    if (!res.ok) {
      throw new Error(`FX API Error: ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[FX API Error]', err);
    // Safe fallback rates if the external API is entirely down
    return NextResponse.json({
      result: "fallback",
      base_code: "NGN",
      rates: {
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
        NGN: 1
      }
    });
  }
}
