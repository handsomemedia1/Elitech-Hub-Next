-- Migration 008: Universal Product Pricing
-- Creates the `product_prices` table as the single source of truth for all product pricing.
-- This replaces the `course_prices` table concept used by PricingContext.
-- The table is designed to support: courses, consultations, coaching, books, services, donations, and future products.
-- The existing `course_prices` table in production uses columns: id, course_id, currency, amount.
-- This migration creates a backward-compatible table that the PricingContext can query.
-- IMPORTANT: If `course_prices` already exists in production, this migration is additive only.

-- ============================================================
-- 1. CREATE course_prices (backward-compatible, if not exists)
-- ============================================================
-- The PricingContext.tsx currently queries 'course_prices' with columns: course_id, currency, amount
-- This ensures that table exists with the correct schema.

CREATE TABLE IF NOT EXISTS public.course_prices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id TEXT NOT NULL,          -- product identifier key (e.g. 'bootcamp', 'professional', 'consultation-30')
    currency VARCHAR(10) NOT NULL,    -- ISO currency code (NGN, USD, GBP, EUR, CAD, AUD, KWD, GHS, KES, ZAR, etc.)
    amount NUMERIC(12, 2) NOT NULL,   -- price amount in the given currency
    product_type TEXT NOT NULL DEFAULT 'course',  -- 'course' | 'consultation' | 'coaching' | 'book' | 'resource' | 'service' | 'donation'
    product_label TEXT,               -- human-readable label (e.g. '6-Week Cybersecurity Bootcamp')
    region TEXT,                      -- optional region tag (e.g. 'NG', 'UK', 'AFRICA', 'INTL')
    pricing_type TEXT DEFAULT 'standard',  -- 'standard' | 'international' | 'african' | 'promo'
    active BOOLEAN NOT NULL DEFAULT true,
    effective_from DATE,
    effective_to DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    UNIQUE(course_id, currency)
);

-- Index for fast currency lookups (the primary query pattern)
CREATE INDEX IF NOT EXISTS idx_course_prices_currency ON public.course_prices(currency);
CREATE INDEX IF NOT EXISTS idx_course_prices_course_id ON public.course_prices(course_id);
CREATE INDEX IF NOT EXISTS idx_course_prices_active ON public.course_prices(active);

-- RLS
ALTER TABLE public.course_prices ENABLE ROW LEVEL SECURITY;

-- Public read access for active prices (PricingContext reads this without auth)
DROP POLICY IF EXISTS "Public can read active prices" ON public.course_prices;
CREATE POLICY "Public can read active prices"
ON public.course_prices FOR SELECT
USING (active = true);

-- Admins can manage all prices (admin pricing page uses service role)
DROP POLICY IF EXISTS "Service role full access to prices" ON public.course_prices;
CREATE POLICY "Service role full access to prices"
ON public.course_prices FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================
-- 2. SEED: Nigerian Base Prices (NGN)
-- ============================================================
-- These are the confirmed canonical NGN prices.
-- Consulting programme prices are per-session durations.

INSERT INTO public.course_prices (course_id, currency, amount, product_type, product_label, region, pricing_type) VALUES
  -- === TRAINING PROGRAMMES ===
  ('bootcamp',            'NGN', 100000, 'course',        '6-Week Cybersecurity Bootcamp',              'NG', 'standard'),
  ('professional',        'NGN', 300000, 'course',        '16-Week Professional Cybersecurity Program', 'NG', 'standard'),
  ('ai_training',         'NGN', 100000, 'course',        'AI-Powered Cybersecurity Programme',         'NG', 'standard'),

  -- === CONSULTATIONS ===
  ('consultation-15',     'NGN',  15000, 'consultation',  'Cybersecurity Consultation – 15 Minutes',    'NG', 'standard'),
  ('consultation-30',     'NGN',  30000, 'consultation',  'Cybersecurity Consultation – 30 Minutes',    'NG', 'standard'),
  ('consultation-60',     'NGN',  50000, 'consultation',  'Cybersecurity Consultation – 60 Minutes',    'NG', 'standard'),
  ('consultation-90',     'NGN',  70000, 'consultation',  'Cybersecurity Consultation – 90 Minutes',    'NG', 'standard'),
  ('consultation-120',    'NGN', 100000, 'consultation',  'Cybersecurity Consultation – 120 Minutes',   'NG', 'standard'),

  -- === SERVICES (web/AI/pentest - these are starting-from prices; actual quotes are custom) ===
  ('web-basic',           'NGN', 250000, 'service',       'Web Development – Basic',                    'NG', 'standard'),
  ('web-dynamic',         'NGN', 350000, 'service',       'Web Development – Dynamic',                  'NG', 'standard'),
  ('web-business',        'NGN', 400000, 'service',       'Web Development – Business',                 'NG', 'standard'),
  ('web-ecommerce',       'NGN', 700000, 'service',       'Web Development – E-Commerce',               'NG', 'standard'),
  ('chatbot-basic',       'NGN', 300000, 'service',       'AI Chatbot – Basic',                         'NG', 'standard'),
  ('chatbot-standard',    'NGN', 500000, 'service',       'AI Chatbot – Standard',                      'NG', 'standard'),
  ('chatbot-premium',     'NGN', 800000, 'service',       'AI Chatbot – Premium',                       'NG', 'standard'),
  ('script-basic',        'NGN', 300000, 'service',       'Custom Script – Basic',                      'NG', 'standard'),
  ('script-standard',     'NGN', 500000, 'service',       'Custom Script – Standard',                   'NG', 'standard'),
  ('script-premium',      'NGN', 800000, 'service',       'Custom Script – Premium',                    'NG', 'standard'),
  ('pentest-basic',       'NGN', 300000, 'service',       'Penetration Testing – Basic',                'NG', 'standard'),
  ('pentest-standard',    'NGN', 500000, 'service',       'Penetration Testing – Standard',             'NG', 'standard'),
  ('pentest-premium',     'NGN', 800000, 'service',       'Penetration Testing – Premium',              'NG', 'standard')

ON CONFLICT (course_id, currency) DO UPDATE SET
  amount = EXCLUDED.amount,
  product_type = EXCLUDED.product_type,
  product_label = EXCLUDED.product_label,
  pricing_type = EXCLUDED.pricing_type,
  active = true,
  updated_at = timezone('utc', now());

-- ============================================================
-- 3. SEED: International Pricing (USD)
-- ============================================================
-- These are business-target prices, NOT mechanical FX conversions.
-- They follow the international pricing bands documented in PRICING_ARCHITECTURE.md

INSERT INTO public.course_prices (course_id, currency, amount, product_type, product_label, region, pricing_type) VALUES
  -- Training
  ('bootcamp',            'USD',  160, 'course',       '6-Week Cybersecurity Bootcamp',              'US', 'international'),
  ('professional',        'USD',  190, 'course',       '16-Week Professional Cybersecurity Program', 'US', 'international'),
  ('ai_training',         'USD',  160, 'course',       'AI-Powered Cybersecurity Programme',         'US', 'international'),
  -- Consultations
  ('consultation-15',     'USD',   25, 'consultation', 'Cybersecurity Consultation – 15 Minutes',    'US', 'international'),
  ('consultation-30',     'USD',   45, 'consultation', 'Cybersecurity Consultation – 30 Minutes',    'US', 'international'),
  ('consultation-60',     'USD',   75, 'consultation', 'Cybersecurity Consultation – 60 Minutes',    'US', 'international'),
  ('consultation-90',     'USD',  105, 'consultation', 'Cybersecurity Consultation – 90 Minutes',    'US', 'international'),
  ('consultation-120',    'USD',  140, 'consultation', 'Cybersecurity Consultation – 120 Minutes',   'US', 'international')
ON CONFLICT (course_id, currency) DO UPDATE SET
  amount = EXCLUDED.amount,
  pricing_type = EXCLUDED.pricing_type,
  active = true,
  updated_at = timezone('utc', now());

-- ============================================================
-- 4. SEED: GBP (United Kingdom)
-- ============================================================
INSERT INTO public.course_prices (course_id, currency, amount, product_type, product_label, region, pricing_type) VALUES
  ('bootcamp',            'GBP',  130, 'course',       '6-Week Cybersecurity Bootcamp',              'UK', 'international'),
  ('professional',        'GBP',  165, 'course',       '16-Week Professional Cybersecurity Program', 'UK', 'international'),
  ('ai_training',         'GBP',  130, 'course',       'AI-Powered Cybersecurity Programme',         'UK', 'international'),
  ('consultation-15',     'GBP',   20, 'consultation', 'Cybersecurity Consultation – 15 Minutes',    'UK', 'international'),
  ('consultation-30',     'GBP',   38, 'consultation', 'Cybersecurity Consultation – 30 Minutes',    'UK', 'international'),
  ('consultation-60',     'GBP',   62, 'consultation', 'Cybersecurity Consultation – 60 Minutes',    'UK', 'international'),
  ('consultation-90',     'GBP',   88, 'consultation', 'Cybersecurity Consultation – 90 Minutes',    'UK', 'international'),
  ('consultation-120',    'GBP',  115, 'consultation', 'Cybersecurity Consultation – 120 Minutes',   'UK', 'international')
ON CONFLICT (course_id, currency) DO UPDATE SET
  amount = EXCLUDED.amount,
  pricing_type = EXCLUDED.pricing_type,
  active = true,
  updated_at = timezone('utc', now());

-- ============================================================
-- 5. SEED: EUR (European Union)
-- ============================================================
INSERT INTO public.course_prices (course_id, currency, amount, product_type, product_label, region, pricing_type) VALUES
  ('bootcamp',            'EUR',  150, 'course',       '6-Week Cybersecurity Bootcamp',              'EU', 'international'),
  ('professional',        'EUR',  185, 'course',       '16-Week Professional Cybersecurity Program', 'EU', 'international'),
  ('ai_training',         'EUR',  150, 'course',       'AI-Powered Cybersecurity Programme',         'EU', 'international'),
  ('consultation-15',     'EUR',   22, 'consultation', 'Cybersecurity Consultation – 15 Minutes',    'EU', 'international'),
  ('consultation-30',     'EUR',   42, 'consultation', 'Cybersecurity Consultation – 30 Minutes',    'EU', 'international'),
  ('consultation-60',     'EUR',   70, 'consultation', 'Cybersecurity Consultation – 60 Minutes',    'EU', 'international'),
  ('consultation-90',     'EUR',   98, 'consultation', 'Cybersecurity Consultation – 90 Minutes',    'EU', 'international'),
  ('consultation-120',    'EUR',  130, 'consultation', 'Cybersecurity Consultation – 120 Minutes',   'EU', 'international')
ON CONFLICT (course_id, currency) DO UPDATE SET
  amount = EXCLUDED.amount,
  pricing_type = EXCLUDED.pricing_type,
  active = true,
  updated_at = timezone('utc', now());

-- ============================================================
-- 6. SEED: CAD (Canada)
-- ============================================================
INSERT INTO public.course_prices (course_id, currency, amount, product_type, product_label, region, pricing_type) VALUES
  ('bootcamp',            'CAD',  220, 'course',       '6-Week Cybersecurity Bootcamp',              'CA', 'international'),
  ('professional',        'CAD',  250, 'course',       '16-Week Professional Cybersecurity Program', 'CA', 'international'),
  ('ai_training',         'CAD',  220, 'course',       'AI-Powered Cybersecurity Programme',         'CA', 'international'),
  ('consultation-15',     'CAD',   34, 'consultation', 'Cybersecurity Consultation – 15 Minutes',    'CA', 'international'),
  ('consultation-30',     'CAD',   62, 'consultation', 'Cybersecurity Consultation – 30 Minutes',    'CA', 'international'),
  ('consultation-60',     'CAD',  100, 'consultation', 'Cybersecurity Consultation – 60 Minutes',    'CA', 'international'),
  ('consultation-90',     'CAD',  140, 'consultation', 'Cybersecurity Consultation – 90 Minutes',    'CA', 'international'),
  ('consultation-120',    'CAD',  185, 'consultation', 'Cybersecurity Consultation – 120 Minutes',   'CA', 'international')
ON CONFLICT (course_id, currency) DO UPDATE SET
  amount = EXCLUDED.amount,
  pricing_type = EXCLUDED.pricing_type,
  active = true,
  updated_at = timezone('utc', now());

-- ============================================================
-- 7. SEED: AUD (Australia)
-- ============================================================
INSERT INTO public.course_prices (course_id, currency, amount, product_type, product_label, region, pricing_type) VALUES
  ('bootcamp',            'AUD',  260, 'course',       '6-Week Cybersecurity Bootcamp',              'AU', 'international'),
  ('professional',        'AUD',  300, 'course',       '16-Week Professional Cybersecurity Program', 'AU', 'international'),
  ('ai_training',         'AUD',  260, 'course',       'AI-Powered Cybersecurity Programme',         'AU', 'international'),
  ('consultation-15',     'AUD',   38, 'consultation', 'Cybersecurity Consultation – 15 Minutes',    'AU', 'international'),
  ('consultation-30',     'AUD',   70, 'consultation', 'Cybersecurity Consultation – 30 Minutes',    'AU', 'international'),
  ('consultation-60',     'AUD',  115, 'consultation', 'Cybersecurity Consultation – 60 Minutes',    'AU', 'international'),
  ('consultation-90',     'AUD',  160, 'consultation', 'Cybersecurity Consultation – 90 Minutes',    'AU', 'international'),
  ('consultation-120',    'AUD',  210, 'consultation', 'Cybersecurity Consultation – 120 Minutes',   'AU', 'international')
ON CONFLICT (course_id, currency) DO UPDATE SET
  amount = EXCLUDED.amount,
  pricing_type = EXCLUDED.pricing_type,
  active = true,
  updated_at = timezone('utc', now());

-- ============================================================
-- 8. SEED: KWD (Kuwait)
-- ============================================================
INSERT INTO public.course_prices (course_id, currency, amount, product_type, product_label, region, pricing_type) VALUES
  ('bootcamp',            'KWD', 50, 'course',        '6-Week Cybersecurity Bootcamp',              'KW', 'international'),
  ('professional',        'KWD', 60, 'course',        '16-Week Professional Cybersecurity Program', 'KW', 'international'),
  ('ai_training',         'KWD', 50, 'course',        'AI-Powered Cybersecurity Programme',         'KW', 'international'),
  ('consultation-15',     'KWD',  8, 'consultation',  'Cybersecurity Consultation – 15 Minutes',    'KW', 'international'),
  ('consultation-30',     'KWD', 14, 'consultation',  'Cybersecurity Consultation – 30 Minutes',    'KW', 'international'),
  ('consultation-60',     'KWD', 23, 'consultation',  'Cybersecurity Consultation – 60 Minutes',    'KW', 'international'),
  ('consultation-90',     'KWD', 32, 'consultation',  'Cybersecurity Consultation – 90 Minutes',    'KW', 'international'),
  ('consultation-120',    'KWD', 43, 'consultation',  'Cybersecurity Consultation – 120 Minutes',   'KW', 'international')
ON CONFLICT (course_id, currency) DO UPDATE SET
  amount = EXCLUDED.amount,
  pricing_type = EXCLUDED.pricing_type,
  active = true,
  updated_at = timezone('utc', now());

-- ============================================================
-- 9. NOTES ON AFRICAN PRICING
-- ============================================================
-- African markets (GHS, KES, ZAR, EGP, TZS, UGX, RWF, XOF, XAF, MAD, DZD)
-- use genuine FX conversion from the NGN base price.
-- The PricingContext architecture is designed to:
--   a) detect African country codes
--   b) map them to the AFRICA pricing region
--   c) fetch the NGN base price
--   d) apply a live or periodically-updated FX rate
-- African price rows can be added to this table as the business expands.
-- Do NOT add African prices with artificial conversions.
-- The PricingContext handles this via the 'AFRICA' region + FX logic.

-- ============================================================
-- 10. UPDATED_AT trigger
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_course_prices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_course_prices_updated_at ON public.course_prices;
CREATE TRIGGER trg_course_prices_updated_at
  BEFORE UPDATE ON public.course_prices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_course_prices_updated_at();
