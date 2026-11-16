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
const retiredCompanyNamePattern = new RegExp(['Awesome', 'Adventure', 'Tours'].join('\\s+'), 'i');
assert.match('Awesome Adventure Tours', retiredCompanyNamePattern, 'the retired-company matcher recognizes the exact brand with spaces');
assert.match('Awesome\tAdventure\nTours', retiredCompanyNamePattern, 'the retired-company matcher recognizes variable whitespace');
const retiredCompanyDomainPattern = new RegExp(['awesomeadventure', '.tours'].join(''), 'i');
assert.doesNotMatch(wrongBrandCleanup, retiredCompanyNamePattern, 'the historical brand cleanup migration must not write retired company branding into KemetSpirit');
assert.doesNotMatch(wrongBrandCleanup, retiredCompanyDomainPattern, 'the historical brand cleanup migration must not write a retired company domain into KemetSpirit');
assert.doesNotMatch(wrongGuideDomainCleanup, /@kemetspirit\.com/i, 'the historical guide-domain migration must not remove KemetSpirit email addresses');
assert.doesNotMatch(wrongGuideDomainCleanup, /UPDATE\s+public\.guides[\s\S]*SET\s+email\s*=\s*NULL/i, 'the historical guide-domain migration must not clear guide email addresses');
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


const envExample = fs.readFileSync('.env.example', 'utf8');
assert.match(envExample, /^SUPABASE_URL=https:\/\/mktrtoctcjyokclpdeui\.supabase\.co$/m, 'server environment template points to KemetSpirit Supabase');
assert.match(envExample, /^VITE_SUPABASE_URL=https:\/\/mktrtoctcjyokclpdeui\.supabase\.co$/m, 'browser environment template points to KemetSpirit Supabase');
const authConfig = fs.readFileSync('supabase/config.toml', 'utf8');
const authService = fs.readFileSync('src/services/authService.ts', 'utf8');
assert.match(authConfig, /site_url\s*=\s*"https:\/\/kemetspirit\.com"/, 'Supabase Auth canonical site URL is KemetSpirit');
assert.match(authConfig, /"https:\/\/kemetspirit\.com\/\*\*"/, 'Supabase Auth allows KemetSpirit production callbacks');
assert.match(authConfig, /"https:\/\/www\.kemetspirit\.com\/\*\*"/, 'Supabase Auth allows the KemetSpirit www callback host');
assert.doesNotMatch(authConfig, /mahmoud-crm|awesomeadventure|uvtbtpxtrrmaublrztgv/i, 'Supabase Auth config contains no foreign project or domain');
assert.match(authService, /getKemetSpiritAuthRedirectUrl/, 'signup, resend and recovery use the KemetSpirit redirect helper');
assert.match(authService, /'https:\/\/kemetspirit\.com'/, 'server-side callback fallback is the KemetSpirit production domain');
assert.doesNotMatch(authService, /mahmoud-crm-eosin\.vercel\.app|uvtbtpxtrrmaublrztgv|cyifhjqqvtiguitrziqs/i, 'Auth service contains no foreign deployment or Supabase project');
assert.doesNotMatch(authService, /data\.session\s*\n\s*\)/, 'an Auth session alone cannot be treated as email verification');
assert.match(authService, /if \(!user\.email_confirmed_at \|\| !profile\.is_confirmed\) return null/, 'restored sessions require both Auth and profile confirmation');

console.log('Supabase project guard and Auth configuration checks passed.');
