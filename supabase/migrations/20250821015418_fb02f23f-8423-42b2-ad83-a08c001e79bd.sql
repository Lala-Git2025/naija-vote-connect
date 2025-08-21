-- Trigger the sync functions to populate sample data
-- First run elections sync to create elections, races, and deadlines
SELECT net.http_post(
  url := 'https://cjyjfxeeyumstsfsknyb.supabase.co/functions/v1/sync-inec-data',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"}'::jsonb,
  body := '{"sync_type": "elections"}'::jsonb
) as election_sync_result;

-- Wait and then sync candidates
SELECT net.http_post(
  url := 'https://cjyjfxeeyumstsfsknyb.supabase.co/functions/v1/sync-inec-data',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"}'::jsonb,
  body := '{"sync_type": "candidates"}'::jsonb
) as candidate_sync_result;

-- Sync polling units
SELECT net.http_post(
  url := 'https://cjyjfxeeyumstsfsknyb.supabase.co/functions/v1/sync-inec-data',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"}'::jsonb,
  body := '{"sync_type": "polling_units"}'::jsonb
) as polling_sync_result;

-- Sync news
SELECT net.http_post(
  url := 'https://cjyjfxeeyumstsfsknyb.supabase.co/functions/v1/sync-news',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"}'::jsonb,
  body := '{}'::jsonb
) as news_sync_result;

-- Sync fact-checks
SELECT net.http_post(
  url := 'https://cjyjfxeeyumstsfsknyb.supabase.co/functions/v1/sync-fact-checks',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424"}'::jsonb,
  body := '{}'::jsonb
) as fact_check_sync_result;