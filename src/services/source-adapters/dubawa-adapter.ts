// Dubawa Fact-Check Adapter - Source for fact-checking information
// Never modifies candidate/manifesto data, only creates linked fact-checks

import { BaseSourceAdapter, RawFactCheck } from './base-adapter';

export class DubawaAdapter extends BaseSourceAdapter {
  private rssUrl = 'https://dubawa.org/feed/';
  
  constructor() {
    super('DUBAWA_FACTCHECK', 3); // Lower priority, annotation only
  }

  async fetchCandidates(): Promise<never[]> {
    // Dubawa doesn't provide candidate lists
    return [];
  }

  async fetchManifestos(): Promise<never[]> {
    // Dubawa doesn't provide manifestos  
    return [];
  }

  async fetchFactChecks(): Promise<RawFactCheck[]> {
    this.log('Fetching fact-checks from Dubawa RSS feed');
    
    try {
      // Mock implementation - in real scenario would parse RSS feed
      const mockFactChecks: RawFactCheck[] = [
        {
          headline: 'Claim: Nigeria produces 2.5 million barrels of oil daily',
          claim: 'Nigeria currently produces 2.5 million barrels of oil per day according to presidential candidate',
          rating: 'Misleading',
          source_url: 'https://dubawa.org/factcheck-oil-production-2023',
          published_at: new Date('2023-01-15'),
          subjects: {
            candidate_name: 'Bola Ahmed Tinubu',
            party_code: 'APC'
          }
        },
        {
          headline: 'Claim: 20 million children are out of school in Nigeria',
          claim: 'Presidential candidate states that 20 million Nigerian children are currently out of school',
          rating: 'Verified',
          source_url: 'https://dubawa.org/factcheck-education-statistics-2023',
          published_at: new Date('2023-01-20'),
          subjects: {
            candidate_name: 'Peter Gregory Obi',
            party_code: 'LP'
          }
        },
        {
          headline: 'Claim: Unemployment rate stands at 33.3%',
          claim: 'Nigeria unemployment rate is currently at 33.3% according to campaign statement',
          rating: 'Under Review',
          source_url: 'https://dubawa.org/factcheck-unemployment-2023',
          published_at: new Date('2023-01-25'),
          subjects: {
            candidate_name: 'Atiku Abubakar',
            party_code: 'PDP'
          }
        },
        {
          headline: 'Claim: Lagos generated ₦651bn internally in 2022',
          claim: 'Former Lagos governor claims state generated ₦651 billion in internal revenue in 2022',
          rating: 'Verified',
          source_url: 'https://dubawa.org/factcheck-lagos-revenue-2023',
          published_at: new Date('2023-02-01'),
          subjects: {
            candidate_name: 'Bola Ahmed Tinubu',
            party_code: 'APC'
          }
        }
      ];

      return mockFactChecks.filter(factCheck => this.validateFactCheck(factCheck));
    } catch (error) {
      this.log('Error fetching fact-checks:', error);
      return [];
    }
  }

  async syncFactChecks(): Promise<{ created: number; updated: number; errors: string[] }> {
    const factChecks = await this.fetchFactChecks();
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const factCheck of factChecks) {
      try {
        // Try to link fact-check to candidate if subjects contain candidate info
        let candidateId: string | null = null;
        
        if (factCheck.subjects?.candidate_name && factCheck.subjects?.party_code) {
          const normalizedName = this.normalizeFullName(factCheck.subjects.candidate_name);
          
          const { data: candidate } = await this.supabase
            .from('candidates')
            .select('id')
            .or(`normalized_name.eq.${normalizedName},external_id_inec.eq.${factCheck.subjects.candidate_name}`)
            .eq('party_code', factCheck.subjects.party_code)
            .single();
            
          candidateId = candidate?.id || null;
        }

        // Check if fact-check already exists by source URL
        const { data: existingFactCheck } = await this.supabase
          .from('fact_checks')
          .select('id')
          .eq('source_url', factCheck.source_url)
          .single();

        const factCheckData = {
          claim: factCheck.claim,
          verdict: factCheck.rating,
          rating: factCheck.rating, // Map to both fields for compatibility
          source_name: 'Dubawa',
          source_url: factCheck.source_url,
          candidate_id: candidateId,
          subjects: factCheck.subjects || {},
          published_at: factCheck.published_at?.toISOString(),
          explanation: `Fact-check by Dubawa: ${factCheck.headline}`
        };

        if (existingFactCheck) {
          // Update existing fact-check
          const { error } = await this.supabase
            .from('fact_checks')
            .update(factCheckData)
            .eq('id', existingFactCheck.id);

          if (error) throw error;
          updated++;
        } else {
          // Create new fact-check
          const { error } = await this.supabase
            .from('fact_checks')
            .insert(factCheckData);

          if (error) throw error;
          created++;
        }

      } catch (error) {
        const errorMsg = `Failed to sync fact-check ${factCheck.headline}: ${error}`;
        this.log(errorMsg);
        errors.push(errorMsg);
      }
    }

    this.log(`Dubawa sync completed: ${created} created, ${updated} updated, ${errors.length} errors`);
    return { created, updated, errors };
  }

  private get supabase() {
    const { supabase } = require('@/integrations/supabase/client');
    return supabase;
  }
}