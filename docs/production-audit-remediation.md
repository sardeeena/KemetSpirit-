# KemetSpirit production audit remediation

## Retired cross-project restore workflow

The manually triggered KemetSpirit-to-AwesomeAdventure database restore workflow was removed. KemetSpirit must not contain a workflow capable of truncating or replacing another project's database.

## KemetSpirit-owned tour media

Migration `20261115000000_kemetspirit_owned_tour_media_bucket.sql` provisions the KemetSpirit-owned public `tour-media` bucket. It preserves the reviewed public-read and admin/RBAC write policies.

The current `tour_images` catalogue contains 82 rows. 80 image URLs point to the separate legacy `Tour` Supabase project (`cyifhjqqvtiguitrziqs`). That project is not KemetSpirit and its storage is explicitly out of scope. **Do not fetch, download, copy, modify, or delete anything from that project.** The legacy URLs remain untouched.

To move imagery into KemetSpirit in the future, use only original image files supplied directly by the KemetSpirit owner or newly created KemetSpirit-owned assets. Upload them directly to the KemetSpirit `tour-media` bucket, verify each uploaded public URL, and only then update the corresponding KemetSpirit `tour_images` row. Do not use the old `Tour` project as a source.

## Catalogue data quality

The database migration resets tour ratings to zero only where there are no associated reviews (`review_count = 0`). This removes placeholder ratings without changing any tour with a non-zero review count. The UI displays a new-season label when no reviews exist.

## Contact and generated server output

All client-side SEO structured-data phone references use `+201022124589`. The production build regenerates `server.js` from `server.ts`; CI checks the generated artifact after the build so a stale committed bundle cannot silently reintroduce old contact details or a legacy Supabase project reference.

## Editorial follow-up

The 50 published articles still need a topic-specific editorial pass and relevant cover imagery. They must not be bulk-filled with unrelated images or thin duplicate text.