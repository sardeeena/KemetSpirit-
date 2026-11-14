BEGIN;
SELECT plan(22);

SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.visitor_sessions'::regclass), 'visitor_sessions has RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.visitor_events'::regclass), 'visitor_events has RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.visitor_consent_records'::regclass), 'visitor_consent_records has RLS enabled');
SELECT ok((SELECT relrowsecurity FROM pg_class WHERE oid = 'public.visitor_analytics_settings'::regclass), 'visitor_analytics_settings has RLS enabled');

SELECT ok(NOT has_table_privilege('anon', 'public.visitor_sessions', 'SELECT'), 'anon cannot read visitor sessions');
SELECT ok(NOT has_table_privilege('authenticated', 'public.visitor_sessions', 'SELECT'), 'authenticated users cannot read visitor sessions');
SELECT ok(NOT has_table_privilege('anon', 'public.visitor_events', 'SELECT'), 'anon cannot read visitor events');
SELECT ok(NOT has_table_privilege('authenticated', 'public.visitor_events', 'SELECT'), 'authenticated users cannot read visitor events');
SELECT ok(NOT has_table_privilege('anon', 'public.visitor_consent_records', 'SELECT'), 'anon cannot read consent history');
SELECT ok(NOT has_table_privilege('authenticated', 'public.visitor_consent_records', 'SELECT'), 'authenticated users cannot read consent history');

SELECT ok(has_table_privilege('service_role', 'public.visitor_sessions', 'INSERT'), 'server service role can write visitor sessions');
SELECT ok(has_table_privilege('service_role', 'public.visitor_events', 'INSERT'), 'server service role can write visitor events');

SELECT ok(NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_sessions' AND column_name = 'ip_address'), 'visitor sessions do not store raw IP addresses');
SELECT ok(NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_sessions' AND column_name = 'cookie_values'), 'visitor sessions do not store cookie values');
SELECT ok(NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_events' AND column_name = 'request_body'), 'visitor events do not store request bodies');
SELECT ok((SELECT pg_get_constraintdef(oid) LIKE '%auth_sign_in%' FROM pg_constraint WHERE conrelid = 'public.visitor_events'::regclass AND conname = 'visitor_events_event_name_check'), 'visitor event allowlist includes authentication audit events');

SELECT ok(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_analytics_settings' AND column_name = 'technical_event_retention_days'), 'technical event retention is configurable');
SELECT ok(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_analytics_settings' AND column_name = 'audit_log_retention_days'), 'business audit retention is configurable');
SELECT ok(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_sessions' AND column_name = 'utm_term'), 'UTM search term attribution is available');
SELECT ok(EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'visitor_sessions' AND column_name = 'utm_content'), 'UTM content attribution is available');

-- Withdrawn-consent sessions remain in the audit history but must not contribute
-- to visitor-event or booking-funnel analytics.
WITH sessions AS (
  INSERT INTO public.visitor_sessions (id, visitor_id, analytics_consent)
  VALUES
    (gen_random_uuid(), gen_random_uuid(), true),
    (gen_random_uuid(), gen_random_uuid(), false)
  RETURNING id, analytics_consent
)
INSERT INTO public.visitor_events (session_id, event_name)
SELECT id, 'booking_started' FROM sessions;

SELECT ok(
  (public.get_visitor_analytics_overview(now() - interval '1 day')->>'events')::integer = 1
  AND (public.get_visitor_analytics_overview(now() - interval '1 day')->'bookingFunnel'->>'started')::integer = 1,
  'visitor event and funnel metrics exclude sessions whose analytics consent is withdrawn'
);

-- Withdrawal deletes the session and cascades its events while preserving the
-- minimal consent evidence with its optional session/visitor references cleared.
WITH withdrawn AS (
  INSERT INTO public.visitor_sessions (id, visitor_id, analytics_consent)
  VALUES (gen_random_uuid(), gen_random_uuid(), true)
  RETURNING id, visitor_id
), event_row AS (
  INSERT INTO public.visitor_events (session_id, event_name)
  SELECT id, 'page_view' FROM withdrawn
  RETURNING session_id
)
INSERT INTO public.visitor_consent_records
  (visitor_session_id, visitor_id, necessary, analytics, marketing, consent_version, consent_source)
SELECT id, visitor_id, true, true, false, '2', 'privacy_settings' FROM withdrawn;

SELECT set_config(
  'pgtap.withdrawn_session_id',
  (SELECT visitor_session_id::text FROM public.visitor_consent_records
   WHERE consent_source = 'privacy_settings' ORDER BY recorded_at DESC LIMIT 1),
  TRUE
);

DELETE FROM public.visitor_sessions
WHERE id = current_setting('pgtap.withdrawn_session_id')::uuid;

SELECT ok(
  NOT EXISTS (SELECT 1 FROM public.visitor_events WHERE session_id = current_setting('pgtap.withdrawn_session_id')::uuid)
  AND EXISTS (SELECT 1 FROM public.visitor_consent_records
              WHERE visitor_session_id IS NULL AND consent_source = 'privacy_settings'
                AND analytics = true),
  'withdrawal removes session events but retains consent evidence without visitor/session identifiers'
);

SELECT * FROM finish();
ROLLBACK;
