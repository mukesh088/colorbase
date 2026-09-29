export const INIT_MIGRATION_ID = "001_init";

/** Bundled so Hostinger does not depend on a `migrations/` folder at runtime. */
export const INIT_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
  theme TEXT,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('color', 'table', 'palette')),
  value TEXT NOT NULL CHECK (char_length(value) BETWEEN 1 AND 128),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, kind, value)
);

CREATE INDEX IF NOT EXISTS favorites_user_kind_created_idx
  ON favorites (user_id, kind, created_at DESC);

CREATE TABLE IF NOT EXISTS recent_colors (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  hex TEXT NOT NULL CHECK (hex ~ '^#[0-9A-Fa-f]{6}$'),
  seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS recent_colors_user_seen_idx
  ON recent_colors (user_id, seen_at DESC);

CREATE TABLE IF NOT EXISTS search_history (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  query TEXT NOT NULL CHECK (char_length(query) BETWEEN 1 AND 200),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS search_history_user_created_idx
  ON search_history (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS saved_palettes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  colors JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS saved_palettes_user_updated_idx
  ON saved_palettes (user_id, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE TABLE IF NOT EXISTS table_documents (
  id TEXT PRIMARY KEY CHECK (char_length(id) BETWEEN 4 AND 80),
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 120),
  payload JSONB NOT NULL,
  byte_size INTEGER NOT NULL CHECK (byte_size > 0 AND byte_size <= 409600),
  row_count INTEGER NOT NULL CHECK (row_count >= 0 AND row_count <= 400),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS table_documents_user_updated_idx
  ON table_documents (user_id, updated_at DESC)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS table_documents_expires_idx
  ON table_documents (expires_at)
  WHERE deleted_at IS NULL AND expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS copilot_sessions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS copilot_sessions_user_updated_idx
  ON copilot_sessions (user_id, updated_at DESC);

CREATE TABLE IF NOT EXISTS api_usage (
  user_id UUID NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  route TEXT NOT NULL CHECK (char_length(route) BETWEEN 1 AND 80),
  window_start TIMESTAMPTZ NOT NULL,
  count INTEGER NOT NULL DEFAULT 1 CHECK (count >= 0),
  PRIMARY KEY (user_id, route, window_start)
);

CREATE INDEX IF NOT EXISTS api_usage_window_idx ON api_usage (window_start);

CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
