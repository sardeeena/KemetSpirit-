BEGIN;
SELECT plan(10);

SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitor_sessions' AND column_name='city'),
  'visitor sessions store approximate city'
);
SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitor_sessions' AND column_name='country_name'),
  'visitor sessions store country name'
);
SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitor_sessions' AND column_name='region_name'),
  'visitor sessions store region name'
);
SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitor_sessions' AND column_name='locale'),
  'visitor sessions store browser locale'
);
SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitor_sessions' AND column_name='language_preferences'),
  'visitor sessions store preferred language list'
);
SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitor_sessions' AND column_name='platform_family'),
  'visitor sessions store platform family'
);
SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitor_sessions' AND column_name='is_mobile'),
  'visitor sessions store mobile classification'
);
SELECT ok(
  EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='visitor_sessions' AND column_name='viewport_bucket'),
  'visitor sessions store viewport category'
);
SELECT ok(
  EXISTS (SELECT 1 FROM pg_indexes WHERE schemaname='public' AND tablename='visitor_sessions' AND indexname='idx_visitor_sessions_country_started'),
  'visitor country/time index exists'
);

SELECT ok(
  (SELECT count(*) = 5 FROM pg_constraint
   WHERE conrelid = 'public.visitor_sessions'::regclass
     AND conname IN (
       'visitor_sessions_location_source_check',
       'visitor_sessions_language_preferences_limit_check',
       'visitor_sessions_locale_format_check',
       'visitor_sessions_viewport_bucket_check',
       'visitor_sessions_platform_family_check'
     )),
  'all five visitor metadata constraints are attached to visitor_sessions'
);

SELECT * FROM finish();
ROLLBACK;
