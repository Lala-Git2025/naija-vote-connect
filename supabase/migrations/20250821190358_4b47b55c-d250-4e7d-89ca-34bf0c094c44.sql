-- Fix function security by setting search_path
CREATE OR REPLACE FUNCTION public.normalize_candidate_name(full_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(TRIM(REGEXP_REPLACE(full_name, '[^\w\s]', '', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE SECURITY DEFINER SET search_path = public;

-- Move vector extension to extensions schema if possible
-- Note: This may require superuser privileges, but we'll try
DROP EXTENSION IF EXISTS vector;
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;

-- If that fails, we'll keep it in public but document it
DO $$
BEGIN
    -- Try to create in extensions schema
    CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
EXCEPTION 
    WHEN OTHERS THEN
        -- Fall back to public schema
        CREATE EXTENSION IF NOT EXISTS vector;
END
$$;