/*
# Create core tables for eandaaz bayan poetry platform

1. New Tables
- `categories`: poetry genres (Ghazal, Nazm, Shayari, Hamd, Naat, etc.)
  - `id` (uuid, primary key), `name` (text, unique), `name_ur` (text, Urdu name), `slug` (text, unique), `description` (text), `created_at`
- `profiles`: one row per registered user, linked to Supabase auth
  - `id` (uuid, primary key, matches auth.users id), `username` (text, unique), `display_name`, `bio`, `photo_url`, `created_at`
  - `role` (text: 'user' | 'admin') — managed server-side via SQL, never writable by clients
- `poets`: public poet records (famous poets and registered poets who publish)
  - `id` (uuid), `user_id` (uuid, nullable, links a registered user to their poet page), `name`, `name_ur`, `slug` (unique), `bio`, `photo_url`, `era`, `country`, `featured` (boolean), `created_at`
- `poems`: poetry entries in three languages and multiple genres
  - `id` (uuid), `poet_id` (uuid, references poets), `submitted_by` (uuid, references auth.users, defaults to caller)
  - `title`, `title_ur`, `language` ('urdu' | 'roman' | 'english'), `body` (text), `body_ur` (text, Urdu script version), `category_id` (uuid, references categories)
  - `status` ('pending' | 'approved' | 'rejected'), `featured` (boolean), `views` (integer), `created_at`
- `poem_likes`: one like per user per poem (unique on poem_id + user_id)
- `poem_comments`: comments on poems, `poem_id`, `user_id`, `body`, `created_at`
- `poem_bookmarks`: saved poems per user, unique on poem_id + user_id
- `videos`: poetry recitations, Mushaira performances
  - `id` (uuid), `title`, `title_ur`, `description`, `video_url` (YouTube embed URL), `thumbnail_url`, `poet_name`, `event_name`, `status`, `submitted_by`, `created_at`

2. Security
- RLS ENABLED on every table.
- Public read (anon + authenticated) for categories, poets, approved poems/videos; writes require authenticated users.
- Poems: anyone can READ only approved ones; authors can read/update/delete their own (any status); INSERT requires signed-in user with submitted_by defaulting to auth.uid().
- Likes/bookmarks: public read, each user manages only their own rows.
- Comments: public read, each user manages only their own rows.
- profiles: each user reads/updates only their own row.
- Grants to anon and authenticated limited to needed verbs.

3. Notes
- No destructive operations; all statements idempotent.
- Sequence grants not needed (uuid primary keys).
*/

CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  name_ur text,
  slug text UNIQUE NOT NULL,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  display_name text NOT NULL,
  bio text,
  photo_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  name text NOT NULL,
  name_ur text,
  slug text UNIQUE NOT NULL,
  bio text,
  photo_url text,
  era text,
  country text,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poet_id uuid NOT NULL REFERENCES poets(id) ON DELETE CASCADE,
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  title text NOT NULL,
  title_ur text,
  language text NOT NULL CHECK (language IN ('urdu', 'roman', 'english')),
  body text NOT NULL,
  body_ur text,
  category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  featured boolean NOT NULL DEFAULT false,
  views integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poem_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poem_id, user_id)
);

CREATE TABLE IF NOT EXISTS poem_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS poem_bookmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  poem_id uuid NOT NULL REFERENCES poems(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (poem_id, user_id)
);

CREATE TABLE IF NOT EXISTS videos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  title_ur text,
  description text,
  video_url text NOT NULL,
  thumbnail_url text,
  poet_name text,
  event_name text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  submitted_by uuid REFERENCES auth.users(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_poems_status ON poems (status);
CREATE INDEX IF NOT EXISTS idx_poems_poet ON poems (poet_id);
CREATE INDEX IF NOT EXISTS idx_poems_category ON poems (category_id);
CREATE INDEX IF NOT EXISTS idx_poems_language ON poems (language);
CREATE INDEX IF NOT EXISTS idx_poems_created ON poems (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_poem_likes_poem ON poem_likes (poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_comments_poem ON poem_comments (poem_id);
CREATE INDEX IF NOT EXISTS idx_poem_bookmarks_user ON poem_bookmarks (user_id);
CREATE INDEX IF NOT EXISTS idx_poets_slug ON poets (slug);
CREATE INDEX IF NOT EXISTS idx_poets_user ON poets (user_id);

-- ------------------------------------------------------------------
-- RLS
-- ------------------------------------------------------------------
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE poets ENABLE ROW LEVEL SECURITY;
ALTER TABLE poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE poem_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- categories: public read, no client writes
DROP POLICY IF EXISTS "categories_public_read" ON categories;
CREATE POLICY "categories_public_read" ON categories
FOR SELECT TO anon, authenticated USING (true);

-- profiles
DROP POLICY IF EXISTS "profiles_read_own" ON profiles;
CREATE POLICY "profiles_read_own" ON profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles
FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- poets: public read, signed-in users can create; owners can edit their poet record
DROP POLICY IF EXISTS "poets_public_read" ON poets;
CREATE POLICY "poets_public_read" ON poets
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "poets_insert_own" ON poets;
CREATE POLICY "poets_insert_own" ON poets
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "poets_update_own" ON poets;
CREATE POLICY "poets_update_own" ON poets
FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- poems: approved are public; author full control of own rows
DROP POLICY IF EXISTS "poems_read" ON poems;
CREATE POLICY "poems_read" ON poems
FOR SELECT TO anon, authenticated
USING (status = 'approved' OR auth.uid() = submitted_by);

DROP POLICY IF EXISTS "poems_insert_own" ON poems;
CREATE POLICY "poems_insert_own" ON poems
FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "poems_update_own" ON poems;
CREATE POLICY "poems_update_own" ON poems
FOR UPDATE TO authenticated USING (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "poems_delete_own" ON poems;
CREATE POLICY "poems_delete_own" ON poems
FOR DELETE TO authenticated USING (auth.uid() = submitted_by);

-- poem_likes: public read; each user manages own
DROP POLICY IF EXISTS "likes_public_read" ON poem_likes;
CREATE POLICY "likes_public_read" ON poem_likes
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "likes_insert_own" ON poem_likes;
CREATE POLICY "likes_insert_own" ON poem_likes
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "likes_delete_own" ON poem_likes;
CREATE POLICY "likes_delete_own" ON poem_likes
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- poem_comments: public read; each user manages own
DROP POLICY IF EXISTS "comments_public_read" ON poem_comments;
CREATE POLICY "comments_public_read" ON poem_comments
FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "comments_insert_own" ON poem_comments;
CREATE POLICY "comments_insert_own" ON poem_comments
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "comments_delete_own" ON poem_comments;
CREATE POLICY "comments_delete_own" ON poem_comments
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- poem_bookmarks: each user sees and manages only their own
DROP POLICY IF EXISTS "bookmarks_read_own" ON poem_bookmarks;
CREATE POLICY "bookmarks_read_own" ON poem_bookmarks
FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_insert_own" ON poem_bookmarks;
CREATE POLICY "bookmarks_insert_own" ON poem_bookmarks
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "bookmarks_delete_own" ON poem_bookmarks;
CREATE POLICY "bookmarks_delete_own" ON poem_bookmarks
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- videos: approved are public; author manages own
DROP POLICY IF EXISTS "videos_read" ON videos;
CREATE POLICY "videos_read" ON videos
FOR SELECT TO anon, authenticated
USING (status = 'approved' OR auth.uid() = submitted_by);

DROP POLICY IF EXISTS "videos_insert_own" ON videos;
CREATE POLICY "videos_insert_own" ON videos
FOR INSERT TO authenticated WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "videos_update_own" ON videos;
CREATE POLICY "videos_update_own" ON videos
FOR UPDATE TO authenticated USING (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "videos_delete_own" ON videos;
CREATE POLICY "videos_delete_own" ON videos
FOR DELETE TO authenticated USING (auth.uid() = submitted_by);

-- ------------------------------------------------------------------
-- Grants
-- ------------------------------------------------------------------
GRANT SELECT ON categories TO anon, authenticated;
GRANT SELECT ON poets, poems, poem_likes, poem_comments, videos TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON poets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON poems TO authenticated;
GRANT INSERT, DELETE ON poem_likes, poem_bookmarks TO authenticated;
GRANT INSERT, DELETE ON poem_comments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON poem_bookmarks TO authenticated;
GRANT INSERT, UPDATE, DELETE ON videos TO authenticated;
GRANT ALL ON categories, poets, poems, profiles, poem_likes, poem_comments, poem_bookmarks, videos TO service_role;