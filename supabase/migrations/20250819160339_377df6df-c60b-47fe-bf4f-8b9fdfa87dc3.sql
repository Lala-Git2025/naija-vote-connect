-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums for elections
CREATE TYPE election_type AS ENUM ('presidential', 'gubernatorial', 'senatorial', 'house_of_representatives', 'state_assembly', 'local_government', 'councilor');
CREATE TYPE election_status AS ENUM ('upcoming', 'ongoing', 'completed', 'cancelled', 'postponed');
CREATE TYPE candidate_status AS ENUM ('active', 'withdrawn', 'disqualified', 'deceased');
CREATE TYPE result_status AS ENUM ('pending', 'collated', 'disputed', 'final');
CREATE TYPE sync_status AS ENUM ('pending', 'running', 'completed', 'failed');
CREATE TYPE provider_name AS ENUM ('inec_api', 'manual_import', 'civic_feeds', 'fact_check');

-- Elections table
CREATE TABLE public.elections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type election_type NOT NULL,
    election_date DATE NOT NULL,
    status election_status NOT NULL DEFAULT 'upcoming',
    description TEXT,
    states TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Races table (specific contests within elections)
CREATE TABLE public.races (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type election_type NOT NULL,
    state TEXT,
    lga TEXT,
    ward TEXT,
    constituency TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Candidates table
CREATE TABLE public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES public.races(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    party TEXT NOT NULL,
    age INTEGER,
    occupation TEXT,
    education TEXT,
    experience TEXT,
    manifesto TEXT,
    avatar_url TEXT,
    status candidate_status NOT NULL DEFAULT 'active',
    inec_candidate_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Deadlines table
CREATE TABLE public.deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    election_id UUID REFERENCES public.elections(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    deadline_date TIMESTAMP WITH TIME ZONE NOT NULL,
    type TEXT NOT NULL, -- 'registration', 'campaign_start', 'campaign_end', 'election_day'
    priority TEXT DEFAULT 'medium', -- 'high', 'medium', 'low'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Polling units table
CREATE TABLE public.polling_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    state TEXT NOT NULL,
    lga TEXT NOT NULL,
    ward TEXT NOT NULL,
    address TEXT,
    latitude DECIMAL,
    longitude DECIMAL,
    registered_voters INTEGER DEFAULT 0,
    inec_pu_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Results table
CREATE TABLE public.results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    race_id UUID REFERENCES public.races(id) ON DELETE CASCADE,
    polling_unit_id UUID REFERENCES public.polling_units(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    votes INTEGER NOT NULL DEFAULT 0,
    status result_status NOT NULL DEFAULT 'pending',
    collated_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(race_id, polling_unit_id, candidate_id)
);

-- Sync runs table for tracking data synchronization
CREATE TABLE public.sync_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider provider_name NOT NULL,
    sync_type TEXT NOT NULL, -- 'elections', 'candidates', 'news', 'fact_checks'
    status sync_status NOT NULL DEFAULT 'pending',
    started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    completed_at TIMESTAMP WITH TIME ZONE,
    records_processed INTEGER DEFAULT 0,
    records_created INTEGER DEFAULT 0,
    records_updated INTEGER DEFAULT 0,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- News table for civic feeds
CREATE TABLE public.news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT,
    summary TEXT,
    source_name TEXT NOT NULL,
    source_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Fact checks table
CREATE TABLE public.fact_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE SET NULL,
    claim TEXT NOT NULL,
    verdict TEXT NOT NULL, -- 'true', 'false', 'partly-true', 'misleading', 'unverified'
    explanation TEXT,
    source_name TEXT NOT NULL,
    source_url TEXT,
    topic TEXT,
    confidence_score DECIMAL(3,2) DEFAULT 0.5,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.races ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.polling_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sync_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fact_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies - Allow read access to all authenticated users for public election data
CREATE POLICY "Public election data is viewable by everyone" ON public.elections FOR SELECT USING (true);
CREATE POLICY "Public race data is viewable by everyone" ON public.races FOR SELECT USING (true);
CREATE POLICY "Public candidate data is viewable by everyone" ON public.candidates FOR SELECT USING (true);
CREATE POLICY "Public deadline data is viewable by everyone" ON public.deadlines FOR SELECT USING (true);
CREATE POLICY "Public polling unit data is viewable by everyone" ON public.polling_units FOR SELECT USING (true);
CREATE POLICY "Public result data is viewable by everyone" ON public.results FOR SELECT USING (true);
CREATE POLICY "Public news data is viewable by everyone" ON public.news FOR SELECT USING (true);
CREATE POLICY "Public fact check data is viewable by everyone" ON public.fact_checks FOR SELECT USING (true);

-- Admin policies for sync_runs (only admins can view sync logs)
CREATE POLICY "Only service role can manage sync runs" ON public.sync_runs FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for performance
CREATE INDEX idx_elections_date ON public.elections(election_date);
CREATE INDEX idx_elections_status ON public.elections(status);
CREATE INDEX idx_races_election_id ON public.races(election_id);
CREATE INDEX idx_races_location ON public.races(state, lga, ward);
CREATE INDEX idx_candidates_race_id ON public.candidates(race_id);
CREATE INDEX idx_candidates_party ON public.candidates(party);
CREATE INDEX idx_deadlines_election_id ON public.deadlines(election_id);
CREATE INDEX idx_deadlines_date ON public.deadlines(deadline_date);
CREATE INDEX idx_polling_units_location ON public.polling_units(state, lga, ward);
CREATE INDEX idx_polling_units_code ON public.polling_units(code);
CREATE INDEX idx_results_race_id ON public.results(race_id);
CREATE INDEX idx_results_polling_unit_id ON public.results(polling_unit_id);
CREATE INDEX idx_sync_runs_provider ON public.sync_runs(provider);
CREATE INDEX idx_sync_runs_status ON public.sync_runs(status);
CREATE INDEX idx_news_published_at ON public.news(published_at);
CREATE INDEX idx_fact_checks_candidate_id ON public.fact_checks(candidate_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_elections_updated_at BEFORE UPDATE ON public.elections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_races_updated_at BEFORE UPDATE ON public.races FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_candidates_updated_at BEFORE UPDATE ON public.candidates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_deadlines_updated_at BEFORE UPDATE ON public.deadlines FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_polling_units_updated_at BEFORE UPDATE ON public.polling_units FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON public.results FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_news_updated_at BEFORE UPDATE ON public.news FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fact_checks_updated_at BEFORE UPDATE ON public.fact_checks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();