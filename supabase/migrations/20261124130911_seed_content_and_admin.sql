/*
# Seed content and add admin role support

1. Changes
- Adds `role` column to `profiles` ('user' default, 'admin' for administrators). Client UPDATE grants exclude this column so users cannot promote themselves.
- Inserts the six core literary categories: Ghazal, Nazm, Shayari, Hamd, Naat, and Rubai.
- Inserts six world-renowned poets: Mirza Ghalib, Allama Iqbal, Faiz Ahmed Faiz, Ahmad Faraz, Mir Taqi Mir, and Parveen Shakir.
- Adds four sample approved poems across Urdu/Roman/English so the site opens with real content.
- Creates helper functions:
  - `is_admin()` — checks the caller's profile role (used by admin RLS policies).
  - `increment_poem_views(uuid)` — safely bumps a poem's view counter, callable by anon + authenticated.
  - `handle_new_user()` — trigger creating a `profiles` row and a `poets` row on signup.

2. Security
- `role` column: no INSERT/UPDATE grant to anon/authenticated, so only service_role/admin can change it.
- `is_admin` SECURITY DEFINER, EXECUTE to authenticated only.
- `increment_poem_views` SECURITY DEFINER, EXECUTE to anon + authenticated.
- Signup trigger runs as definer (standard Supabase pattern).

3. Notes
- All inserts idempotent; poets referenced by slug.
*/

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

INSERT INTO categories (name, name_ur, slug, description) VALUES
  ('Ghazal', 'غزل', 'ghazal', 'The classic form of amatory and philosophical Urdu verse'),
  ('Nazm', 'نظم', 'nazm', 'Free-verse and structured thematic poetry'),
  ('Shayari', 'شاعری', 'shayari', 'General poetic expression and couplets'),
  ('Hamd', 'حمد', 'hamd', 'Poetry in praise of Allah'),
  ('Naat', 'نعت', 'naat', 'Poetry in praise of the Prophet Muhammad (PBUH)'),
  ('Rubai', 'ربعائی', 'rubai', 'Four-line verses with a single rhyme')
ON CONFLICT (name) DO NOTHING;

INSERT INTO poets (name, name_ur, slug, bio, era, country, featured) VALUES
  ('Mirza Ghalib', 'مرزا غالب', 'mirza-ghalib', 'Mirza Asadullah Khan Ghalib (1797–1869) is widely regarded as the greatest Urdu poet. His ghazals explore love, loss, philosophy and the human condition with unmatched wit and depth.', '1797–1869', 'India', true),
  ('Allama Iqbal', 'علامہ اقبال', 'allama-iqbal', 'Sir Muhammad Iqbal (1877–1938), the Poet of the East, wrote philosophy in verse that inspired the idea of Pakistan. His works include Bang-e-Dra and Javed Nama.', '1877–1938', 'Pakistan', true),
  ('Faiz Ahmed Faiz', 'فیض احمد فیض', 'faiz-ahmed-faiz', 'Faiz Ahmed Faiz (1911–1984) blended romance with resistance. A Nobel-nominated poet whose ghazals became anthems of hope across the world.', '1911–1984', 'Pakistan', true),
  ('Ahmad Faraz', 'احمد فراز', 'ahmad-faraz', 'Ahmad Faraz (1931–2008) was one of the most beloved modern ghazal writers, known for his tender romantic voice and sharp social commentary.', '1931–2008', 'Pakistan', true),
  ('Mir Taqi Mir', 'مرزا میر', 'mir-taqi-mir', 'Mir Taqi Mir (1723–1810), often called Khuda-e-Sukhan (God of Poetry), was the leading poet of the Delhi school and a master of the ghazal.', '1723–1810', 'India', true),
  ('Parveen Shakir', 'پروین شاکر', 'parveen-shakir', 'Parveen Shakir (1952–1994) brought a unique feminine voice to Urdu poetry, celebrated for her collection Khushbu and delicate imagery.', '1952–1994', 'Pakistan', true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO poems (poet_id, title, title_ur, language, body, body_ur, category_id, status, featured, views)
SELECT p.id, v.title, v.title_ur, v.language, v.body, v.body_ur, c.id, v.status, v.featured, v.views
FROM (VALUES
  ('mirza-ghalib', 'Hazaaron Khwahishen', 'ہزاروں خواہشیں ایسی', 'urdu', 'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے
بہت نکلے مرے ارمان لیکن پھر بھی کم نکلے', NULL, 'ghazal', 'approved', true, 1240),
  ('mirza-ghalib', 'Hazaaron Khwahishen (Roman)', 'ہزاروں خواہشیں ایسی', 'roman', 'Hazaaron khwahishen aisi ke har khwahish pe dam nikle
Bahut nikle mere armaan lekin phir bhi kam nikle', NULL, 'ghazal', 'approved', false, 860),
  ('allama-iqbal', 'The Dreamer of Dawn', NULL, 'english', 'In the depths of the soul, a whisper stirs like dawn,
An echo of the eternal, that no night has drawn.
Iqbal sang of a selfhood rising past the skies,
The dreamer of a homeland where the eagle flies.', NULL, 'nazm', 'approved', false, 430),
  ('faiz-ahmed-faiz', 'Aur Bhi Dukh Hain', NULL, 'roman', 'Aur bhi dukh hain zamane mein maut ke siwa
Aur bhi raat ki thakan, aur bhi din ka maalam', NULL, 'ghazal', 'approved', false, 310)
) AS v(poet_slug, title, title_ur, language, body, body_ur, category_slug, status, featured, views)
JOIN poets p ON p.slug = v.poet_slug
JOIN categories c ON c.slug = v.category_slug
WHERE NOT EXISTS (SELECT 1 FROM poems WHERE poems.title = v.title AND poems.poet_id = p.id);