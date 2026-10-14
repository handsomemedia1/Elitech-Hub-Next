-- [SUPERSEDED] DO NOT RUN IN PRODUCTION.
-- Superseded by 011_reconcile_course_prices.sql.
-- Migration 010 assumed columns (currency, product_type, product_label, etc.) that do not exist
-- in the actual production course_prices table. Use migration 011 instead.
--
-- Migration 010: Course Catalogue Update — October 2026
-- Implements the revised three-programme catalogue:
--   1. AI-Powered Cybersecurity Programme  (ai_training)  — 6 weeks,  ₦100,000 [UNCHANGED]
--   2. AI Security and Reverse Vulnerability (ai_security) — 8 weeks,  ₦200,000 [NEW]
--   3. Professional Cybersecurity Programme (professional) — 16 weeks, ₦350,000 [PRICE UPDATE: was ₦300,000]
--
-- HISTORICAL DATA: The 6-Week Cybersecurity Bootcamp (bootcamp) product row is preserved in
-- course_prices for historical transaction integrity and reporting. It is marked inactive so
-- the pricing engine and checkout reject it for new payments.
--
-- SAFE TO RUN MORE THAN ONCE: All statements use ON CONFLICT DO UPDATE or IF NOT EXISTS.

-- ============================================================
-- 1. Mark old 'bootcamp' product as inactive (historical preservation)
-- ============================================================
UPDATE public.course_prices
SET active = false,
    updated_at = timezone('utc', now())
WHERE course_id = 'bootcamp';

-- ============================================================
-- 2. Update Professional Cybersecurity Programme NGN price: ₦300,000 → ₦350,000
-- ============================================================
UPDATE public.course_prices
SET amount = 350000,
    product_label = '16-Week Professional Cybersecurity Programme',
    updated_at = timezone('utc', now())
WHERE course_id = 'professional'
  AND currency = 'NGN';

-- Update product_label on international rows too (amount unchanged — pending business review)
UPDATE public.course_prices
SET product_label = '16-Week Professional Cybersecurity Programme',
    updated_at = timezone('utc', now())
WHERE course_id = 'professional'
  AND currency != 'NGN';

-- ============================================================
-- 3. Insert NEW programme: AI Security and Reverse Vulnerability
--    Product ID: 'ai_security' (stable, never reuse for a different product)
--    NGN Base Price: ₦200,000
-- ============================================================
INSERT INTO public.course_prices (course_id, currency, amount, product_type, product_label, region, pricing_type) VALUES
  ('ai_security', 'NGN', 200000, 'course', 'AI Security and Reverse Vulnerability', 'NG', 'standard')
ON CONFLICT (course_id, currency) DO UPDATE SET
  amount = EXCLUDED.amount,
  product_type = EXCLUDED.product_type,
  product_label = EXCLUDED.product_label,
  pricing_type = EXCLUDED.pricing_type,
  active = true,
  updated_at = timezone('utc', now());

-- NOTE: International pricing (USD, GBP, EUR, CAD, AUD, KWD) for 'ai_security' is NOT seeded here.
-- The pricing engine falls back to USD $160 band for unknown international products.
-- A dedicated international pricing decision for this new programme is required before
-- enabling international checkout for 'ai_security'. See UNRESOLVED_DECISIONS.md.

-- ============================================================
-- 4. Update 'ai_training' product label to reflect confirmed 6-week duration
-- ============================================================
UPDATE public.course_prices
SET product_label = 'AI-Powered Cybersecurity Programme (6 Weeks)',
    updated_at = timezone('utc', now())
WHERE course_id = 'ai_training'
  AND currency = 'NGN';
