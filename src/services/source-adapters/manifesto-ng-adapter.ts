// Manifesto.NG Adapter - Primary source for candidate manifestos
// Maps manifestos by normalized name + party + office matching

import { BaseSourceAdapter, RawManifesto, ManifestoSection } from './base-adapter';
import { supabase } from '@/integrations/supabase/client';

export class ManifestoNGAdapter extends BaseSourceAdapter {
  private baseUrl = 'https://manifesto.ng/api';
  
  constructor() {
    super('MANIFESTO_NG', 2); // High priority for manifesto content
  }

  async fetchCandidates(): Promise<never[]> {
    // Manifesto.NG doesn't provide candidate lists, only manifestos
    return [];
  }

  async fetchManifestos(): Promise<RawManifesto[]> {
    this.log('Fetching manifestos from Manifesto.NG');
    
    try {
      // Mock implementation - in real scenario would fetch from Manifesto.NG API
      const mockManifestos: RawManifesto[] = [
        {
          candidate_name: 'Bola Ahmed Tinubu',
          party: 'All Progressives Congress',
          office: 'President',
          raw_text: `ECONOMY: Implement comprehensive tax reforms to boost revenue generation and reduce dependency on oil. Promote diversification through agriculture, technology, and manufacturing sectors. Create special economic zones to attract foreign investment.

EDUCATION: Increase education budget allocation to 20% of national budget. Establish technical and vocational training centers across all states. Provide free quality education from primary to secondary level.

HEALTH: Build world-class medical facilities in each geopolitical zone. Implement universal health coverage for all Nigerians. Strengthen primary healthcare delivery system.

SECURITY: Modernize military equipment and intelligence gathering. Establish community policing initiatives. Address root causes of insecurity through youth employment programs.

INFRASTRUCTURE: Complete all ongoing federal road projects within two years. Expand railway network to connect all state capitals. Improve power generation to 25,000 megawatts.

GOVERNANCE: Implement electronic governance systems to reduce corruption. Strengthen institutions for transparency and accountability. Devolve more powers to state governments.`,
          source_url: 'https://manifesto.ng/tinubu-2023',
          published_at: new Date('2022-12-01')
        },
        {
          candidate_name: 'Peter Gregory Obi',
          party: 'Labour Party', 
          office: 'President',
          raw_text: `ECONOMY: Transition from consumption to production economy. Support small and medium enterprises with accessible credit facilities. Implement fiscal responsibility and transparent budget processes.

EDUCATION: Declare education emergency to address out-of-school children crisis. Increase teachers' salaries and provide continuous training. Establish scholarship programs for science and technology students.

HEALTH: Revamp healthcare system with focus on preventive medicine. Train and retain medical professionals through competitive compensation. Establish health insurance scheme covering all citizens.

SECURITY: Address unemployment as root cause of insecurity. Strengthen border security and intelligence coordination. Invest in modern security equipment and personnel welfare.

INFRASTRUCTURE: Partner with private sector for infrastructure development. Prioritize rural infrastructure to reduce urban migration. Develop integrated transport system connecting all regions.

GOVERNANCE: Institute merit-based appointments in public service. Implement strong anti-corruption measures with severe penalties. Promote unity and inclusiveness in government.`,
          source_url: 'https://manifesto.ng/obi-2023',
          published_at: new Date('2022-11-15')
        }
      ];

      return mockManifestos.filter(manifesto => this.validateManifesto(manifesto));
    } catch (error) {
      this.log('Error fetching manifestos:', error);
      return [];
    }
  }

  async syncManifestos(): Promise<{ created: number; updated: number; errors: string[] }> {
    const manifestos = await this.fetchManifestos();
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const manifesto of manifestos) {
      try {
        // Find matching candidate by normalized name + party + office
        const normalizedName = this.normalizeFullName(manifesto.candidate_name);
        const partyCode = this.normalizePartyCode(manifesto.party);
        
        const { data: candidate } = await this.supabase
          .from('candidates')
          .select('id')
          .eq('normalized_name', normalizedName)
          .eq('party_code', partyCode)
          .eq('office', manifesto.office)
          .single();

        if (!candidate) {
          // Create pending candidate if no match found
          const { data: newCandidate } = await this.supabase
            .from('candidates')
            .insert({
              name: manifesto.candidate_name,
              normalized_name: normalizedName,
              party: manifesto.party,
              party_code: partyCode,
              office: manifesto.office,
              bio_source: 'MANIFESTO_NG',
              pending_verification: true // Flag as needing INEC verification
            })
            .select('id')
            .single();

          if (!newCandidate) {
            throw new Error('Failed to create candidate');
          }
        }

        const candidateId = candidate?.id || (await this.supabase
          .from('candidates')
          .select('id')
          .eq('normalized_name', normalizedName)
          .eq('party_code', partyCode)
          .single()).data?.id;

        if (!candidateId) {
          throw new Error('Could not resolve candidate ID');
        }

        // Parse manifesto into structured sections
        const sections = this.parseManifestoSections(manifesto.raw_text);
        const checksum = this.generateChecksum(manifesto.raw_text);

        // Check if manifesto with same checksum already exists
        const { data: existingManifesto } = await this.supabase
          .from('manifestos')
          .select('id')
          .eq('candidate_id', candidateId)
          .eq('checksum', checksum)
          .single();

        const manifestoData = {
          candidate_id: candidateId,
          party_code: partyCode,
          source: 'MANIFESTO_NG',
          source_url: manifesto.source_url,
          version_label: `Manifesto.NG ${new Date().getFullYear()}`,
          raw_text: manifesto.raw_text,
          sections: JSON.stringify(sections),
          checksum: checksum,
          published_at: manifesto.published_at?.toISOString()
        };

        if (existingManifesto) {
          // Update if newer version
          const { error } = await this.supabase
            .from('manifestos')
            .update(manifestoData)
            .eq('id', existingManifesto.id);

          if (error) throw error;
          updated++;
        } else {
          // Create new manifesto
          const { error } = await this.supabase
            .from('manifestos')
            .insert(manifestoData);

          if (error) throw error;
          created++;
        }

      } catch (error) {
        const errorMsg = `Failed to sync manifesto for ${manifesto.candidate_name}: ${error}`;
        this.log(errorMsg);
        errors.push(errorMsg);
      }
    }

    this.log(`Manifesto.NG sync completed: ${created} created, ${updated} updated, ${errors.length} errors`);
    return { created, updated, errors };
  }

  private get supabase() {
    // Use the already imported supabase client
    return supabase;
  }
}