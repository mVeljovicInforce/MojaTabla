CREATE TABLE IF NOT EXISTS city (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS street (
  id              INTEGER PRIMARY KEY,
  city_id         INTEGER NOT NULL REFERENCES city(id),
  name            TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  UNIQUE (city_id, normalized_name)
);

CREATE TABLE IF NOT EXISTS post (
  id           INTEGER PRIMARY KEY,
  street_id    INTEGER NOT NULL REFERENCES street(id),
  category     TEXT NOT NULL CHECK (category IN
    ('obavestenje', 'pomoc', 'poklanjam_prodajem',
     'izgubljeno_nadjeno', 'problem_u_kraju', 'dogadjaj')),
  title        TEXT NOT NULL,
  body         TEXT NOT NULL,
  house_number TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_post_street_created ON post(street_id, created_at DESC, id DESC);

CREATE TABLE IF NOT EXISTS comment (
  id         INTEGER PRIMARY KEY,
  post_id    INTEGER NOT NULL REFERENCES post(id),
  body       TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_comment_post_created ON comment(post_id, created_at, id);
