// INEC Official Adapter - Priority source for candidate identity data
// Maps official INEC candidate lists to standardized format

import { BaseSourceAdapter, RawCandidate } from './base-adapter';

export class INECAdapter extends BaseSourceAdapter {
  private baseUrl = 'https://www.inecnigeria.org';
  
  constructor() {
    super('INEC_OFFICIAL', 1); // Highest priority
  }

  async fetchCandidates(): Promise<RawCandidate[]> {
    this.log('Fetching official INEC candidate data');
    
    try {
      // Mock implementation - in real scenario would fetch from INEC APIs/feeds
      const mockINECData = [
        {
          external_id_inec: 'INEC_001',
          full_name: 'Bola Ahmed Tinubu',
          party: 'All Progressives Congress',
          office: 'President',
          constituency: 'Federal Republic of Nigeria',
          state: 'Federal',
          election_date: '2023-02-25',
          photo_url: 'https://example.com/tinubu.jpg',
          bio: 'Former Lagos State Governor'
        },
        {
          external_id_inec: 'INEC_002', 
          full_name: 'Peter Gregory Obi',
          party: 'Labour Party',
          office: 'President',
          constituency: 'Federal Republic of Nigeria',
          state: 'Federal',
          election_date: '2023-02-25',
          photo_url: 'https://example.com/obi.jpg',
          bio: 'Former Anambra State Governor'
        },
        {
          external_id_inec: 'INEC_003',
          full_name: 'Atiku Abubakar',
          party: 'Peoples Democratic Party', 
          office: 'President',
          constituency: 'Federal Republic of Nigeria',
          state: 'Federal',
          election_date: '2023-02-25',
          photo_url: 'https://example.com/atiku.jpg',
          bio: 'Former Vice President of Nigeria'
        }
      ];

      return mockINECData.filter(candidate => this.validateCandidate(candidate));
    } catch (error) {
      this.log('Error fetching INEC candidates:', error);
      return [];
    }
  }

  async fetchManifestos(): Promise<never[]> {
    // INEC doesn't provide manifestos, only candidate lists
    return [];
  }

  async syncCandidates(): Promise<{ created: number; updated: number; errors: string[] }> {
    const candidates = await this.fetchCandidates();
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const candidate of candidates) {
      try {
        const normalizedName = this.normalizeFullName(candidate.full_name);
        const partyCode = this.normalizePartyCode(candidate.party);

        // INEC data takes precedence - upsert by external_id_inec
        const { data: existingCandidate } = await this.supabase
          .from('candidates')
          .select('id')
          .eq('external_id_inec', candidate.external_id_inec)
          .single();

        const candidateData = {
          external_id_inec: candidate.external_id_inec,
          name: candidate.full_name,
          normalized_name: normalizedName,
          party: candidate.party,
          party_code: partyCode,
          office: candidate.office,
          constituency: candidate.constituency,
          state: candidate.state,
          election_date: candidate.election_date,
          avatar_url: candidate.photo_url,
          bio_source: 'INEC_OFFICIAL',
          pending_verification: false // INEC data is always verified
        };

        if (existingCandidate) {
          // Update existing candidate with INEC data (INEC overrides all)
          const { error } = await this.supabase
            .from('candidates')
            .update(candidateData)
            .eq('id', existingCandidate.id);

          if (error) throw error;
          updated++;
        } else {
          // Create new candidate
          const { error } = await this.supabase
            .from('candidates')
            .insert(candidateData);

          if (error) throw error;
          created++;
        }

      } catch (error) {
        const errorMsg = `Failed to sync candidate ${candidate.full_name}: ${error}`;
        this.log(errorMsg);
        errors.push(errorMsg);
      }
    }

    this.log(`INEC sync completed: ${created} created, ${updated} updated, ${errors.length} errors`);
    return { created, updated, errors };
  }

  private get supabase() {
    // Import here to avoid circular dependencies
    const { supabase } = require('@/integrations/supabase/client');
    return supabase;
  }
}