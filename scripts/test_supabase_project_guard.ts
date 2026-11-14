import fs from 'node:fs';
import assert from 'node:assert/strict';
import {
  EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF,
  isExpectedKemetSpiritSupabaseUrl,
  resolveKemetSpiritSupabaseUrl,
} from '../src/lib/supabaseProjectGuard';

const kemetSpiritUrl = `https://${EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF}.supabase.co`;
const awesomeAdventureUrl = 'https://uvtbtpxtrrmaublrztgv.supabase.co';
const retiredSourceProjectUrl = 'https://cyifhjqqvtiguitrziqs.supabase.co';

assert.equal(EXPECTED_KEMETSPIRIT_SUPABASE_PROJECT_REF, 'mktrtoctcjyokclpdeui', 'the production project ref is KemetSpirit');

const rootHtml = fs.readFileSync('index.html', 'utf8');
const wrongBrandCleanup = fs.readFileSync('supabase/migrations/20261113114456_canonical_awesome_adventure_tours_brand_cleanup.sql', 'utf8');
const wrongGuideDomainCleanup = fs.readFileSync('supabase/migrations/20261113115613_remove_retired_guide_email_domains.sql', 'utf8');
assert.ok(rootHtml.includes('<link rel="dns-prefetch" href="' + kemetSpiritUrl + '">'), 'the document preconnects to the KemetSpirit Supabase project');
assert.doesNotMatch(rootHtml, /uvtbtpxtrrmaublrztgv/i, 'the document must not reference the Awesome Adventure Supabase project');
assert.doesNotMatch(wrongBrandCleanup, /Awesome Adventure Tours|awesomeadventure\.tours/i, 'the historical brand cleanup migration must not write Awesome Adventure branding into KemetSpirit');
assert.doesNotMatch(wrongGuideDomainCleanup, /@kemetspirit\.com/i, 'the historical guide-domain migration must not remove KemetSpirit email addresses');
assert.doesNotMatch(wrongGuideDomainCleanup, /UPDATE\\s+public\\.guides[\\s\\S]*SET\\s+email\\s*=\\s*NULL/i, 'the historical guide-domain migration must not clear guide email addresses');
assert.equal(isExpectedKemetSpiritSupabaseUrl(kemetSpiritUrl), true, 'production accepts the KemetSpirit project');
assert.equal(isExpectedKemetSpiritSupabaseUrl(awesomeAdventureUrl), false, 'production rejects the separate AwesomeAdventure project');
assert.equal(isExpectedKemetSpiritSupabaseUrl(retiredSourceProjectUrl), false, 'production rejects the retired unrelated project');
assert.equal(isExpectedKemetSpiritSupabaseUrl('http://mktrtoctcjyokclpdeui.supabase.co'), false, 'production requires HTTPS');
assert.equal(isExpectedKemetSpiritSupabaseUrl('https://another-project.supabase.co'), false, 'production rejects other Supabase projects');
assert.equal(isExpectedKemetSpiritSupabaseUrl(kemetSpiritUrl, true), true, 'development accepts the KemetSpirit project');
assert.equal(isExpectedKemetSpiritSupabaseUrl(awesomeAdventureUrl, true), true, 'development may use a separate hosted test project');
assert.equal(isExpectedKemetSpiritSupabaseUrl('http://127.0.0.1:54321', true), true, 'development accepts local Supabase');
assert.equal(isExpectedKemetSpiritSupabaseUrl('not-a-url', true), false, 'invalid URLs are rejected');

const malformedServerUrlFallback = resolveKemetSpiritSupabaseUrl(
  'mktrtoctcjyokclpdeui.supabase.co',
  kemetSpiritUrl
);
assert.equal(malformedServerUrlFallback.url, kemetSpiritUrl, 'a malformed server URL falls back to a valid KemetSpirit Vite URL');
assert.ok(malformedServerUrlFallback.warning, 'the malformed primary URL is reported as a warning');

const wrongProjectPrimary = resolveKemetSpiritSupabaseUrl(awesomeAdventureUrl, kemetSpiritUrl);
assert.equal(wrongProjectPrimary.url, null, 'a valid URL for another project is rejected without fallback');

const invalidFallback = resolveKemetSpiritSupabaseUrl('not-a-url', 'also-not-a-url');
assert.equal(invalidFallback.url, null, 'invalid primary and fallback URLs are rejected');

console.log('Supabase project guard checks passed.');
