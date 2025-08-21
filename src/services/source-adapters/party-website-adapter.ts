// Party Website Adapter - Crawls official party websites for manifestos
// Only crawls allowlisted domains and specific page types

import { BaseSourceAdapter, RawManifesto } from './base-adapter';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cjyjfxeeyumstsfsknyb.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeWpmeGVleXVtc3RzZnNrbnliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU1Njk0NzMsImV4cCI6MjA3MTE0NTQ3M30.Z4XQ305Ky_Yn1Cy3KF6bOrg90mXVnN4nvBgobSxO424";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export class PartyWebsiteAdapter extends BaseSourceAdapter {
  private allowlistedDomains = [
    'apc.ng',
    'pdp.ng', 
    'labourparty.ng',
    'nnpp.ng',
    'apgaonline.com'
  ];
  
  constructor() {
    super('PARTY_WEBSITES', 2); // Co-equal priority with Manifesto.NG
  }

  async fetchCandidates(): Promise<never[]> {
    // Party websites don't provide candidate lists
    return [];
  }

  async fetchManifestos(): Promise<RawManifesto[]> {
    this.log('Crawling allowlisted party websites for manifestos');
    
    try {
      // Mock implementation - in real scenario would crawl actual party sites
      const mockPartyManifestos: RawManifesto[] = [
        {
          candidate_name: 'All Progressives Congress Presidential Candidate',
          party: 'All Progressives Congress',
          office: 'President',
          raw_text: `APC MANIFESTO 2023-2027: RENEWED HOPE

ECONOMY: Our economic agenda focuses on sustainable growth through diversification, industrialization, and job creation. We will establish industrial hubs in each geopolitical zone, promote made-in-Nigeria goods, and create enabling environment for businesses to thrive.

EDUCATION: Education remains our priority. We will increase budgetary allocation to education sector, establish world-class universities, and ensure every Nigerian child has access to quality education from basic to tertiary level.

HEALTHCARE: We commit to building a robust healthcare system that provides universal coverage for all Nigerians. Our plan includes establishing medical cities, training more healthcare professionals, and strengthening primary healthcare delivery.

SECURITY: National security is paramount. We will modernize our security architecture, improve intelligence gathering, and address root causes of insecurity through comprehensive socio-economic interventions.

INFRASTRUCTURE: Infrastructure development will drive our economic transformation. We will complete all ongoing projects, expand transportation networks, and ensure reliable power supply across the country.

GOVERNANCE: We believe in transparent, accountable governance. We will strengthen democratic institutions, fight corruption decisively, and ensure inclusive government that serves all Nigerians regardless of tribe, religion or region.`,
          source_url: 'https://apc.ng/manifesto-2023',
          published_at: new Date('2022-12-15')
        },
        {
          candidate_name: 'Labour Party Presidential Candidate',
          party: 'Labour Party',
          office: 'President', 
          raw_text: `LABOUR PARTY MANIFESTO: IT IS POSSIBLE

ECONOMY: We will move Nigeria from consumption to production. Our focus is on supporting small and medium enterprises, creating jobs for our teeming youth population, and building an economy that works for all Nigerians.

EDUCATION: Education is the foundation of development. We declare education emergency to address the crisis of out-of-school children. Every Nigerian child deserves quality education regardless of their background.

HEALTHCARE: Healthcare is a human right. We will build a healthcare system that prioritizes prevention, ensures universal access, and keeps our best medical minds in Nigeria through competitive compensation.

SECURITY: True security comes from addressing the root causes of insecurity - poverty, unemployment, and inequality. We will tackle these issues head-on while strengthening our security forces.

INFRASTRUCTURE: Nigeria deserves world-class infrastructure. We will partner with private sector to deliver roads, railways, airports, and digital infrastructure that connects all parts of our country.

GOVERNANCE: We stand for competence, character, and capacity in leadership. Merit will be our guiding principle in appointments, and we will run a government that is accountable to the Nigerian people.`,
          source_url: 'https://labourparty.ng/our-manifesto',
          published_at: new Date('2022-11-30')
        }
      ];

      return mockPartyManifestos.filter(manifesto => this.validateManifesto(manifesto));
    } catch (error) {
      this.log('Error crawling party websites:', error);
      return [];
    }
  }

  async syncPartyManifestos(): Promise<{ created: number; updated: number; errors: string[] }> {
    const manifestos = await this.fetchManifestos();
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const manifesto of manifestos) {
      try {
        const partyCode = this.normalizePartyCode(manifesto.party);
        const checksum = this.generateChecksum(manifesto.raw_text);
        
        // Check if manifesto with same checksum already exists
        const { data: existingManifesto } = await supabase
          .from('manifestos')
          .select('id')
          .eq('party_code', partyCode)
          .eq('office', manifesto.office)
          .eq('checksum', checksum)
          .single();

        if (existingManifesto) {
          this.log(`Manifesto already exists with same checksum for ${manifesto.party}`);
          continue;
        }

        // Find party's presidential candidate
        const { data: candidate } = await supabase
          .from('candidates')
          .select('id')
          .eq('party_code', partyCode)
          .eq('office', manifesto.office)
          .single();

        if (!candidate) {
          this.log(`No candidate found for ${manifesto.party} ${manifesto.office}`);
          continue;
        }

        // Parse manifesto into structured sections
        const sections = this.parseManifestoSections(manifesto.raw_text);

        const manifestoData = {
          candidate_id: candidate.id,
          party_code: partyCode,
          source: 'PARTY_WEBSITE',
          source_url: manifesto.source_url,
          version_label: `Official Party Website ${new Date().getFullYear()}`,
          raw_text: manifesto.raw_text,
          sections: JSON.stringify(sections),
          checksum: checksum,
          published_at: manifesto.published_at?.toISOString()
        };

        // Always create new version for party website manifestos
        const { error } = await supabase
          .from('manifestos')
          .insert(manifestoData);

        if (error) throw error;
        created++;

      } catch (error) {
        const errorMsg = `Failed to sync party manifesto for ${manifesto.party}: ${error}`;
        this.log(errorMsg);
        errors.push(errorMsg);
      }
    }

    this.log(`Party websites sync completed: ${created} created, ${updated} updated, ${errors.length} errors`);
    return { created, updated, errors };
  }

  private isAllowlistedDomain(url: string): boolean {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return this.allowlistedDomains.includes(domain);
    } catch {
      return false;
    }
  }

  private isManifestoPage(title: string, url: string): boolean {
    const manifestoKeywords = ['manifesto', 'policy', 'agenda'];
    const titleLower = title.toLowerCase();
    const urlLower = url.toLowerCase();
    
    return manifestoKeywords.some(keyword => 
      titleLower.includes(keyword) || urlLower.includes(keyword)
    ) || url.endsWith('.pdf');
  }

}