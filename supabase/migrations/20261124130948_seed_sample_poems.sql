/*
# Seed sample poems

1. Changes
- Adds four approved sample poems across Urdu/Roman/English, linked to seeded poets and categories.
- Uses a values join with a NOT EXISTS guard so re-running does not duplicate rows.

2. Security
- No policy changes; RLS already enabled with policies from previous migrations.

3. Notes
- Poems referenced by title + poet slug, so seeding is idempotent.
*/

INSERT INTO poems (poet_id, title, title_ur, language, body, body_ur, category_id, status, featured, views)
SELECT p.id, v.title, v.title_ur, v.language, v.body, v.body_ur, c.id, v.status, v.featured, v.views
FROM (VALUES
  ('mirza-ghalib', 'Hazaaron Khwahishen', 'ہزاروں خواہشیں ایسی', 'urdu',
   E'ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے\nبہت نکلے مرے ارمان لیکن پھر بھی کم نکلے',
   NULL::text, 'ghazal', 'approved', true, 1240),
  ('mirza-ghalib', 'Hazaaron Khwahishen (Roman)', NULL, 'roman',
   E'Hazaaron khwahishen aisi ke har khwahish pe dam nikle\nBahut nikle mere armaan lekin phir bhi kam nikle',
   NULL::text, 'ghazal', 'approved', false, 860),
  ('allama-iqbal', 'The Dreamer of Dawn', NULL, 'english',
   E'In the depths of the soul, a whisper stirs like dawn,\nAn echo of the eternal, that no night has drawn.\nIqbal sang of a selfhood rising past the skies,\nThe dreamer of a homeland where the eagle flies.',
   NULL::text, 'nazm', 'approved', false, 430),
  ('faiz-ahmed-faiz', 'Aur Bhi Dukh Hain', NULL, 'roman',
   E'Aur bhi dukh hain zamane mein maut ke siwa\nAur bhi har ghari matam, aur bhi har ghari udaasi',
   NULL::text, 'ghazal', 'approved', false, 310)
) AS v(poet_slug, title, title_ur, language, body, body_ur, category_slug, status, featured, views)
JOIN poets p ON p.slug = v.poet_slug
JOIN categories c ON c.slug = v.category_slug
WHERE NOT EXISTS (
  SELECT 1 FROM poems WHERE poems.title = v.title AND poems.poet_id = p.id
);