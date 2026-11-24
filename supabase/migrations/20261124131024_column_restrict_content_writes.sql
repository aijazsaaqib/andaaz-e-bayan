/*
# Column-restrict writes on poems, videos, poets (moderation fields)

1. Changes
- `poems`: clients may INSERT/UPDATE only content columns (poet_id, title, title_ur, language, body, body_ur, category_id). `status`, `featured`, `views`, and `submitted_by` are no longer client-settable, so a submission can never arrive pre-approved or featured, and users cannot approve their own poems. `submitted_by` keeps its auth.uid() default.
- `videos`: same restriction — clients insert/update content columns only; `status` and `submitted_by` are server-managed.
- `poets`: clients may insert/update profile-ish columns only; the editorial `featured` flag is admin-only (service_role).

2. Security
- Moderation state moves fully server-side: only admins (via service_role or admin dashboard through privileged paths) can change status/featured.
- Column privileges are checked before policies, so this holds regardless of the USING predicates.

3. Notes
- Legitimate owner updates (editing their poem text/title) still work because content columns remain granted.
- No data changes; idempotent.
*/

-- poems
REVOKE INSERT, UPDATE ON poems FROM authenticated;
GRANT INSERT (poet_id, title, title_ur, language, body, body_ur, category_id) ON poems TO authenticated;
GRANT UPDATE (poet_id, title, title_ur, language, body, body_ur, category_id) ON poems TO authenticated;

-- videos
REVOKE INSERT, UPDATE ON videos FROM authenticated;
GRANT INSERT (title, title_ur, description, video_url, thumbnail_url, poet_name, event_name) ON videos TO authenticated;
GRANT UPDATE (title, title_ur, description, video_url, thumbnail_url, poet_name, event_name) ON videos TO authenticated;

-- poets
REVOKE INSERT, UPDATE ON poets FROM authenticated;
GRANT INSERT (user_id, name, name_ur, slug, bio, photo_url, era, country) ON poets TO authenticated;
GRANT UPDATE (name, name_ur, bio, photo_url, era, country) ON poets TO authenticated;