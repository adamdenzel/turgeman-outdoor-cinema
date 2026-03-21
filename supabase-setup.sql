-- ============================================================
-- TURGEMAN OUTDOOR CINEMA — Supabase Database Setup
-- Run this entire script in your Supabase SQL Editor
-- ============================================================

-- ── 1. Events table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id               uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_date       date,
  suggest_deadline timestamptz NOT NULL,
  vote_deadline    timestamptz NOT NULL,
  max_suggestions  integer     DEFAULT 2,
  force_phase      text,       -- null = use timer, or 'suggest' | 'vote' | 'results'
  created_at       timestamptz DEFAULT now()
);

-- ── 2. Suggestions table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS suggestions (
  id            uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id      uuid        REFERENCES events(id) ON DELETE CASCADE,
  tmdb_id       integer,
  title         text        NOT NULL,
  year          integer,
  genre         text,
  cast_members  text,
  description   text,
  poster_path   text,
  trailer_url   text,
  suggested_by  text,
  browser_token text        NOT NULL,
  created_at    timestamptz DEFAULT now()
);

-- ── 3. Votes table ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS votes (
  id                uuid   DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id          uuid   REFERENCES events(id) ON DELETE CASCADE,
  browser_token     text   NOT NULL,
  ranked_movie_ids  jsonb  NOT NULL DEFAULT '[]'::jsonb,
  created_at        timestamptz DEFAULT now(),
  UNIQUE(event_id, browser_token)   -- one vote per browser per event
);

-- ── 4. Disable RLS (private friend app — no auth needed) ─────
ALTER TABLE events      DISABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions DISABLE ROW LEVEL SECURITY;
ALTER TABLE votes       DISABLE ROW LEVEL SECURITY;

-- ── 5. Enable Realtime on all tables ─────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE events;
ALTER PUBLICATION supabase_realtime ADD TABLE suggestions;
ALTER PUBLICATION supabase_realtime ADD TABLE votes;

-- ── Done! ────────────────────────────────────────────────────
-- Your database is ready. Now copy your Project URL and
-- anon key from Project Settings → API into your .env file.
