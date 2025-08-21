-- Fix constraint issues for upserts by adding unique constraints where missing

-- Add unique constraint for elections name for upsert conflicts
ALTER TABLE public.elections 
ADD CONSTRAINT elections_name_unique UNIQUE (name);

-- Add unique constraint for deadlines title for upsert conflicts
ALTER TABLE public.deadlines 
ADD CONSTRAINT deadlines_title_unique UNIQUE (title);

-- Add unique constraint for news title+source combination
ALTER TABLE public.news 
ADD CONSTRAINT news_title_source_unique UNIQUE (title, source_name);

-- Add unique constraint for fact_checks claim+source combination  
ALTER TABLE public.fact_checks 
ADD CONSTRAINT fact_checks_claim_source_unique UNIQUE (claim, source_name);

-- Add unique constraint for candidates INEC ID
ALTER TABLE public.candidates 
ADD CONSTRAINT candidates_inec_id_unique UNIQUE (inec_candidate_id);

-- Add unique constraint for polling_units code
ALTER TABLE public.polling_units 
ADD CONSTRAINT polling_units_code_unique UNIQUE (code);