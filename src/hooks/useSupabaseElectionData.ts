import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Election, Race, Candidate, Deadline, PollingUnit, NewsItem, FactCheck } from '@/types/election';

// Type mapping functions to convert database types to frontend types
const mapElectionType = (dbType: string): Election['type'] => {
  const mapping: Record<string, Election['type']> = {
    'presidential': 'Presidential',
    'gubernatorial': 'Gubernatorial', 
    'senatorial': 'Senate',
    'house_of_representatives': 'House of Assembly',
    'state_assembly': 'House of Assembly',
    'local_government': 'Local Government',
    'councilor': 'Local Government'
  };
  return mapping[dbType] || 'Presidential';
};

const mapElectionStatus = (dbStatus: string): Election['status'] => {
  const mapping: Record<string, Election['status']> = {
    'upcoming': 'upcoming',
    'ongoing': 'ongoing', 
    'completed': 'completed',
    'cancelled': 'postponed',
    'postponed': 'postponed'
  };
  return mapping[dbStatus] || 'upcoming';
};

const mapFactCheckVerdict = (dbVerdict: string): FactCheck['verdict'] => {
  const mapping: Record<string, FactCheck['verdict']> = {
    'true': 'True',
    'mostly-true': 'Mostly True',
    'partly-true': 'Half True',
    'misleading': 'Mostly False',
    'false': 'False',
    'unverified': 'Unverified'
  };
  return mapping[dbVerdict] || 'Unverified';
};

export const SUPABASE_QUERY_KEYS = {
  ELECTIONS: 'supabase-elections',
  RACES: 'supabase-races', 
  CANDIDATES: 'supabase-candidates',
  DEADLINES: 'supabase-deadlines',
  POLLING_UNITS: 'supabase-polling-units',
  NEWS: 'supabase-news',
  FACT_CHECKS: 'supabase-fact-checks',
};

// Elections
export function useSupabaseElections() {
  return useQuery({
    queryKey: [SUPABASE_QUERY_KEYS.ELECTIONS],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('election_date', { ascending: false });

      if (error) throw error;

      return data.map(election => ({
        id: election.id,
        name: election.name,
        type: mapElectionType(election.type),
        date: election.election_date,
        status: mapElectionStatus(election.status),
        description: election.description || '',
        sourceId: 'supabase',
        createdAt: election.created_at,
        updatedAt: election.updated_at
      })) as Election[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Races
export function useSupabaseRaces(electionId?: string) {
  return useQuery({
    queryKey: [SUPABASE_QUERY_KEYS.RACES, electionId],
    queryFn: async () => {
      let query = supabase
        .from('races')
        .select('*');
      
      if (electionId) {
        query = query.eq('election_id', electionId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(race => ({
        id: race.id,
        electionId: race.election_id,
        name: race.name,
        office: race.name,
        district: race.constituency || race.name,
        state: race.state || '',
        lga: race.lga,
        ward: race.ward,
        candidates: [],
        pollingUnits: [],
        sourceId: 'supabase',
        createdAt: race.created_at,
        updatedAt: race.updated_at
      })) as Race[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Candidates
export function useSupabaseCandidates(raceId?: string) {
  return useQuery({
    queryKey: [SUPABASE_QUERY_KEYS.CANDIDATES, raceId],
    queryFn: async () => {
      let query = supabase
        .from('candidates')
        .select('*');
      
      if (raceId) {
        query = query.eq('race_id', raceId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      return data.map(candidate => ({
        id: candidate.id,
        name: candidate.name,
        party: candidate.party,
        partyAbbreviation: candidate.party,
        photo: candidate.avatar_url,
        biography: candidate.manifesto,
        experience: candidate.experience ? [candidate.experience] : [],
        education: candidate.education ? [candidate.education] : [],
        positions: [],
        endorsements: [],
        funding: [],
        socialMedia: {},
        verified: false,
        inecVerified: true,
        sourceId: 'supabase',
        races: candidate.race_id ? [candidate.race_id] : [],
        createdAt: candidate.created_at,
        updatedAt: candidate.updated_at
      })) as Candidate[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Deadlines
export function useSupabaseDeadlines(electionId?: string) {
  return useQuery({
    queryKey: [SUPABASE_QUERY_KEYS.DEADLINES, electionId],
    queryFn: async () => {
      let query = supabase
        .from('deadlines')
        .select('*');
      
      if (electionId) {
        query = query.eq('election_id', electionId);
      }

      const { data, error } = await query.order('deadline_date', { ascending: true });

      if (error) throw error;

      return data.map(deadline => ({
        id: deadline.id,
        title: deadline.title,
        date: deadline.deadline_date,
        type: deadline.type as Deadline['type'],
        description: deadline.description || '',
        electionId: deadline.election_id,
        importance: deadline.priority as Deadline['importance'],
        notificationSent: false,
        sourceId: 'supabase',
        createdAt: deadline.created_at
      })) as Deadline[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Polling Units
export function useSupabasePollingUnits(state?: string, lga?: string) {
  return useQuery({
    queryKey: [SUPABASE_QUERY_KEYS.POLLING_UNITS, state, lga],
    queryFn: async () => {
      let query = supabase
        .from('polling_units')
        .select('*');
      
      if (state) {
        query = query.eq('state', state);
      }
      
      if (lga) {
        query = query.eq('lga', lga);
      }

      const { data, error } = await query.order('name', { ascending: true });

      if (error) throw error;

      return data.map(pu => ({
        id: pu.id,
        name: pu.name,
        code: pu.code,
        address: pu.address || '',
        ward: pu.ward,
        lga: pu.lga,
        state: pu.state,
        latitude: pu.latitude ? parseFloat(String(pu.latitude)) : undefined,
        longitude: pu.longitude ? parseFloat(String(pu.longitude)) : undefined,
        registeredVoters: pu.registered_voters || 0,
        accessibility: true,
        sourceId: 'supabase',
        createdAt: pu.created_at,
        updatedAt: pu.updated_at
      })) as PollingUnit[];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// News
export function useSupabaseNews(limit: number = 20) {
  return useQuery({
    queryKey: [SUPABASE_QUERY_KEYS.NEWS, limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(news => ({
        id: news.id,
        title: news.title,
        summary: news.summary || '',
        content: news.content || '',
        publishedAt: news.published_at || '',
        url: news.source_url || '',
        category: news.category as NewsItem['category'],
        tags: news.tags || [],
        verified: news.is_verified || false,
        sourceId: 'supabase',
        createdAt: news.created_at,
        updatedAt: news.updated_at
      })) as NewsItem[];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// Fact Checks
export function useSupabaseFactChecks(candidateId?: string, limit: number = 20) {
  return useQuery({
    queryKey: [SUPABASE_QUERY_KEYS.FACT_CHECKS, candidateId, limit],
    queryFn: async () => {
      let query = supabase
        .from('fact_checks')
        .select('*');
      
      if (candidateId) {
        query = query.eq('candidate_id', candidateId);
      }

      const { data, error } = await query
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data.map(factCheck => ({
        id: factCheck.id,
        claim: factCheck.claim,
        verdict: mapFactCheckVerdict(factCheck.verdict),
        explanation: factCheck.explanation || '',
        topic: factCheck.topic || '',
        candidateId: factCheck.candidate_id,
        checkedAt: factCheck.published_at || '',
        sourceUrl: factCheck.source_url || '',
        organization: factCheck.source_name,
        trustScore: factCheck.confidence_score || 0.5,
        tags: [],
        verified: true,
        sourceId: 'supabase',
        createdAt: factCheck.created_at,
        updatedAt: factCheck.updated_at
      })) as FactCheck[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

// Utility hook to invalidate all election data
export function useInvalidateElectionData() {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: [SUPABASE_QUERY_KEYS.ELECTIONS] });
    queryClient.invalidateQueries({ queryKey: [SUPABASE_QUERY_KEYS.RACES] });
    queryClient.invalidateQueries({ queryKey: [SUPABASE_QUERY_KEYS.CANDIDATES] });
    queryClient.invalidateQueries({ queryKey: [SUPABASE_QUERY_KEYS.DEADLINES] });
    queryClient.invalidateQueries({ queryKey: [SUPABASE_QUERY_KEYS.POLLING_UNITS] });
    queryClient.invalidateQueries({ queryKey: [SUPABASE_QUERY_KEYS.NEWS] });
    queryClient.invalidateQueries({ queryKey: [SUPABASE_QUERY_KEYS.FACT_CHECKS] });
  };
}