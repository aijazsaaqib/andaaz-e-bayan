/*
# Admin policies, view counter, and signup trigger

1. Changes
- Creates `is_admin()` SECURITY DEFINER function checking the caller's profile role.
- Adds admin override SELECT/UPDATE/DELETE policies on poems and videos using is_admin().
- Adds a `poem_views` counter table with an RPC `increment_poem_views(uuid)` for anonymous view counting.
- Creates `handle_new_user()` trigger function that auto-creates a `profiles` row and a `poets` row on signup.

2. Security
- Admin policies scoped with `is_admin()` — cannot be spoofed by clients (role column not client-writable).
- `increment_poem_views` is the only anonymous write path; touches only the counter table.
- `is_admin` EXECUTE revoked from PUBLIC/anon, granted to authenticated.
- `increment_poem_views` EXECUTE granted to anon + authenticated (needed by public pages).
- `handle_new_user` is SECURITY DEFINER (standard Supabase signup pattern).

3. Notes
- All idempotent; safe to re-run.
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;

CREATE TABLE IF NOT EXISTS poem_views (
  poem_id uuid PRIMARY KEY REFERENCES poems(id) ON DELETE CASCADE,
  count bigint NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE poem_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "poem_views_admin_read" ON poem_views;
CREATE POLICY "poem_views_admin_read" ON poem_views
FOR SELECT TO authenticated
USING (is_admin() OR EXISTS (SELECT 1 FROM poems WHERE poems.id = poem_views.poem_id AND poems.submitted_by = auth.uid()));

GRANT SELECT ON poem_views TO authenticated;
GRANT ALL ON poem_views TO service_role;

-- Admin management policies on poems
DROP POLICY IF EXISTS "poems_admin_select" ON poems;
CREATE POLICY "poems_admin_select" ON poems
FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "poems_admin_update" ON poems;
CREATE POLICY "poems_admin_update" ON poems
FOR UPDATE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "poems_admin_delete" ON poems;
CREATE POLICY "poems_admin_delete" ON poems
FOR DELETE TO authenticated USING (is_admin());

-- Admin management policies on videos
DROP POLICY IF EXISTS "videos_admin_select" ON videos;
CREATE POLICY "videos_admin_select" ON videos
FOR SELECT TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "videos_admin_update" ON videos;
CREATE POLICY "videos_admin_update" ON videos
FOR UPDATE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "videos_admin_delete" ON videos;
CREATE POLICY "videos_admin_delete" ON videos
FOR DELETE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "poets_admin_update" ON poets;
CREATE POLICY "poets_admin_update" ON poets
FOR UPDATE TO authenticated USING (is_admin());

DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles
FOR SELECT TO authenticated USING (is_admin());

-- ------------------------------------------------------------------
-- View counter function (RPC)
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_poem_views(p_poem_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO poem_views (poem_id, count) VALUES (p_poem_id, 1)
  ON CONFLICT (poem_id) DO UPDATE SET count = poem_views.count + 1, updated_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION increment_poem_views(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION increment_poem_views(uuid) TO anon, authenticated;

-- ------------------------------------------------------------------
-- Signup trigger: profile + poet record
-- ------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  dname text;
  uname text;
BEGIN
  dname := COALESCE(NULLIF(NEW.raw_user_meta_data->>'display_name', ''), split_part(NEW.email, '@', 1));
  uname := COALESCE(NULLIF(NEW.raw_user_meta_data->>'username', ''), 'poet_' || substr(replace(NEW.id::text, '-', ''), 1, 10));

  INSERT INTO profiles (id, username, display_name)
  VALUES (NEW.id, uname, dname)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO poets (user_id, name, slug, country)
  VALUES (NEW.id, dname, 'user-' || NEW.id::text, NULL)
  ON CONFLICT (slug) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();