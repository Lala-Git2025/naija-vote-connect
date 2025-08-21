// Base adapter interface for all data source adapters
// Implements normalization and matching rules with explicit schemas

import { supabase } from '@/integrations/supabase/client';

export interface CandidateMatch {
  external_id_inec?: string;
  normalized_name: string;
  party_code: string;
  office: string;
  constituency: string;
  election_date: string;
}

export interface ManifestoSection {
  heading: string;
  content: string;
  topic: 'economy' | 'education' | 'health' | 'security' | 'infrastructure' | 'governance';
  summary?: string;
}

export interface RawCandidate {
  external_id_inec?: string;
  full_name: string;
  party: string;
  office: string;
  constituency: string;
  state: string;
  election_date: string;
  photo_url?: string;
  bio?: string;
}

export interface RawManifesto {
  candidate_name: string;
  party: string;
  office: string;
  raw_text: string;
  source_url: string;
  published_at?: Date;
}

export interface RawFactCheck {
  headline: string;
  claim: string;
  rating: 'Verified' | 'Under Review' | 'False' | 'Misleading';
  source_url: string;
  published_at?: Date;
  subjects?: { candidate_name?: string; party_code?: string };
}

export abstract class BaseSourceAdapter {
  protected name: string;
  protected priority: number;

  constructor(name: string, priority: number) {
    this.name = name;
    this.priority = priority;
  }

  // Abstract methods to be implemented by concrete adapters
  abstract fetchCandidates(): Promise<RawCandidate[]>;
  abstract fetchManifestos(): Promise<RawManifesto[]>;
  
  // Optional method - not all adapters provide fact checks
  fetchFactChecks?(): Promise<RawFactCheck[]>;

  // Normalization utilities
  protected normalizeFullName(name: string): string {
    return name
      .trim()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }

  protected normalizePartyCode(partyName: string): string {
    const partyMapping: Record<string, string> = {
      'ALL PROGRESSIVES CONGRESS': 'APC',
      'PEOPLES DEMOCRATIC PARTY': 'PDP',
      'LABOUR PARTY': 'LP',
      'NEW NIGERIA PEOPLES PARTY': 'NNPP',
      'ALL PROGRESSIVES GRAND ALLIANCE': 'APGA',
      'YOUNG PROGRESSIVES PARTY': 'YPP',
      'SOCIAL DEMOCRATIC PARTY': 'SDP',
      'AFRICAN DEMOCRATIC CONGRESS': 'ADC',
      'ACTION ALLIANCE': 'AA',
      'ACCORD PARTY': 'ACCORD'
    };

    const upperName = partyName.toUpperCase();
    return partyMapping[upperName] || partyName.substring(0, 10).toUpperCase();
  }

  protected generateCandidateKey(candidate: CandidateMatch): string {
    if (candidate.external_id_inec) {
      return candidate.external_id_inec;
    }

    const keyString = `${candidate.normalized_name}_${candidate.party_code}_${candidate.office}_${candidate.constituency}_${candidate.election_date}`;
    return btoa(keyString).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
  }

  protected generateChecksum(content: string): string {
    return btoa(content).substring(0, 16);
  }

  // Candidate matching logic
  protected async findCandidateMatch(raw: RawCandidate): Promise<string | null> {
    const normalizedName = this.normalizeFullName(raw.full_name);
    const partyCode = this.normalizePartyCode(raw.party);

    // First try INEC external ID match
    const { data: inecMatch } = await supabase
      .from('candidates')
      .select('id')
      .eq('external_id_inec', raw.full_name)
      .single();

    if (inecMatch) return inecMatch.id;

    // Then try normalized name + party + office + constituency match
    const { data: nameMatch } = await supabase
      .from('candidates')
      .select('id')
      .eq('normalized_name', normalizedName)
      .eq('party_code', partyCode)
      .eq('office', raw.office)
      .eq('constituency', raw.constituency)
      .single();

    return nameMatch?.id || null;
  }

  // Manifesto section parsing
  protected parseManifestoSections(rawText: string): ManifestoSection[] {
    const sections: ManifestoSection[] = [];
    const topics = ['economy', 'education', 'health', 'security', 'infrastructure', 'governance'] as const;
    
    // Simple section detection based on keywords
    for (const topic of topics) {
      const regex = new RegExp(`(${topic}|${topic.charAt(0).toUpperCase() + topic.slice(1)})[:\\s]([^]*?)(?=${topics.filter(t => t !== topic).join('|')}|$)`, 'i');
      const match = rawText.match(regex);
      
      if (match && match[2]) {
        sections.push({
          heading: `${topic.charAt(0).toUpperCase() + topic.slice(1)} Policy`,
          content: match[2].trim().substring(0, 2000), // Limit content length
          topic,
          summary: match[2].trim().substring(0, 200) + '...'
        });
      }
    }

    // If no structured sections found, create a general section
    if (sections.length === 0) {
      sections.push({
        heading: 'General Manifesto',
        content: rawText.substring(0, 2000),
        topic: 'governance',
        summary: rawText.substring(0, 200) + '...'
      });
    }

    return sections;
  }

  // Validation helpers
  protected validateCandidate(candidate: RawCandidate): boolean {
    return !!(candidate.full_name && candidate.party && candidate.office);
  }

  protected validateManifesto(manifesto: RawManifesto): boolean {
    return !!(manifesto.candidate_name && manifesto.party && manifesto.raw_text);
  }

  protected validateFactCheck(factCheck: RawFactCheck): boolean {
    return !!(factCheck.headline && factCheck.claim && factCheck.rating);
  }

  // Logging helper
  protected log(message: string, data?: any): void {
    console.log(`[${this.name}] ${message}`, data || '');
  }
}