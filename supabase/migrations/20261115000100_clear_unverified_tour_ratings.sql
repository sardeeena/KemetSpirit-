-- Placeholder tour ratings are not reviews. Keep the display and structured data
-- honest by clearing only ratings whose review_count is zero.
update public.tours
set rating = 0,
    updated_at = now()
where review_count = 0
  and rating <> 0;

do $$
begin
  if exists (
    select 1 from public.tours
    where review_count = 0 and rating <> 0
  ) then
    raise exception 'Unreviewed tours still have a non-zero rating.';
  end if;
end $$;
