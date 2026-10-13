/**
 * Paystack & Universal Payment Engine Types
 * Server-side type definitions for Phase 2B
 */

export type ProductType =
  | 'programme'
  | 'course'
  | 'consultation'
  | 'service'
  | 'coaching'
  | 'book'
  | 'resource'
  | 'sponsorship'
  | 'donation'
  | 'scholarship';

export type PricingModel = 'ngn_base' | 'africa_fx' | 'international_commercial';

export type TransactionStatus =
  | 'pending'
  | 'successful'
  | 'failed'
  | 'abandoned'
  | 'cancelled'
  | 'refunded';

export interface ResolvedPrice {
  productId: string;
  productType: ProductType;
  productLabel: string;
  baseAmount: number;
  baseCurrency: string;
  pricingModel: PricingModel;
  fxRate: number | null;
  finalAmount: number;
  finalCurrency: string;
}

export interface PaystackInitializeParams {
  email: string;
  amount: number; // in integer subunits (e.g. kobo, cents)
  currency: string;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string; // 'success' | 'failed' | 'abandoned'
    reference: string;
    amount: number; // in subunits
    currency: string;
    paid_at?: string;
    created_at?: string;
    channel?: string;
    gateway_response?: string;
    customer?: {
      email: string;
      customer_code?: string;
    };
    metadata?: Record<string, unknown>;
  };
}

export interface TransactionRecord {
  id: string;
  reference: string;
  provider: string;
  provider_reference: string | null;
  customer_email: string;
  customer_name: string | null;
  user_id: string | null;
  product_type: string;
  product_id: string;
  amount: number;
  currency: string;
  pricing_model: string;
  base_amount: number | null;
  base_currency: string | null;
  fx_rate: number | null;
  status: TransactionStatus;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  paid_at: string | null;
}
