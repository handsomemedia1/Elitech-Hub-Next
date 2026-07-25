'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type PriceInfo = {
  course_id: string;
  currency_code: string;
  symbol: string;
  amount: number;
};

type PricingContextType = {
  currency: string;
  symbol: string;
  prices: Record<string, PriceInfo>;
  loading: boolean;
  formatPrice: (courseId: string) => string;
  getPriceInfo: (courseId: string) => PriceInfo | null;
  changeCurrency: (newCurrency: string) => void;
};

const PricingContext = createContext<PricingContextType>({
  currency: 'NGN',
  symbol: '₦',
  prices: {},
  loading: true,
  formatPrice: () => '...',
  getPriceInfo: () => null,
  changeCurrency: () => {},
});

export const usePricing = () => useContext(PricingContext);

export function PricingProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState('NGN');
  const [symbol, setSymbol] = useState('₦');
  const [prices, setPrices] = useState<Record<string, PriceInfo>>({});
  const [loading, setLoading] = useState(true);

  // Fallback defaults if DB is empty or missing
  const fallbackPrices: Record<string, PriceInfo> = {
    // Programs
    'bootcamp': { course_id: 'bootcamp', currency_code: 'NGN', symbol: '₦', amount: 75000 },
    'professional': { course_id: 'professional', currency_code: 'NGN', symbol: '₦', amount: 200000 },
    'ai_training': { course_id: 'ai_training', currency_code: 'NGN', symbol: '₦', amount: 75000 },
    // Web Development
    'web-basic': { course_id: 'web-basic', currency_code: 'NGN', symbol: '₦', amount: 250000 },
    'web-dynamic': { course_id: 'web-dynamic', currency_code: 'NGN', symbol: '₦', amount: 350000 },
    'web-business': { course_id: 'web-business', currency_code: 'NGN', symbol: '₦', amount: 400000 },
    'web-ecommerce': { course_id: 'web-ecommerce', currency_code: 'NGN', symbol: '₦', amount: 700000 },
    // AI Chatbots
    'chatbot-basic': { course_id: 'chatbot-basic', currency_code: 'NGN', symbol: '₦', amount: 300000 },
    'chatbot-standard': { course_id: 'chatbot-standard', currency_code: 'NGN', symbol: '₦', amount: 500000 },
    'chatbot-premium': { course_id: 'chatbot-premium', currency_code: 'NGN', symbol: '₦', amount: 800000 },
    // Custom Scripts
    'script-basic': { course_id: 'script-basic', currency_code: 'NGN', symbol: '₦', amount: 300000 },
    'script-standard': { course_id: 'script-standard', currency_code: 'NGN', symbol: '₦', amount: 500000 },
    'script-premium': { course_id: 'script-premium', currency_code: 'NGN', symbol: '₦', amount: 800000 },
    // Penetration Testing
    'pentest-basic': { course_id: 'pentest-basic', currency_code: 'NGN', symbol: '₦', amount: 300000 },
    'pentest-standard': { course_id: 'pentest-standard', currency_code: 'NGN', symbol: '₦', amount: 500000 },
    'pentest-premium': { course_id: 'pentest-premium', currency_code: 'NGN', symbol: '₦', amount: 800000 },
  };

  const fetchPricesForCurrency = async (targetCurrency: string) => {
    setLoading(true);
    try {
      let { data: priceData, error } = await supabase
        .from('course_prices')
        .select('*')
        .eq('currency', targetCurrency);

      if (error || !priceData || priceData.length === 0) {
        // Fallback to USD if the requested currency doesn't exist
        const usdData = await supabase.from('course_prices').select('*').eq('currency', 'USD');
        if (usdData.data && usdData.data.length > 0) {
          priceData = usdData.data;
          targetCurrency = 'USD';
        } else {
          // Absolute fallback
          const ngnData = await supabase.from('course_prices').select('*').eq('currency', 'NGN');
          priceData = ngnData.data || [];
          targetCurrency = 'NGN';
        }
      }

      const priceMap: Record<string, PriceInfo> = {};
      const symbols: Record<string, string> = { NGN: '₦', USD: '$', EUR: '€', GBP: '£', CAD: 'C$' };
      let currentSymbol = symbols[targetCurrency] || targetCurrency + ' ';

      if (priceData && priceData.length > 0) {
        priceData.forEach((p) => {
          // Map DB columns to our frontend type
          priceMap[p.course_id] = {
            course_id: p.course_id,
            currency_code: p.currency,
            symbol: currentSymbol,
            amount: p.amount
          };
        });
        setPrices(priceMap);
        setSymbol(currentSymbol);
        setCurrency(targetCurrency);
      } else {
        setPrices(fallbackPrices);
      }
    } catch (err) {
      console.error('Pricing fetch error:', err);
      setPrices(fallbackPrices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function initPricing() {
      // Check if user manually selected a currency previously
      const savedCurrency = localStorage.getItem('elitech_currency');
      if (savedCurrency) {
        await fetchPricesForCurrency(savedCurrency);
        return;
      }

      // Auto-detect based on IP
      let detectedCurrency = 'NGN';
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.currency) {
            detectedCurrency = data.currency;
          }
        }
      } catch (e) {
        console.warn('Geolocation detection failed');
      }

      await fetchPricesForCurrency(detectedCurrency);
    }

    initPricing();
  }, []);

  const changeCurrency = async (newCurrency: string) => {
    localStorage.setItem('elitech_currency', newCurrency);
    await fetchPricesForCurrency(newCurrency);
  };

  const getPriceInfo = (courseId: string) => {
    return prices[courseId] || fallbackPrices[courseId] || null;
  };

  const formatPrice = (courseId: string) => {
    if (loading && Object.keys(prices).length === 0) return '...';
    
    const info = getPriceInfo(courseId);
    if (!info) return '...';
    
    const formattedAmount = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: Number.isInteger(info.amount) ? 0 : 2,
      maximumFractionDigits: 2
    }).format(info.amount);
    
    return `${info.symbol}${formattedAmount}`;
  };

  return (
    <PricingContext.Provider value={{ currency, symbol, prices, loading, formatPrice, getPriceInfo, changeCurrency }}>
      {children}
    </PricingContext.Provider>
  );
}
