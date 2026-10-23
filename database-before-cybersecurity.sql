-- ============================================================
-- Before Cybersecurity — Database Schema & Migration
-- Elitech Hub Platform
-- Run this script in your Supabase SQL Editor
-- ============================================================

-- 1. bc_products
CREATE TABLE IF NOT EXISTS bc_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_type VARCHAR(100) DEFAULT 'digital_product',
    status VARCHAR(50) DEFAULT 'active',
    current_version VARCHAR(50) DEFAULT '1.0',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the primary product
INSERT INTO bc_products (slug, name, description, product_type, status, current_version)
VALUES (
    'before-cybersecurity',
    'Before Cybersecurity',
    'Interactive cybersecurity orientation system featuring an authoritative 29-chapter guide, diagnostic archetype assessment, personalized gap analysis report, 30/60/90-day deliverable roadmap, and curated resource library.',
    'digital_product',
    'active',
    '1.0'
)
ON CONFLICT (slug) DO UPDATE 
SET updated_at = NOW(), current_version = '1.0';

-- 2. bc_product_prices
CREATE TABLE IF NOT EXISTS bc_product_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES bc_products(id) ON DELETE CASCADE,
    currency VARCHAR(10) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    provider VARCHAR(50),
    country_code VARCHAR(10),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, currency, provider)
);

-- Seed initial localized prices for Before Cybersecurity
DO $$
DECLARE
    v_prod_id UUID;
BEGIN
    SELECT id INTO v_prod_id FROM bc_products WHERE slug = 'before-cybersecurity' LIMIT 1;
    IF v_prod_id IS NOT NULL THEN
        -- Paystack (NGN base)
        INSERT INTO bc_product_prices (product_id, currency, amount, provider, country_code, active)
        VALUES (v_prod_id, 'NGN', 25000.00, 'paystack', 'NG', true)
        ON CONFLICT (product_id, currency, provider) DO UPDATE SET amount = EXCLUDED.amount, active = true;

        -- International Currencies
        INSERT INTO bc_product_prices (product_id, currency, amount, provider, country_code, active)
        VALUES 
            (v_prod_id, 'USD', 29.00, 'lemonsqueezy', 'US', true),
            (v_prod_id, 'GBP', 24.00, 'lemonsqueezy', 'GB', true),
            (v_prod_id, 'EUR', 27.00, 'lemonsqueezy', 'EU', true),
            (v_prod_id, 'CAD', 39.00, 'lemonsqueezy', 'CA', true)
        ON CONFLICT (product_id, currency, provider) DO UPDATE SET amount = EXCLUDED.amount, active = true;
    END IF;
END $$;

-- 3. bc_orders
CREATE TABLE IF NOT EXISTS bc_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    product_id UUID REFERENCES bc_products(id),
    price_id UUID REFERENCES bc_product_prices(id),
    provider VARCHAR(50) NOT NULL,
    provider_reference VARCHAR(255) UNIQUE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_bc_orders_user ON bc_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_bc_orders_ref ON bc_orders(provider_reference);

-- 4. bc_entitlements
-- Product ownership is decoupled from the user's global role (student/admin/etc.)
CREATE TABLE IF NOT EXISTS bc_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES bc_products(id) ON DELETE CASCADE,
    order_id UUID REFERENCES bc_orders(id) ON DELETE SET NULL,
    product_version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_bc_entitlements_user_prod ON bc_entitlements(user_id, product_id);

-- 5. bc_assessment_sessions
CREATE TABLE IF NOT EXISTS bc_assessment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100) DEFAULT 'free',
    assessment_version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. bc_assessment_answers
CREATE TABLE IF NOT EXISTS bc_assessment_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES bc_assessment_sessions(id) ON DELETE CASCADE,
    question_id VARCHAR(100) NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

-- 7. bc_assessment_scores
CREATE TABLE IF NOT EXISTS bc_assessment_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES bc_assessment_sessions(id) ON DELETE CASCADE,
    dimension VARCHAR(100) NOT NULL,
    score DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(session_id, dimension)
);

-- 8. bc_generated_reports
CREATE TABLE IF NOT EXISTS bc_generated_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES bc_assessment_sessions(id) ON DELETE SET NULL,
    product_version VARCHAR(50) DEFAULT '1.0',
    report_version VARCHAR(50) DEFAULT '1.0',
    content JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. bc_resources
CREATE TABLE IF NOT EXISTS bc_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    url VARCHAR(1000) NOT NULL,
    category VARCHAR(100) NOT NULL,
    level VARCHAR(50) DEFAULT 'Beginner',
    resource_type VARCHAR(50) DEFAULT 'Article',
    free_or_paid VARCHAR(50) DEFAULT 'Free',
    source VARCHAR(255),
    last_verified TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed sample resources
INSERT INTO bc_resources (title, description, url, category, level, free_or_paid, source)
VALUES 
    ('NIST Workforce Framework for Cybersecurity (NICE SP 800-181)', 'Taxonomy of cybersecurity roles, knowledge units, and competencies.', 'https://www.nist.gov/itl/applied-cybersecurity/nice/nice-framework-resource-center', 'security-frameworks', 'All Levels', 'Free', 'NIST'),
    ('OWASP Top 10 Web Application Security Risks', 'Authoritative standard for web security risks and vulnerability prevention.', 'https://owasp.org/www-project-top-ten/', 'security-frameworks', 'Beginner', 'Free', 'OWASP'),
    ('Nigeria Data Protection Act (NDPA) 2023 Portal', 'Statutory framework for personal data privacy and compliance in Nigeria.', 'https://ndpc.gov.ng/', 'legal-and-policy', 'All Levels', 'Free', 'NDPC'),
    ('OverTheWire Bandit Wargame', 'Hands-on terminal wargame to master Linux commands and file permissions.', 'https://overthewire.org/wargames/bandit/', 'labs-and-practice', 'Beginner', 'Free', 'OverTheWire')
ON CONFLICT DO NOTHING;

-- 10. bc_guide_chapters
CREATE TABLE IF NOT EXISTS bc_guide_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES bc_products(id) ON DELETE CASCADE,
    product_version VARCHAR(50) DEFAULT '1.0',
    chapter_number INTEGER NOT NULL,
    part_number INTEGER NOT NULL,
    part VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) NOT NULL,
    content TEXT,
    status VARCHAR(50) DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(product_id, slug)
);

-- 11. bc_payment_events
CREATE TABLE IF NOT EXISTS bc_payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider VARCHAR(50) NOT NULL,
    provider_event_id VARCHAR(255) UNIQUE NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    order_id UUID REFERENCES bc_orders(id) ON DELETE SET NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_bc_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_bc_products_modtime ON bc_products;
CREATE TRIGGER update_bc_products_modtime BEFORE UPDATE ON bc_products FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();

DROP TRIGGER IF EXISTS update_bc_product_prices_modtime ON bc_product_prices;
CREATE TRIGGER update_bc_product_prices_modtime BEFORE UPDATE ON bc_product_prices FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();

DROP TRIGGER IF EXISTS update_bc_entitlements_modtime ON bc_entitlements;
CREATE TRIGGER update_bc_entitlements_modtime BEFORE UPDATE ON bc_entitlements FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();

DROP TRIGGER IF EXISTS update_bc_assessment_sessions_modtime ON bc_assessment_sessions;
CREATE TRIGGER update_bc_assessment_sessions_modtime BEFORE UPDATE ON bc_assessment_sessions FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();

DROP TRIGGER IF EXISTS update_bc_resources_modtime ON bc_resources;
CREATE TRIGGER update_bc_resources_modtime BEFORE UPDATE ON bc_resources FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();

-- ============================================================
-- Security & Row Level Security (RLS)
-- ============================================================
-- NOTE: Because Elitech-Hub uses custom JWT tokens (elitech_token) rather
-- than standard Supabase Auth sessions, server-side Next.js route handlers
-- use the Supabase Service Role client (`createServiceClient()`) to enforce
-- authenticated authorization safely before issuing queries or signed URLs.
--
-- Tables have RLS enabled. Public read policies are enabled for public catalogs.
-- Sensitive tables (orders, entitlements, payment events) are strictly restricted.

ALTER TABLE bc_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_product_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_entitlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_assessment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_assessment_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_assessment_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_generated_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_guide_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bc_payment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view active products" ON bc_products;
CREATE POLICY "Public can view active products" ON bc_products FOR SELECT USING (status = 'active');

DROP POLICY IF EXISTS "Public can view active prices" ON bc_product_prices;
CREATE POLICY "Public can view active prices" ON bc_product_prices FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Public can view active resources" ON bc_resources;
CREATE POLICY "Public can view active resources" ON bc_resources FOR SELECT USING (status = 'active');

-- ============================================================
-- Supabase Storage Setup Instructions for Private PDF:
-- ============================================================
-- 1. In Supabase Dashboard, navigate to "Storage".
-- 2. Click "Create new bucket".
-- 3. Set Bucket Name: "before-cybersecurity-assets"
-- 4. Mark "Public bucket" as FALSE (Leave unchecked - it MUST be private).
-- 5. Upload the file: "Before Cybersecurity - The Complete Interactive Book-2.pdf"
-- 6. The API route `/api/before-cybersecurity/download-pdf` uses the service role
--    client to create short-lived 60-second signed download URLs only for entitled users.
