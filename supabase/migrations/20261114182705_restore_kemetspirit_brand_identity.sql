-- Restore KemetSpirit identity after unrelated Awesome Adventure Tours
-- branding was accidentally applied to this project's content records.
-- This migration is intentionally idempotent and mirrors the repair already
-- applied to the KemetSpirit Supabase project (mktrtoctcjyokclpdeui).

ALTER TABLE public.blog_posts
  ALTER COLUMN author_name SET DEFAULT 'KemetSpirit Editorial Team';

COMMENT ON TABLE public.user_roles IS
  'Canonical many-to-many user-to-role assignments for KemetSpirit RBAC.';

UPDATE public.blog_posts
SET
  title = replace(replace(title, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  excerpt = replace(replace(excerpt, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  content = replace(replace(content, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  author_name = replace(replace(author_name, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  seo_title = replace(replace(seo_title, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  seo_description = replace(replace(seo_description, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  updated_at = now()
WHERE
  title ILIKE '%Awesome Adventure Tours%' OR title ILIKE '%awesomeadventure.tours%' OR
  excerpt ILIKE '%Awesome Adventure Tours%' OR excerpt ILIKE '%awesomeadventure.tours%' OR
  content ILIKE '%Awesome Adventure Tours%' OR content ILIKE '%awesomeadventure.tours%' OR
  author_name ILIKE '%Awesome Adventure Tours%' OR author_name ILIKE '%awesomeadventure.tours%' OR
  seo_title ILIKE '%Awesome Adventure Tours%' OR seo_title ILIKE '%awesomeadventure.tours%' OR
  seo_description ILIKE '%Awesome Adventure Tours%' OR seo_description ILIKE '%awesomeadventure.tours%';

UPDATE public.seo_metadata
SET
  seo_title = replace(replace(seo_title, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  meta_description = replace(replace(meta_description, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  canonical_url = replace(replace(canonical_url, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  og_title = replace(replace(og_title, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  og_description = replace(replace(og_description, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  seo_keywords = CASE
    WHEN seo_keywords IS NULL THEN NULL
    ELSE ARRAY(
      SELECT replace(replace(keyword, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com')
      FROM unnest(seo_keywords) AS keyword
    )
  END,
  structured_data = CASE
    WHEN structured_data IS NULL THEN NULL
    ELSE replace(replace(structured_data::text, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com')::jsonb
  END,
  updated_at = now()
WHERE
  seo_title ILIKE '%Awesome Adventure Tours%' OR seo_title ILIKE '%awesomeadventure.tours%' OR
  meta_description ILIKE '%Awesome Adventure Tours%' OR meta_description ILIKE '%awesomeadventure.tours%' OR
  canonical_url ILIKE '%Awesome Adventure Tours%' OR canonical_url ILIKE '%awesomeadventure.tours%' OR
  og_title ILIKE '%Awesome Adventure Tours%' OR og_title ILIKE '%awesomeadventure.tours%' OR
  og_description ILIKE '%Awesome Adventure Tours%' OR og_description ILIKE '%awesomeadventure.tours%' OR
  EXISTS (
    SELECT 1 FROM unnest(seo_keywords) AS keyword
    WHERE keyword ILIKE '%Awesome Adventure Tours%' OR keyword ILIKE '%awesomeadventure.tours%'
  ) OR
  structured_data::text ILIKE '%Awesome Adventure Tours%' OR
  structured_data::text ILIKE '%awesomeadventure.tours%';

UPDATE public.communication_templates
SET
  name = replace(replace(name, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  subject = replace(replace(subject, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  body_text = replace(replace(body_text, 'Awesome Adventure Tours', 'KemetSpirit'), 'awesomeadventure.tours', 'kemetspirit.com'),
  updated_at = now()
WHERE
  name ILIKE '%Awesome Adventure Tours%' OR name ILIKE '%awesomeadventure.tours%' OR
  subject ILIKE '%Awesome Adventure Tours%' OR subject ILIKE '%awesomeadventure.tours%' OR
  body_text ILIKE '%Awesome Adventure Tours%' OR body_text ILIKE '%awesomeadventure.tours%';
