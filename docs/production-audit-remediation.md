# KemetSpirit production audit remediation

## Retired cross-project restore workflow

The manually triggered KemetSpirit-to-AwesomeAdventure database restore workflow was removed. KemetSpirit must not contain a workflow capable of truncating or replacing another project's database.

## KemetSpirit-owned tour media

Migration `20261115000000_kemetspirit_owned_tour_media_bucket.sql` provisions the existing `tour-media` bucket in the KemetSpirit project. It preserves the reviewed public-read and admin/RBAC write policies.

After this PR is merged and the migration is applied, run the one-time media transfer from a trusted environment with Node.js 22 and these environment variables. On the KemetSpirit Hostinger Node.js website, the `build:with-media-migration` script runs the migration first and only runs the normal production build if the transfer and verification succeed. Use that build script for the one-time post-merge deployment; restore the normal `build` script as the default Hostinger build setting afterward.

- `SUPABASE_URL`: KemetSpirit project URL only (`https://mktrtoctcjyokclpdeui.supabase.co`)
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY`: KemetSpirit server-side secret key only

Run:

```bash
npm ci
npm run migrate:tour-media
```

The script downloads only image URLs from the explicitly identified legacy public project, uploads them into KemetSpirit's `tour-media` bucket, updates each `tour_images` row after successful upload, and verifies that no legacy project URLs remain. It does not connect to or modify the legacy project's database or storage. Keep a database backup before running it. Do not put service keys in GitHub source, Vite client variables, or commit history.

The script is safe to rerun: rows already pointing at KemetSpirit's bucket are skipped and uploads use stable object paths. The Hostinger build script is a one-off operation; do not make it the permanent automatic-deployment build command because future deployments should not repeat a data migration.

## Catalogue data quality

The database migration resets tour ratings to zero only where there are no associated reviews (review_count = 0). This removes placeholder 4.9 ratings without changing any tour with a non-zero review count. The UI already displays "New Season Release" when no reviews exist.

## Contact and generated server output

All client-side SEO structured-data phone references now use `+201022124589`. The production build regenerates `server.js` from `server.ts`; CI checks the generated artifact after the build so a stale committed bundle cannot silently reintroduce old contact details or a legacy Supabase project reference.

## Editorial follow-up

The 50 published articles are not rewritten automatically by this technical remediation. Cover imagery and deeper original editorial research require a human-reviewed content pass; generic tour photos must not be assigned as article covers solely to fill empty fields.
