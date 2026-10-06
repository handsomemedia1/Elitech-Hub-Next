-- ============================================================
-- Before Cybersecurity — Database Schema
-- Run this in your Supabase SQL Editor
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
VALUES ('before-cybersecurity', 'Before Cybersecurity', 'Interactive cybersecurity orientation system', 'digital_product', 'active', '1.0')
ON CONFLICT (slug) DO NOTHING;

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
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. bc_orders
CREATE TABLE IF NOT EXISTS bc_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES bc_products(id),
    price_id UUID REFERENCES bc_product_prices(id),
    provider VARCHAR(50),
    provider_reference VARCHAR(255) UNIQUE,
    amount DECIMAL(10,2),
    currency VARCHAR(10),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ
);

-- 4. bc_entitlements
CREATE TABLE IF NOT EXISTS bc_entitlements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    product_id UUID REFERENCES bc_products(id),
    order_id UUID REFERENCES bc_orders(id),
    product_version VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);

-- 5. bc_assessment_sessions
CREATE TABLE IF NOT EXISTS bc_assessment_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assessment_type VARCHAR(100) DEFAULT 'full',
    assessment_version VARCHAR(50) DEFAULT '1.0',
    status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'abandoned')),
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
    answer TEXT,
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
    session_id UUID REFERENCES bc_assessment_sessions(id),
    product_version VARCHAR(50),
    report_version VARCHAR(50),
    content JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. bc_resources
CREATE TABLE IF NOT EXISTS bc_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    url VARCHAR(1000),
    category VARCHAR(100),
    level VARCHAR(50),
    resource_type VARCHAR(50),
    free_or_paid VARCHAR(50),
    source VARCHAR(255),
    last_verified TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. bc_guide_chapters
CREATE TABLE IF NOT EXISTS bc_guide_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES bc_products(id),
    product_version VARCHAR(50),
    chapter_number INTEGER NOT NULL,
    part VARCHAR(100),
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
    order_id UUID REFERENCES bc_orders(id),
    payload JSONB,
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

CREATE TRIGGER update_bc_products_modtime BEFORE UPDATE ON bc_products FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();
CREATE TRIGGER update_bc_product_prices_modtime BEFORE UPDATE ON bc_product_prices FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();
CREATE TRIGGER update_bc_entitlements_modtime BEFORE UPDATE ON bc_entitlements FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();
CREATE TRIGGER update_bc_assessment_sessions_modtime BEFORE UPDATE ON bc_assessment_sessions FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();
CREATE TRIGGER update_bc_generated_reports_modtime BEFORE UPDATE ON bc_generated_reports FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();
CREATE TRIGGER update_bc_resources_modtime BEFORE UPDATE ON bc_resources FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();
CREATE TRIGGER update_bc_guide_chapters_modtime BEFORE UPDATE ON bc_guide_chapters FOR EACH ROW EXECUTE FUNCTION update_bc_updated_at_column();

-- Enable RLS (Security)
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

-- Public can read active products and prices
CREATE POLICY "Public can view active products" ON bc_products FOR SELECT USING (status = 'active');
CREATE POLICY "Public can view active prices" ON bc_product_prices FOR SELECT USING (active = true);
CREATE POLICY "Public can view active resources" ON bc_resources FOR SELECT USING (status = 'active');

-- Users can read their own data
CREATE POLICY "Users view own orders" ON bc_orders FOR SELECT USING (user_id = auth.uid()); -- Will need adjustment for custom JWT auth if not using Supabase Auth
CREATE POLICY "Users view own entitlements" ON bc_entitlements FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users manage own sessions" ON bc_assessment_sessions FOR ALL USING (user_id = auth.uid());
-- Since Elitech uses custom JWT mapped to `users`, RLS based on `auth.uid()` might not work directly if they query from a server securely. 
-- The API routes should use service_role key to bypass RLS and verify JWT user_id manually.
