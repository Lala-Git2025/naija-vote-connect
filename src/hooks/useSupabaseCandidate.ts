import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Candidate {
  id: string;
  name: string;
  party: string;
  office?: string;
  age?: number;
  education?: string;
  experience?: string;
  occupation?: string;
  manifesto?: string;
  avatar_url?: string;
  state?: string;
  constituency?: string;
  bio_source?: string;
  normalized_name?: string;
  party_code?: string;
  external_id_inec?: string;
  election_date?: string;
  pending_verification?: boolean;
  status?: string;
  created_at?: string;
  updated_at?: string;
  race_id?: string;
  inec_candidate_id?: string;
  races?: Race;
  manifestos?: Manifesto[];
  fact_checks?: FactCheck[];
}

export interface Race {
  id: string;
  name: string;
  type: string;
  state?: string;
  constituency?: string;
  election_id?: string;
}

export interface Manifesto {
  id: string;
  candidate_id: string;
  party_code?: string;
  source: string;
  source_url?: string;
  raw_text?: string;
  sections?: any;
  published_at?: string;
}

export interface FactCheck {
  id: string;
  claim: string;
  verdict: string;
  rating?: string;
  explanation?: string;
  source_name: string;
  source_url?: string;
  published_at?: string;
  subjects?: any;
}

export const useSupabaseCandidate = (id?: string) => {
  return useQuery({
    queryKey: ['candidate', id],
    queryFn: async (): Promise<Candidate | null> => {
      if (!id) return null;
      
      const { data: candidate, error } = await supabase
        .from('candidates')
        .select(`
          *,
          races!candidates_race_id_fkey (
            id,
            name,
            type,
            state,
            constituency,
            election_id
          ),
          manifestos (
            id,
            candidate_id,
            party_code,
            source,
            source_url,
            raw_text,
            sections,
            published_at
          ),
          fact_checks (
            id,
            claim,
            verdict,
            rating,
            explanation,
            source_name,
            source_url,
            published_at,
            subjects
          )
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching candidate:', error);
        throw error;
      }

      return candidate;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
  });
};