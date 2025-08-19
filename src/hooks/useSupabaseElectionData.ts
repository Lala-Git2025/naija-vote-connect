import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Election, Race, Candidate, Deadline, PollingUnit, NewsItem, FactCheck } from '@/types/election';

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
        type: election.type,
        date: election.election_date,
        status: election.status,
        description: election.description || '',
        location: {
          state: election.states?.[0] || '',
          lga: '',
          ward: ''
        },
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
        type: race.type,
        location: {
          state: race.state || '',
          lga: race.lga || '',
          ward: race.ward || ''
        },
        constituency: race.constituency || '',
        description: race.description || ''
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
        raceId: candidate.race_id,
        name: candidate.name,
        party: candidate.party,
        age: candidate.age,
        occupation: candidate.occupation || '',
        education: candidate.education || '',
        experience: candidate.experience || '',
        manifesto: candidate.manifesto || '',
        avatarUrl: candidate.avatar_url || '',
        status: candidate.status
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
        electionId: deadline.election_id,
        title: deadline.title,
        description: deadline.description || '',
        date: deadline.deadline_date,
        type: deadline.type,
        priority: deadline.priority || 'medium'
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
        location: {
          state: pu.state,
          lga: pu.lga,
          ward: pu.ward
        },
        address: pu.address || '',
        coordinates: pu.latitude && pu.longitude ? {
          lat: parseFloat(pu.latitude),
          lng: parseFloat(pu.longitude)
        } : undefined,
        registeredVoters: pu.registered_voters || 0,
        inecId: pu.inec_pu_id || ''
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
        content: news.content || '',
        summary: news.summary || '',
        source: news.source_name,
        sourceUrl: news.source_url || '',
        publishedAt: news.published_at || '',
        category: news.category || 'general',
        tags: news.tags || [],
        verified: news.is_verified || false
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
        candidateId: factCheck.candidate_id,
        claim: factCheck.claim,
        verdict: factCheck.verdict,
        explanation: factCheck.explanation || '',
        source: factCheck.source_name,
        sourceUrl: factCheck.source_url || '',
        topic: factCheck.topic || '',
        confidenceScore: factCheck.confidence_score || 0.5,
        publishedAt: factCheck.published_at || ''
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