/*
# Admin moderation functions

1. Changes
- Adds SECURITY DEFINER functions for the admin dashboard, each checking the caller's admin role inside the function:
  - `admin_set_poem_status(uuid, text)` — approve/reject/pending a poem.
  - `admin_set_video_status(uuid, text)` — approve/reject/pending a video.
  - `admin_toggle_poem_featured(uuid, boolean)` — feature or unfeature a poem.
  - `admin_toggle_poet_featured(uuid, boolean)` — feature or unfeature a poet.
  - `admin_delete_poem(uuid)` / `admin_delete_video(uuid)` — remove content.
  - `admin_update_poem(uuid, text, text, text)` — edit a poem's title/body/body_ur.

2. Security
- Every function authorizes the caller via profiles.role = 'admin' using auth.uid(); parameters only name targets, never actors.
- All functions SET search_path; EXECUTE revoked from PUBLIC/anon, granted to authenticated.

3. Notes
- Needed because column-level grants now block clients (including admins) from writing status/featured columns directly; these functions are the legitimate server-checked path.
- Idempotent (CREATE OR REPLACE + DROP IF EXISTS policies/grants).
*/

CREATE OR REPLACE FUNCTION admin_set_poem_status(p_poem uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE poems SET status = p_status WHERE id = p_poem;
END;
$$;

CREATE OR REPLACE FUNCTION admin_set_video_status(p_video uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  IF p_status NOT IN ('pending', 'approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status';
  END IF;
  UPDATE videos SET status = p_status WHERE id = p_video;
END;
$$;

CREATE OR REPLACE FUNCTION admin_toggle_poem_featured(p_poem uuid, p_featured boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE poems SET featured = p_featured WHERE id = p_poem;
END;
$$;

CREATE OR REPLACE FUNCTION admin_toggle_poet_featured(p_poet uuid, p_featured boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE poets SET featured = p_featured WHERE id = p_poet;
END;
$$;

CREATE OR REPLACE FUNCTION admin_delete_poem(p_poem uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM poems WHERE id = p_poem;
END;
$$;

CREATE OR REPLACE FUNCTION admin_delete_video(p_video uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  DELETE FROM videos WHERE id = p_video;
END;
$$;

CREATE OR REPLACE FUNCTION admin_update_poem(p_poem uuid, p_title text, p_body text, p_body_ur text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE poems SET title = p_title, body = p_body, body_ur = p_body_ur WHERE id = p_poem;
END;
$$;

REVOKE EXECUTE ON FUNCTION admin_set_poem_status(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION admin_set_video_status(uuid, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION admin_toggle_poem_featured(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION admin_toggle_poet_featured(uuid, boolean) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION admin_delete_poem(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION admin_delete_video(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION admin_update_poem(uuid, text, text, text) FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION admin_set_poem_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_set_video_status(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_poem_featured(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_poet_featured(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_poem(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_delete_video(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_update_poem(uuid, text, text, text) TO authenticated;