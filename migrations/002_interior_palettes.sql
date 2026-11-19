CREATE TABLE IF NOT EXISTS interior_palettes (
  id UUID PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE CHECK (char_length(slug) BETWEEN 3 AND 80),
  title TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 120),
  description TEXT NOT NULL CHECK (char_length(description) BETWEEN 1 AND 4000),
  room_type TEXT NOT NULL CHECK (char_length(room_type) BETWEEN 2 AND 40),
  style TEXT NOT NULL CHECK (char_length(style) BETWEEN 2 AND 40),
  alt_text TEXT NOT NULL CHECK (char_length(alt_text) BETWEEN 3 AND 200),
  usage_notes TEXT NOT NULL DEFAULT '' CHECK (char_length(usage_notes) <= 4000),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  colors JSONB NOT NULL,
  image_bytes BYTEA NOT NULL,
  image_mime TEXT NOT NULL CHECK (image_mime IN ('image/jpeg', 'image/png', 'image/webp')),
  image_width INTEGER NOT NULL CHECK (image_width > 0 AND image_width <= 4096),
  image_height INTEGER NOT NULL CHECK (image_height > 0 AND image_height <= 4096),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS interior_palettes_public_idx
  ON interior_palettes (published_at DESC)
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS interior_palettes_filters_idx
  ON interior_palettes (room_type, style)
  WHERE status = 'published';
