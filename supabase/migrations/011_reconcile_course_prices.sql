-- Migration 011: Reconcile Course Prices with Authoritative Production Schema
--
-- Purpose:
--   Brings course_prices table into complete alignment with the authoritative
--   October 2026 course catalogue and production schema:
--     1. AI-Powered Cybersecurity Programme  (ai_training)  — 6 weeks,  ₦100,000 / $160 USD
--     2. AI Security and Reverse Vulnerability (ai_security) — 8 weeks,  ₦200,000 / $250 USD
--     3. Professional Cybersecurity Programme (professional) — 16 weeks, ₦350,000 / $500 USD
--     4. Consultation tiers (15m, 30m, 60m, 90m, 120m)
--     5. Legacy bootcamp marked inactive (preserved for historical transaction lookup)
--     6. Non-purchasable internship marked inactive
--
-- Baseline Production Schema:
--   public.course_prices: id (uuid/bigint), course_id (text), currency_code (text), symbol (text), amount (numeric), created_at (timestamptz)
--   Unique constraint: (course_id, currency_code)
--
-- Safety:
--   Forward-only, idempotent, and non-destructive.
--   Uses IF NOT EXISTS and ON CONFLICT (course_id, currency_code).
--   DO NOT run Migration 010; this migration supersedes Migration 010.
--
-- Verification Queries (Run in Supabase SQL Editor after execution):
--   SELECT course_id, currency_code, symbol, amount, active FROM public.course_prices ORDER BY course_id, currency_code;
--
-- Rollback Instructions (In emergency):
--   UPDATE public.course_prices SET amount = 300000 WHERE course_id = 'professional' AND currency_code = 'NGN';
--   DELETE FROM public.course_prices WHERE course_id = 'ai_security' AND created_at > '2026-10-01';

-- ============================================================
-- 1. Ensure schema support for active status and audit timestamps
-- ============================================================
ALTER TABLE public.course_prices
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.course_prices
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now());

-- Add index on active if not present
CREATE INDEX IF NOT EXISTS idx_course_prices_active_code
  ON public.course_prices(course_id, currency_code, active);

-- ============================================================
-- 2. Retire legacy bootcamp and non-purchasable internship
--    (Preserves records for historical receipt lookup and transaction audit)
-- ============================================================
UPDATE public.course_prices
SET active = false,
    updated_at = timezone('utc', now())
WHERE course_id IN ('bootcamp', 'internship');

-- ============================================================
-- 3. Upsert Active Programmes with Authoritative Pricing
-- ============================================================

-- AI-Powered Cybersecurity Programme (6 Weeks)
INSERT INTO public.course_prices (course_id, currency_code, symbol, amount, active)
VALUES
  ('ai_training', 'NGN', '₦', 100000, true),
  ('ai_training', 'USD', '$', 160, true)
ON CONFLICT (course_id, currency_code) DO UPDATE SET
  symbol = EXCLUDED.symbol,
  amount = EXCLUDED.amount,
  active = true,
  updated_at = timezone('utc', now());

-- AI Security and Reverse Vulnerability (8 Weeks)
INSERT INTO public.course_prices (course_id, currency_code, symbol, amount, active)
VALUES
  ('ai_security', 'NGN', '₦', 200000, true),
  ('ai_security', 'USD', '$', 250, true)
ON CONFLICT (course_id, currency_code) DO UPDATE SET
  symbol = EXCLUDED.symbol,
  amount = EXCLUDED.amount,
  active = true,
  updated_at = timezone('utc', now());

-- Professional Cybersecurity Programme (16 Weeks)
INSERT INTO public.course_prices (course_id, currency_code, symbol, amount, active)
VALUES
  ('professional', 'NGN', '₦', 350000, true),
  ('professional', 'USD', '$', 500, true)
ON CONFLICT (course_id, currency_code) DO UPDATE SET
  symbol = EXCLUDED.symbol,
  amount = EXCLUDED.amount,
  active = true,
  updated_at = timezone('utc', now());

-- ============================================================
-- 4. Upsert Authoritative Consultations
-- ============================================================
INSERT INTO public.course_prices (course_id, currency_code, symbol, amount, active)
VALUES
  ('consultation-15', 'NGN', '₦', 15000, true),
  ('consultation-15', 'USD', '$', 25, true),
  ('consultation-30', 'NGN', '₦', 30000, true),
  ('consultation-30', 'USD', '$', 45, true),
  ('consultation-60', 'NGN', '₦', 50000, true),
  ('consultation-60', 'USD', '$', 75, true),
  ('consultation-90', 'NGN', '₦', 70000, true),
  ('consultation-90', 'USD', '$', 105, true),
  ('consultation-120', 'NGN', '₦', 100000, true),
  ('consultation-120', 'USD', '$', 140, true)
ON CONFLICT (course_id, currency_code) DO UPDATE SET
  symbol = EXCLUDED.symbol,
  amount = EXCLUDED.amount,
  active = true,
  updated_at = timezone('utc', now());
