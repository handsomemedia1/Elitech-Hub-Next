-- ============================================================
-- Elitech Hub — Missing Tables SQL
-- Run this in your Supabase SQL Editor ONLY if these tables
-- don't already exist (the old backend may have created them).
-- ============================================================

-- ── USERS TABLE — new columns for security features ────────────
-- Run these ALTER statements to add the new security columns.
-- They are safe to run even if the users table already exists.

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS users
  ADD COLUMN IF NOT EXISTS reset_token_hash TEXT,
  ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for fast reset token lookup
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token_hash)
  WHERE reset_token_hash IS NOT NULL;

-- ── TRIGGER: auto-update updated_at on users ──────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- Applications table (for bootcamp apply form)
CREATE TABLE IF NOT EXISTS applications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    program VARCHAR(100),
    program_name VARCHAR(200),
    full_name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    country VARCHAR(10),
    city VARCHAR(100),
    source VARCHAR(100),
    skill_level VARCHAR(100),
    motivation TEXT,
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'contacted')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_applications_email  ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at DESC);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Public inserts only (form submissions)
DROP POLICY IF EXISTS "Anyone can apply" ON applications;
CREATE POLICY "Anyone can apply" ON applications
    FOR INSERT WITH CHECK (true);

-- Only service role can read
DROP POLICY IF EXISTS "Service role reads applications" ON applications;
CREATE POLICY "Service role reads applications" ON applications
    FOR SELECT USING (auth.role() = 'service_role');

-- ── Contact messages table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    program_interest VARCHAR(100),
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_email   ON messages(email);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read    ON messages(read);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can send message" ON messages;
CREATE POLICY "Anyone can send message" ON messages
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role reads messages" ON messages;
CREATE POLICY "Service role reads messages" ON messages
    FOR SELECT USING (auth.role() = 'service_role');

-- ── Leads / Newsletter table (already exists from old backend) ─
-- Only add if missing:
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    whatsapp VARCHAR(50),
    segment VARCHAR(50),
    source_page VARCHAR(255),
    visit_count INTEGER DEFAULT 1,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email   ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_segment        ON leads(segment);
CREATE INDEX IF NOT EXISTS idx_leads_created        ON leads(created_at DESC);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit a lead" ON leads;
CREATE POLICY "Anyone can submit a lead" ON leads
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role reads leads" ON leads;
CREATE POLICY "Service role reads leads" ON leads
    FOR SELECT USING (auth.role() = 'service_role');

-- ── Volunteer applications (already exists from old backend) ───
-- Only add if missing:
CREATE TABLE IF NOT EXISTS volunteer_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT NOT NULL,
    role TEXT NOT NULL,
    linkedin_url TEXT,
    portfolio_url TEXT,
    experience TEXT,
    availability TEXT,
    motivation TEXT NOT NULL,
    goals TEXT,
    tools TEXT,
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected', 'interviewed')),
    admin_notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_email   ON volunteer_applications(email);
CREATE INDEX IF NOT EXISTS idx_volunteer_status  ON volunteer_applications(status);
CREATE INDEX IF NOT EXISTS idx_volunteer_applied ON volunteer_applications(applied_at DESC);

ALTER TABLE volunteer_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can volunteer" ON volunteer_applications;
CREATE POLICY "Anyone can volunteer" ON volunteer_applications
    FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Service role reads volunteers" ON volunteer_applications;
CREATE POLICY "Service role reads volunteers" ON volunteer_applications
    FOR SELECT USING (auth.role() = 'service_role');


-- ============================================================
-- LEGACY LMS & CMS TABLES (Merged from old backend)
-- ============================================================


-- --- FROM schema.sql ---

-- Elitech Hub LMS Database Schema
-- Run this in Supabase SQL Editor

-- Users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    country VARCHAR(10) DEFAULT 'NG',
    has_access BOOLEAN DEFAULT FALSE,
    role VARCHAR(50) DEFAULT 'student',
    access_granted_at TIMESTAMP,
    access_granted_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail VARCHAR(500),
    modules_count INTEGER DEFAULT 0,
    price_ngn DECIMAL(10,2),
    price_usd DECIMAL(10,2),
    price_eur DECIMAL(10,2),
    price_gbp DECIMAL(10,2),
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Modules table
CREATE TABLE modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(500) NOT NULL,
    content TEXT,
    video_url VARCHAR(500),
    "order" INTEGER NOT NULL,
    duration_min INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT NOW(),
    progress INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

-- Progress table (module completion)
CREATE TABLE progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    UNIQUE(user_id, module_id)
);

-- Certificates table
CREATE TABLE certificates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    certificate_id VARCHAR(100) UNIQUE NOT NULL,
    user_name VARCHAR(255),
    course_title VARCHAR(500),
    issued_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan VARCHAR(50),
    amount DECIMAL(10,2),
    currency VARCHAR(10),
    status VARCHAR(50) DEFAULT 'pending',
    reference VARCHAR(255) UNIQUE,
    provider VARCHAR(50),
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE blog_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    slug VARCHAR(500) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT,
    category VARCHAR(100),
    author VARCHAR(255),
    thumbnail VARCHAR(500),
    published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create admin user (update with your email)
-- Run after creating tables:
-- INSERT INTO users (email, password_hash, name, role, has_access) 
-- VALUES ('admin@elitechhub.com', '$2a$10$...', 'Admin', 'admin', true);

-- Enable Row Level Security (optional)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;


-- --- FROM schema-phase2.sql ---

-- Phase 2 Database Updates for Elitech Hub LMS
-- Run this in Supabase SQL Editor AFTER the initial schema

-- E-books table
CREATE TABLE IF NOT EXISTS ebooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    cover_url VARCHAR(500),
    file_url VARCHAR(500),
    price_ngn DECIMAL(10,2) DEFAULT 15000,
    price_usd DECIMAL(10,2) DEFAULT 20,
    price_eur DECIMAL(10,2) DEFAULT 20,
    price_gbp DECIMAL(10,2) DEFAULT 20,
    published BOOLEAN DEFAULT FALSE,
    downloads INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Purchases table (for courses, ebooks, services)
CREATE TABLE IF NOT EXISTS purchases (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'course', 'ebook', 'service'
    item_id UUID,
    reference_code VARCHAR(50) UNIQUE NOT NULL,
    amount DECIMAL(10,2),
    currency VARCHAR(10),
    payment_provider VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'pending',
    purchased_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Services table (consulting packages)
CREATE TABLE IF NOT EXISTS services (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    price_ngn DECIMAL(10,2) DEFAULT 150000,
    price_usd DECIMAL(10,2) DEFAULT 200,
    price_eur DECIMAL(10,2) DEFAULT 200,
    price_gbp DECIMAL(10,2) DEFAULT 200,
    includes TEXT[], -- array of features
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Service members table (for those who bought services)
CREATE TABLE IF NOT EXISTS service_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id),
    reference_code VARCHAR(50) UNIQUE NOT NULL,
    access_tag VARCHAR(100) UNIQUE NOT NULL,
    schedule_link VARCHAR(500),
    chat_link VARCHAR(500),
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Writers table (for blog writers panel)
CREATE TABLE IF NOT EXISTS writers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    bio TEXT,
    avatar_url VARCHAR(500),
    posts_count INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Update blog_posts to link to writers
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS writer_id UUID REFERENCES writers(id);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS seo_score INTEGER DEFAULT 0;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Enable RLS on new tables
ALTER TABLE ebooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE writers ENABLE ROW LEVEL SECURITY;

-- Insert default services
INSERT INTO services (title, description, price_ngn, price_usd, includes)
VALUES 
('Cybersecurity Training Package', 'Complete hands-on cybersecurity training with mentorship', 150000, 200, 
 ARRAY['1-on-1 Mentorship', 'Live Training Sessions', 'Course Materials', 'E-books Access', 'WhatsApp Support Group', 'Career Guidance']);


-- --- FROM add-research-table.sql ---

-- Research table for papers and video blogs
CREATE TABLE IF NOT EXISTS research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general',
    type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'article')),
    file_url TEXT, -- For PDF uploads
    youtube_url TEXT, -- For video embeds
    thumbnail TEXT,
    published BOOLEAN DEFAULT true,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_research_slug ON research(slug);
CREATE INDEX IF NOT EXISTS idx_research_type ON research(type);
CREATE INDEX IF NOT EXISTS idx_research_category ON research(category);

-- Add RLS policies
ALTER TABLE research ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Research visible to all" ON research;
CREATE POLICY "Research visible to all" ON research
    FOR SELECT USING (published = true);

DROP POLICY IF EXISTS "Research admin only write" ON research;
CREATE POLICY "Research admin only write" ON research
    FOR ALL USING (true);

