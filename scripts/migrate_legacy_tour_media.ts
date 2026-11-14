import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
const LEGACY_PROJECT_REF = 'cyifhjqqvtiguitrziqs';
const BUCKET = 'tour-media';
const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

if (!SUPABASE_URL || !SERVICE_KEY) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SECRET_KEY) for the KemetSpirit project.');
}
let configuredProjectHost = '';
try { configuredProjectHost = new URL(SUPABASE_URL).hostname; } catch { /* rejected below */ }
if (configuredProjectHost !== 'mktrtoctcjyokclpdeui.supabase.co') {
  throw new Error('Refusing to migrate media: SUPABASE_URL is not the approved KemetSpirit project.');
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: bucketListError } = await supabase.storage.listBuckets();
if (bucketListError) throw bucketListError;
if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_IMAGE_BYTES,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif'],
  });
  if (error) throw error;
}

const { data: images, error: imageQueryError } = await supabase
  .from('tour_images')
  .select('id,tour_id,image_url,storage_path,alt_text,caption,is_primary,sort_order')
  .order('created_at', { ascending: true });
if (imageQueryError) throw imageQueryError;

const legacyImages = (images || []).filter((image) => {
  try {
    return new URL(image.image_url).hostname === `${LEGACY_PROJECT_REF}.supabase.co`;
  } catch {
    return false;
  }
});

let migrated = 0;
let skipped = (images || []).length - legacyImages.length;
const failures: string[] = [];

for (const image of legacyImages) {
  const existingPath = image.storage_path;
  if (existingPath && image.image_url.includes(`/storage/v1/object/public/${BUCKET}/`)) {
    skipped++;
    continue;
  }

  try {
    const response = await fetch(image.image_url, { signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error(`Source returned HTTP ${response.status}`);
    const contentType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']);
    if (!allowedTypes.has(contentType)) throw new Error(`Unsupported content type: ${contentType || 'missing'}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error(`Invalid image size: ${bytes.length} bytes`);

    const extension = contentType === 'image/jpeg' ? 'jpg' : contentType.split('/')[1];
    const objectPath = `tours/${image.tour_id}/${image.id}.${extension}`;
    const { error: uploadError } = await supabase.storage.from(BUCKET).upload(objectPath, bytes, {
      contentType,
      cacheControl: '31536000',
      upsert: true,
    });
    if (uploadError) throw uploadError;

    const { data: publicUrl } = supabase.storage.from(BUCKET).getPublicUrl(objectPath);
    const publicCheck = await fetch(publicUrl.publicUrl, { signal: AbortSignal.timeout(30000) });
    if (!publicCheck.ok) throw new Error(`Uploaded public object is not readable (HTTP ${publicCheck.status})`);
    const servedType = (publicCheck.headers.get('content-type') || '').split(';')[0].trim().toLowerCase();
    if (servedType !== contentType) throw new Error(`Uploaded object content type mismatch: ${servedType}`);
    const { error: updateError } = await supabase.from('tour_images').update({
      image_url: publicUrl.publicUrl,
      storage_path: objectPath,
    }).eq('id', image.id);
    if (updateError) throw updateError;
    migrated++;
    console.log(`Migrated ${image.id}`);
  } catch (error) {
    failures.push(`${image.id}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const { data: remaining, error: verifyError } = await supabase
  .from('tour_images')
  .select('id,image_url')
  .like('image_url', `https://${LEGACY_PROJECT_REF}.supabase.co/%`);
if (verifyError) throw verifyError;

console.log(JSON.stringify({
  totalImageRows: images?.length || 0,
  migrated,
  skipped,
  failures,
  remainingLegacyUrls: remaining?.length || 0,
}, null, 2));

if (failures.length || (remaining?.length || 0) > 0) {
  process.exitCode = 1;
}
