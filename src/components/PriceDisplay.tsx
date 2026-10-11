'use client';

import React from 'react';
import { usePricing } from '@/context/PricingContext';

// All product IDs that PriceDisplay can render.
export type ProductId =
  | 'bootcamp'
  | 'professional'
  | 'ai_training'
  | 'consultation-15'
  | 'consultation-30'
  | 'consultation-60'
  | 'consultation-90'
  | 'consultation-120'
  | 'web-basic'
  | 'web-dynamic'
  | 'web-business'
  | 'web-ecommerce'
  | 'chatbot-basic'
  | 'chatbot-standard'
  | 'chatbot-premium'
  | 'script-basic'
  | 'script-standard'
  | 'script-premium'
  | 'pentest-basic'
  | 'pentest-standard'
  | 'pentest-premium';

type PriceDisplayProps = {
  courseId: ProductId;
  fallback?: string;
};

export default function PriceDisplay({ courseId, fallback }: PriceDisplayProps) {
  const { formatPrice, loading, prices, fxState } = usePricing();

  if (fxState === 'unavailable') {
    return <span style={{ color: '#ef4444', fontWeight: 500, fontSize: '0.9em' }}>Price temporarily unavailable</span>;
  }

  if (loading && Object.keys(prices).length === 0) {
    return <span>...</span>;
  }

  const formatted = formatPrice(courseId);
  return <span>{formatted !== '...' ? formatted : (fallback || '...')}</span>;
}
