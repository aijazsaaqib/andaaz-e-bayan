/*
# Tighten column-level privileges on profiles

1. Changes
- Revokes table-wide UPDATE/INSERT on `profiles` from anon and authenticated.
- Re-grants UPDATE only on user-editable profile columns (username, display_name, bio, photo_url), so users can never change their own `role` through the data API.
- Grants a `set_user_role(uuid, text)` SECURITY DEFINER function for the admin dashboard to change roles safely (admin-checked inside, EXECUTE to authenticated only).

2. Security
- Role escalation fix: even though the UPDATE policy scopes rows to the owner, the table-wide grant previously covered the `role` column. Column grants are checked before policies, so this closes the hole.
- `set_user_role` derives the actor from auth.uid(), validates the role value, and is the only client-callable path to change a role.

3. Notes
- No data changes; idempotent.
*/

REVOKE UPDATE ON profiles FROM anon, authenticated;
REVOKE INSERT ON profiles FROM anon, authenticated;

GRANT UPDATE (username, display_name, bio, photo_url) ON profiles TO authenticated;

CREATE OR REPLACE FUNCTION set_user_role(p_user uuid, p_role text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  IF p_role NOT IN ('user', 'admin') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  UPDATE profiles SET role = p_role WHERE id = p_user;
END;
$$;

REVOKE EXECUTE ON FUNCTION set_user_role(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION set_user_role(uuid, text) TO authenticated;