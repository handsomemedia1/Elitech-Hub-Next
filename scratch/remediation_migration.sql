-- ============================================================
-- Remediation Migration: Research Repository & Security Fixes
-- Run this in your Supabase SQL Editor to resolve Audit Gaps
-- (C1, C3, C6, H4, M7)
-- ============================================================

-- 1. Ensure 'research' table has all missing columns (C1, H4)
ALTER TABLE research
  ADD COLUMN IF NOT EXISTS submitter_id UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS abstract TEXT,
  ADD COLUMN IF NOT EXISTS keywords TEXT[],
  ADD COLUMN IF NOT EXISTS research_type VARCHAR(100) DEFAULT 'article',
  ADD COLUMN IF NOT EXISTS publication_status VARCHAR(50) DEFAULT 'draft',
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ, -- H4: Real publication date
  ADD COLUMN IF NOT EXISTS license VARCHAR(100),
  ADD COLUMN IF NOT EXISTS funding_info TEXT,
  ADD COLUMN IF NOT EXISTS conflict_of_interest TEXT,
  ADD COLUMN IF NOT EXISTS ethics_statement TEXT,
  ADD COLUMN IF NOT EXISTS rights_confirmed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS reviewer_notes TEXT,
  ADD COLUMN IF NOT EXISTS similarity_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS ai_detection_score DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS citations_count INTEGER DEFAULT 0;

-- H4: Trigger to auto-set published_at when publication_status becomes 'published'
CREATE OR REPLACE FUNCTION set_research_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.publication_status = 'published' AND OLD.publication_status IS DISTINCT FROM 'published' THEN
    NEW.published_at = NOW();
    NEW.published = TRUE;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_research_published_at ON research;
CREATE TRIGGER trigger_research_published_at
  BEFORE UPDATE ON research
  FOR EACH ROW
  EXECUTE FUNCTION set_research_published_at();

-- 2. Create missing relational tables (C1)

-- Researcher Profiles
CREATE TABLE IF NOT EXISTS researcher_profiles (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    orcid VARCHAR(50),
    institution VARCHAR(255),
    department VARCHAR(255),
    country VARCHAR(100),
    biography TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Authors
CREATE TABLE IF NOT EXISTS research_authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID NOT NULL REFERENCES research(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    orcid VARCHAR(50),
    institution VARCHAR(255),
    author_order INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Versions
CREATE TABLE IF NOT EXISTS research_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID NOT NULL REFERENCES research(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    file_url TEXT NOT NULL,
    changes_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Research Identifiers
CREATE TABLE IF NOT EXISTS research_identifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    research_id UUID NOT NULL REFERENCES research(id) ON DELETE CASCADE,
    identifier_type VARCHAR(50) NOT NULL,
    identifier_value VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(research_id, identifier_type)
);

-- Web Case Studies
CREATE TABLE IF NOT EXISTS web_case_studies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(255),
    problem TEXT,
    solution TEXT,
    published BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Atomic Citation Increment RPC (C3)
CREATE OR REPLACE FUNCTION increment_citation_count(paper_slug TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE research
  SET citations_count = COALESCE(citations_count, 0) + 1
  WHERE slug = paper_slug;
END;
$$;

-- 4. Enforce Read Security for Unpublished Papers (C6)
ALTER TABLE research ENABLE ROW LEVEL SECURITY;

-- Drop existing public read policy if it exists (usually "Research visible to all")
-- Let's make sure we safely recreate policies.
DROP POLICY IF EXISTS "Research visible to all" ON research;
DROP POLICY IF EXISTS "Public can view published research" ON research;
DROP POLICY IF EXISTS "Submitter can manage own research" ON research;

CREATE POLICY "Public can view published research" ON research
  FOR SELECT USING (published = true OR publication_status = 'published');

CREATE POLICY "Submitters can view their own unpublished research" ON research
  FOR SELECT USING (auth.uid() = submitter_id);

CREATE POLICY "Submitter can manage own research" ON research
  FOR ALL USING (auth.uid() = submitter_id);

-- (Admins bypass RLS normally using the service_role key on the backend, 
-- or you would need an admin role policy here if using anon key for admins).

-- 5. RLS for New Tables
ALTER TABLE researcher_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON researcher_profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON researcher_profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON researcher_profiles FOR UPDATE USING (auth.uid() = id);

ALTER TABLE research_authors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public authors viewable" ON research_authors FOR SELECT USING (true);
CREATE POLICY "Submitter can manage authors" ON research_authors FOR ALL USING (
    EXISTS (SELECT 1 FROM research WHERE research.id = research_authors.research_id AND research.submitter_id = auth.uid())
);

ALTER TABLE research_versions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public versions viewable" ON research_versions FOR SELECT USING (true);
CREATE POLICY "Submitter can manage versions" ON research_versions FOR ALL USING (
    EXISTS (SELECT 1 FROM research WHERE research.id = research_versions.research_id AND research.submitter_id = auth.uid())
);

ALTER TABLE research_identifiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public identifiers viewable" ON research_identifiers FOR SELECT USING (true);

ALTER TABLE web_case_studies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public case studies viewable" ON web_case_studies FOR SELECT USING (published = true);

-- 6. Storage Bucket Security (M7)
-- Protect unpublished files in 'public-images' or 'research' bucket.
-- Assuming files are currently in a public bucket, we should enforce RLS on storage.objects.
-- However, storage policies depend on the exact bucket name (usually "public-images").
-- This allows anyone to download the file if the research is published, or if they are the submitter.
/*
CREATE POLICY "Protect unpublished PDFs" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'public-images' AND
    (
      -- Either the file is linked to a published paper
      EXISTS (
        SELECT 1 FROM research 
        WHERE research.file_url LIKE '%' || storage.objects.name 
        AND (research.published = true OR research.publication_status = 'published')
      )
      -- OR the user is the submitter
      OR EXISTS (
        SELECT 1 FROM research 
        WHERE research.file_url LIKE '%' || storage.objects.name 
        AND research.submitter_id = auth.uid()
      )
    )
  );
*/
-- (Note: Storage policies can be complex if files are shared, so leaving commented as an example.
-- We will handle C2/M7 in the app layer primarily to avoid breaking existing image assets).
