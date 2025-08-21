-- Enable pg_cron extension for scheduled functions
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule INEC data sync every 6 hours
SELECT cron.schedule(
  'sync-inec-timetables', 
  '0 */6 * * *', 
  $$
    SELECT net.http_post(
      url:='https://cjyjfxeeyumstsfsknyb.supabase.co/functions/v1/sync-inec-data',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"}'::jsonb,
      body:='{"sync_type": "elections"}'::jsonb
    );
  $$
);

-- Schedule news sync every 30 minutes  
SELECT cron.schedule(
  'sync-news',
  '*/30 * * * *',
  $$
    SELECT net.http_post(
      url:='https://cjyjfxeeyumstsfsknyb.supabase.co/functions/v1/sync-news',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"}'::jsonb
    );
  $$
);

-- Schedule fact-check sync every 30 minutes
SELECT cron.schedule(
  'sync-fact-checks',
  '*/30 * * * *', 
  $$
    SELECT net.http_post(
      url:='https://cjyjfxeeyumstsfsknyb.supabase.co/functions/v1/sync-fact-checks',
      headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"}'::jsonb
    );
  $$
);