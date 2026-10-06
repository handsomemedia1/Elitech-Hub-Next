CREATE TABLE IF NOT EXISTS writer_productivity_settings (
  writer_id UUID PRIMARY KEY REFERENCES writers(id) ON DELETE CASCADE,
  weekly_target INTEGER NOT NULL DEFAULT 2 CHECK (weekly_target BETWEEN 2 AND 7),
  preferred_days TEXT[] NOT NULL DEFAULT '{}',
  reminder_time TIME NOT NULL DEFAULT '09:00:00',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  last_reminder_sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS writer_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_id UUID REFERENCES writers(id) ON DELETE CASCADE,
  activity_date DATE NOT NULL,
  activity_type TEXT NOT NULL,
  article_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(writer_id, activity_date)
);

CREATE TABLE IF NOT EXISTS content_clusters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  writer_id UUID REFERENCES writers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cluster_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id UUID REFERENCES content_clusters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_keyword TEXT,
  status TEXT NOT NULL DEFAULT 'PLANNED',
  published_url TEXT,
  article_id UUID REFERENCES blog_posts(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE writer_productivity_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE writer_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_clusters ENABLE ROW LEVEL SECURITY;
ALTER TABLE cluster_articles ENABLE ROW LEVEL SECURITY;
