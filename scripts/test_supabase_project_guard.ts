import assert from 'node:assert/strict';
import {
  EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF,
  isExpectedKemetSpiritSupabaseUrl,
} from '../src/lib/supabaseProjectGuard';

const kemetSpiritUrl = `https://${EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF}.supabase.co`;
const legacyProjectUrl = 'https://cyifhjqqvtiguitrziqs.supabase.co';

assert.equal(isExpectedKemetSpiritSupabaseUrl(kemetSpiritUrl), true, 'production accepts the KemetSpirit project');
assert.equal(isExpectedKemetSpiritSupabaseUrl(legacyProjectUrl), false, 'production rejects the unrelated legacy project');
assert.equal(isExpectedKemetSpiritSupabaseUrl('https://mktrtoctcjyokclpdeui.supabase.co'), false, 'production rejects the retired source project after migration');
assert.equal(isExpectedKemetSpiritSupabaseUrl('http://mktrtoctcjyokclpdeui.supabase.co'), false, 'production requires HTTPS');
assert.equal(isExpectedKemetSpiritSupabaseUrl('https://another-project.supabase.co'), false, 'production rejects other Supabase projects');
assert.equal(isExpectedKemetSpiritSupabaseUrl(kemetSpiritUrl, true), true, 'development accepts the KemetSpirit project');
assert.equal(isExpectedKemetSpiritSupabaseUrl(legacyProjectUrl, true), true, 'development may use a separate hosted test project');
assert.equal(isExpectedKemetSpiritSupabaseUrl('http://127.0.0.1:54321', true), true, 'development accepts local Supabase');
assert.equal(isExpectedKemetSpiritSupabaseUrl('not-a-url', true), false, 'invalid URLs are rejected');

console.log('Supabase project guard checks passed.');
