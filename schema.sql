-- SQL Script for Supabase Table Setup
-- Run this query in the SQL Editor of your Supabase Dashboard:

CREATE TABLE IF NOT EXISTS cached_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_api_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    source_name TEXT,
    url TEXT,
    image_url TEXT,
    country TEXT NOT NULL,
    city_keyword TEXT,
    category TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    cached_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index to optimize cache lookup performance
CREATE INDEX IF NOT EXISTS idx_cached_articles_lookup 
ON cached_articles (country, city_keyword, category, cached_at);
