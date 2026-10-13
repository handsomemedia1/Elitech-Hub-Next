-- Migration 009: Universal Transactions Database
-- Establishes the foundational payment tracking table for the Universal Payment Engine.

-- ============================================================
-- 1. CREATE TRANSACTIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Idempotency & Provider Mapping
    reference TEXT UNIQUE NOT NULL,             -- Unique internal/Paystack transaction reference
    provider TEXT NOT NULL DEFAULT 'paystack',  -- Supports future providers
    provider_reference TEXT,                    -- Reference assigned by the provider (if different)
    
    -- Customer Details (Supports anonymous checkout)
    customer_email TEXT NOT NULL,
    customer_name TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional mapping to authenticated user
    
    -- Product Identification
    product_type TEXT NOT NULL,                 -- 'programme', 'consultation', 'service', etc.
    product_id TEXT NOT NULL,                   -- 'bootcamp', 'consultation-60', etc.
    
    -- Pricing Snapshot & Amount
    -- Uses NUMERIC(12,2) to match course_prices and prevent floating point errors
    amount NUMERIC(12, 2) NOT NULL,             -- Final calculated amount
    currency VARCHAR(10) NOT NULL,              -- Final currency (e.g., NGN, GHS, USD)
    
    pricing_model TEXT NOT NULL,                -- 'ngn_base', 'africa_fx', 'international_commercial'
    base_amount NUMERIC(12, 2),                 -- Authoritative NGN base if applicable
    base_currency VARCHAR(10),                  -- Usually 'NGN' if base_amount is used
    fx_rate NUMERIC(15, 6),                     -- Snapshot of the FX rate used (null for direct pricing)
    
    -- Transaction State
    status TEXT NOT NULL DEFAULT 'pending',     -- pending, successful, failed, abandoned, cancelled, refunded
    
    -- Context/Fulfilment Mapping
    metadata JSONB,                             -- Stores application_id, consultation context, etc.
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    paid_at TIMESTAMPTZ                         -- Populated ONLY upon verified webhook success
);

-- ============================================================
-- 2. CREATE INDEXES
-- ============================================================
-- Essential for fast webhook lookups and idempotency checks
CREATE INDEX IF NOT EXISTS idx_transactions_provider_ref ON public.transactions(provider_reference);
CREATE INDEX IF NOT EXISTS idx_transactions_email ON public.transactions(customer_email);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON public.transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_product ON public.transactions(product_type, product_id);

-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Deny all by default to public/anon. 
-- Service role bypasses RLS automatically in Supabase.
-- For safety, we explicitly allow service_role.
DROP POLICY IF EXISTS "Service Role has full access to transactions" ON public.transactions;
CREATE POLICY "Service Role has full access to transactions" 
ON public.transactions
FOR ALL 
TO service_role
USING (true) 
WITH CHECK (true);

-- Authenticated users can only read their own transactions.
-- They cannot insert or modify them directly from the browser.
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id OR customer_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- ============================================================
-- 4. UPDATE TRIGGER FOR updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_transactions_updated_at ON public.transactions;

CREATE TRIGGER trg_transactions_updated_at
BEFORE UPDATE ON public.transactions
FOR EACH ROW
EXECUTE FUNCTION update_transactions_updated_at();

-- Force PostgREST schema cache reload so the table is immediately recognized
NOTIFY pgrst, 'reload schema';



