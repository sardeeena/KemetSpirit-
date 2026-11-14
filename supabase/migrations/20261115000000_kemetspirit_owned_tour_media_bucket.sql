-- Keep KemetSpirit-owned tour media in its own Supabase project.
-- The public bucket already has least-privilege storage.objects policies in
-- migrations 20261111142208 and 20261110061832; this migration creates/configures
-- the bucket only and does not copy or delete any objects.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'tour-media',
  'tour-media',
  true,
  20971520,
  array['image/jpeg','image/png','image/webp','image/avif','image/gif']::text[]
)
on conflict (id) do update
set
  name = excluded.name,
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public can view tour media files'
  ) then
    raise exception 'Expected public read policy for tour-media is missing; refusing to expose media without the reviewed storage policy.';
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname in ('RBAC can upload tour media', 'Admins can upload tour media')
  ) then
    raise exception 'Expected RBAC/admin upload policy for tour-media is missing.';
  end if;
end $$;
