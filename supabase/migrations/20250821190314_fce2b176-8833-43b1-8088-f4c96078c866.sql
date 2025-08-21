-- Enable pgvector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create parties table
CREATE TABLE IF NOT EXISTS public.parties (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manifestos table
CREATE TABLE IF NOT EXISTS public.manifestos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    candidate_id UUID REFERENCES public.candidates(id),
    party_code TEXT REFERENCES public.parties(code),
    source TEXT NOT NULL,
    source_url TEXT,
    version_label TEXT,
    raw_text TEXT,
    sections JSONB DEFAULT '[]'::jsonb,
    checksum TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    embedding vector(1536) -- OpenAI ada-002 dimension
);

-- Update candidates table to match new schema
ALTER TABLE public.candidates 
ADD COLUMN IF NOT EXISTS external_id_inec TEXT,
ADD COLUMN IF NOT EXISTS normalized_name TEXT,
ADD COLUMN IF NOT EXISTS party_code TEXT,
ADD COLUMN IF NOT EXISTS office TEXT,
ADD COLUMN IF NOT EXISTS constituency TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS election_date DATE,
ADD COLUMN IF NOT EXISTS bio_source TEXT,
ADD COLUMN IF NOT EXISTS pending_verification BOOLEAN DEFAULT false;

-- Update fact_checks table
ALTER TABLE public.fact_checks 
ADD COLUMN IF NOT EXISTS rating TEXT CHECK (rating IN ('Verified', 'Under Review', 'False', 'Misleading')),
ADD COLUMN IF NOT EXISTS subjects JSONB DEFAULT '{}'::jsonb;

-- Update news table
ALTER TABLE public.news 
ADD COLUMN IF NOT EXISTS summary TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_candidates_external_id_inec ON public.candidates(external_id_inec);
CREATE INDEX IF NOT EXISTS idx_candidates_normalized_name ON public.candidates(normalized_name);
CREATE INDEX IF NOT EXISTS idx_candidates_party_code ON public.candidates(party_code);
CREATE INDEX IF NOT EXISTS idx_manifestos_candidate_id ON public.manifestos(candidate_id);
CREATE INDEX IF NOT EXISTS idx_manifestos_party_code ON public.manifestos(party_code);
CREATE INDEX IF NOT EXISTS idx_manifestos_checksum ON public.manifestos(checksum);
CREATE INDEX IF NOT EXISTS idx_fact_checks_subjects ON public.fact_checks USING GIN(subjects);
CREATE INDEX IF NOT EXISTS idx_news_tags ON public.news USING GIN(tags);

-- Vector similarity search index
CREATE INDEX IF NOT EXISTS idx_manifestos_embedding ON public.manifestos USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Enable RLS on new tables
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manifestos ENABLE ROW LEVEL SECURITY;

-- Insert common Nigerian political parties
INSERT INTO public.parties (code, name) VALUES
('APC', 'All Progressives Congress'),
('PDP', 'Peoples Democratic Party'),
('LP', 'Labour Party'),
('NNPP', 'New Nigeria Peoples Party'),
('APGA', 'All Progressives Grand Alliance'),
('YPP', 'Young Progressives Party'),
('SDP', 'Social Democratic Party'),
('ADC', 'African Democratic Congress'),
('AA', 'Action Alliance'),
('ACCORD', 'Accord Party')
ON CONFLICT (code) DO NOTHING;

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_parties_updated_at ON public.parties;
CREATE TRIGGER update_parties_updated_at
    BEFORE UPDATE ON public.parties
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_manifestos_updated_at ON public.manifestos;
CREATE TRIGGER update_manifestos_updated_at
    BEFORE UPDATE ON public.manifestos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for candidate normalization
CREATE OR REPLACE FUNCTION public.normalize_candidate_name(full_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN UPPER(TRIM(REGEXP_REPLACE(full_name, '[^\w\s]', '', 'g')));
END;
$$ LANGUAGE plpgsql IMMUTABLE;