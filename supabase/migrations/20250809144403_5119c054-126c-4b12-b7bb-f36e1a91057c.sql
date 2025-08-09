-- Enable required extensions
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- Unschedule existing job if present, then (re)schedule
DO $$
BEGIN
  PERFORM cron.unschedule('escalate-tickets-every-5-minutes');
EXCEPTION WHEN others THEN
  NULL;
END$$;

select cron.schedule(
  'escalate-tickets-every-5-minutes',
  '*/5 * * * *',
  $$
  select net.http_post(
    url:='https://mvndmnkgtoygsvesktgw.supabase.co/functions/v1/escalate-tickets',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{}'::jsonb
  );
  $$
);