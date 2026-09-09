-- yupinata - read-only content DB (migrated from Supabase)

CREATE TABLE IF NOT EXISTS sections (
  id            UUID PRIMARY KEY,
  name          TEXT,
  title         TEXT,
  content       TEXT,
  profiles      JSONB,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS images (
  id            UUID PRIMARY KEY,
  section       TEXT,
  path          TEXT,
  description   TEXT,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS songs (
  id            UUID PRIMARY KEY,
  title         TEXT,
  artist        TEXT,
  album         TEXT,
  cover_url     TEXT,
  audio_url     TEXT,
  lyrics        TEXT,
  display_order INT DEFAULT 0,
  created_at    TIMESTAMPTZ,
  updated_at    TIMESTAMPTZ
);
