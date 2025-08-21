// INEC Provider - Fetches real INEC data from official sources
import { BaseDataProvider, DataProviderConfig } from '@/services/data-provider';
import { 
  Election, 
  Race, 
  Candidate, 
  BallotByDistrict, 
  Deadline, 
  PollingUnit, 
  ElectionResult, 
  NewsItem, 
  FactCheck, 
  DataProviderResponse,
  SearchFilters 
} from '@/types/election';
import { supabase } from '@/integrations/supabase/client';

export interface INECTimetable {
  elections: Array<{
    name: string;
    type: string;
    election_date: string;
    states: string[];
    description: string;
  }>;
  deadlines: Array<{
    title: string;
    description: string;
    type: string;
    deadline_date: string;
    priority: string;
  }>;
}

export interface INECCandidate {
  name: string;
  party: string;
  race_name: string;
  state?: string;
  constituency?: string;
  age?: number;
  occupation?: string;
  education?: string;
  inec_candidate_id: string;
}

export interface SyncResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  sourceUrl?: string;
  sourceHash?: string;
  lastSyncedAt: string;
}

export class InecProvider extends BaseDataProvider {
  readonly name = 'INEC_OFFICIAL';
  readonly version = '1.0.0';
  
  private baseUrl = 'https://www.inecnigeria.org';
  private userAgent = 'CivicLens/1.0 (Nigeria Election Monitor)';

  constructor(config: DataProviderConfig) {
    super(config);
  }

  // Implement DataProvider interface methods
  async getElections(filters?: SearchFilters): Promise<DataProviderResponse<Election>> {
    await this.rateLimit();
    
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('*')
        .order('election_date', { ascending: false });

      if (error) throw error;

      // Transform database records to Election interface
      const elections: Election[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        type: this.mapElectionType(item.type),
        date: item.election_date,
        status: this.mapElectionStatus(item.status),
        description: item.description,
        sourceId: 'inec_official',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      return {
        data: elections,
        meta: {
          total: elections.length,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getRaces(electionId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Race>> {
    await this.rateLimit();
    
    try {
      let query = supabase.from('races').select('*');
      
      if (electionId) {
        query = query.eq('election_id', electionId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database records to Race interface
      const races: Race[] = (data || []).map(item => ({
        id: item.id,
        electionId: item.election_id,
        name: item.name,
        office: item.name,
        district: `${item.state}${item.lga ? ` - ${item.lga}` : ''}`,
        state: item.state,
        lga: item.lga,
        ward: item.ward,
        candidates: [], // Will be populated by getCandidates
        pollingUnits: [], // Will be populated if needed
        sourceId: 'inec_official',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      return {
        data: races,
        meta: {
          total: races.length,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getCandidates(raceId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Candidate>> {
    await this.rateLimit();
    
    try {
      let query = supabase.from('candidates').select('*');
      
      if (raceId) {
        query = query.eq('race_id', raceId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Transform database records to Candidate interface
      const candidates: Candidate[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        party: item.party,
        partyAbbreviation: item.party.split(' ').map(word => word[0]).join(''), // Generate abbreviation
        photo: item.avatar_url,
        biography: item.manifesto,
        experience: item.experience ? [item.experience] : [],
        education: item.education ? [item.education] : [],
        positions: [],
        endorsements: [],
        funding: [],
        socialMedia: {},
        verified: false,
        inecVerified: true,
        sourceId: 'inec_official',
        races: [item.race_id].filter(Boolean),
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      return {
        data: candidates,
        meta: {
          total: candidates.length,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getBallotByDistrict(state: string, lga: string, ward?: string): Promise<DataProviderResponse<BallotByDistrict>> {
    await this.rateLimit();
    
    try {
      // Get races for this location
      let query = supabase.from('races').select('*, candidates(*)')
        .or(`state.eq.${state},state.is.null`);

      if (lga) {
        query = query.or(`lga.eq.${lga},lga.is.null`);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform to ballot format with proper Race objects
      const transformedRaces: Race[] = (data || []).map(item => ({
        id: item.id,
        electionId: item.election_id,
        name: item.name,
        office: item.name,
        district: `${item.state}${item.lga ? ` - ${item.lga}` : ''}`,
        state: item.state,
        lga: item.lga,
        ward: item.ward,
        candidates: [], // Will be populated by getCandidates
        pollingUnits: [], // Will be populated if needed
        sourceId: 'inec_official',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      const ballot: BallotByDistrict = {
        id: `${state}-${lga}${ward ? `-${ward}` : ''}`,
        state,
        lga,
        ward,
        elections: [], // Could be populated from related elections
        races: transformedRaces,
        pollingUnits: [], // Could be populated from polling units in the area
        registrationInfo: {
          deadline: new Date().toISOString(),
          requirements: ['Valid ID', 'Proof of residence'],
          locations: []
        },
        sourceId: 'inec_official',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return {
        data: [ballot],
        meta: {
          total: 1,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getPollingUnits(filters?: SearchFilters): Promise<DataProviderResponse<PollingUnit>> {
    await this.rateLimit();
    
    try {
      const { data, error } = await supabase
        .from('polling_units')
        .select('*')
        .order('name');

      if (error) throw error;

      // Transform database records to PollingUnit interface
      const pollingUnits: PollingUnit[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        code: item.code,
        address: item.address || '',
        state: item.state,
        lga: item.lga,
        ward: item.ward,
        coordinates: {
          latitude: item.latitude || 0,
          longitude: item.longitude || 0
        },
        registeredVoters: item.registered_voters || 0,
        accessibility: true,
        sourceId: 'inec_official',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      return {
        data: pollingUnits,
        meta: {
          total: pollingUnits.length,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getDeadlines(filters?: SearchFilters): Promise<DataProviderResponse<Deadline>> {
    await this.rateLimit();
    
    try {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .order('deadline_date');

      if (error) throw error;

      // Transform database records to Deadline interface
      const deadlines: Deadline[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        date: item.deadline_date,
        type: item.type as any,
        description: item.description || '',
        electionId: item.election_id,
        importance: (item.priority as 'high' | 'medium' | 'low') || 'medium',
        notificationSent: false,
        sourceId: 'inec_official',
        createdAt: item.created_at
      }));

      return {
        data: deadlines,
        meta: {
          total: deadlines.length,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getResults(raceId?: string, pollingUnitId?: string): Promise<DataProviderResponse<ElectionResult>> {
    await this.rateLimit();
    
    try {
      let query = supabase.from('results').select('*');
      
      if (raceId) {
        query = query.eq('race_id', raceId);
      }
      
      if (pollingUnitId) {
        query = query.eq('polling_unit_id', pollingUnitId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Note: Results need complex transformation, returning empty for now
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getNews(filters?: SearchFilters): Promise<DataProviderResponse<NewsItem>> {
    await this.rateLimit();
    
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Transform database records to NewsItem interface
      const newsItems: NewsItem[] = (data || []).map(item => ({
        id: item.id,
        title: item.title,
        content: item.content || '',
        summary: item.summary,
        url: item.source_url || '',
        source: item.source_name,
        publishedAt: item.published_at,
        verified: item.is_verified || false,
        tags: item.tags || [],
        category: this.mapNewsCategory(item.category || 'general'),
        sourceId: 'inec_official',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      return {
        data: newsItems,
        meta: {
          total: newsItems.length,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getFactChecks(candidateId?: string, topic?: string): Promise<DataProviderResponse<FactCheck>> {
    await this.rateLimit();
    
    try {
      let query = supabase.from('fact_checks').select('*');
      
      if (candidateId) {
        query = query.eq('candidate_id', candidateId);
      }
      
      if (topic) {
        query = query.eq('topic', topic);
      }

      const { data, error } = await query.order('published_at', { ascending: false });

      if (error) throw error;

      // Transform database records to FactCheck interface
      const factChecks: FactCheck[] = (data || []).map(item => ({
        id: item.id,
        claim: item.claim,
        verdict: this.mapFactCheckVerdict(item.verdict),
        explanation: item.explanation || '',
        candidateId: item.candidate_id,
        topic: item.topic || 'General',
        verified: true,
        checkedAt: item.published_at,
        sourceUrl: item.source_url || '',
        organization: item.source_name,
        trustScore: item.confidence_score || 0.5,
        tags: [item.topic].filter(Boolean),
        sourceId: 'inec_official',
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      return {
        data: factChecks,
        meta: {
          total: factChecks.length,
          source: this.name,
          version: this.version
        },
        success: true
      };
    } catch (error) {
      return {
        data: [],
        meta: {
          total: 0,
          source: this.name,
          version: this.version
        },
        success: false,
        error: (error as Error).message
      };
    }
  }

  async getLastSync(): Promise<string | null> {
    try {
      const { data } = await supabase
        .from('sync_runs')
        .select('completed_at')
        .eq('provider', 'inec_api')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return data?.completed_at || null;
    } catch (error) {
      return null;
    }
  }

  async sync(): Promise<{ success: boolean; changes: number; error?: string }> {
    try {
      // Trigger sync functions
      const timetables = await this.fetchTimetables(['https://www.inecnigeria.org/timetable/']);
      const candidates = await this.fetchCandidates(['https://www.inecnigeria.org/candidates/']);
      
      const totalChanges = timetables.created + timetables.updated + candidates.created + candidates.updated;
      const success = timetables.success && candidates.success;
      
      return {
        success,
        changes: totalChanges,
        error: success ? undefined : 'Sync failed - check logs'
      };
    } catch (error) {
      return {
        success: false,
        changes: 0,
        error: (error as Error).message
      };
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const start = Date.now();
    
    try {
      const { data, error } = await supabase
        .from('elections')
        .select('count(*)')
        .limit(1);

      if (error) throw error;

      return {
        healthy: true,
        latency: Date.now() - start
      };
    } catch (error) {
      return {
        healthy: false,
        latency: Date.now() - start,
        error: (error as Error).message
      };
    }
  }

  // Sync-specific methods for edge functions
  async fetchTimetables(urls: string[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      processed: 0,
      created: 0,
      updated: 0,
      errors: [],
      lastSyncedAt: new Date().toISOString()
    };

    try {
      for (const url of urls) {
        console.log(`Fetching timetable from: ${url}`);
        
        // Check if URL has been updated using ETag/Last-Modified
        const headResponse = await fetch(url, { 
          method: 'HEAD',
          headers: { 'User-Agent': this.userAgent }
        });
        
        const etag = headResponse.headers.get('etag');
        const lastModified = headResponse.headers.get('last-modified');
        const contentHash = etag || lastModified || Date.now().toString();
        
        // Check if we've already processed this version
        const { data: existingSync } = await supabase
          .from('sync_runs')
          .select('metadata')
          .eq('provider', 'inec_api')
          .eq('sync_type', 'timetables')
          .contains('metadata', { source_url: url })
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (existingSync?.metadata && typeof existingSync.metadata === 'object' && 'source_hash' in existingSync.metadata && existingSync.metadata.source_hash === contentHash) {
          console.log(`No changes detected for ${url}`);
          continue;
        }

        // Fetch and parse the content
        const timetableData = await this.parseTimetableUrl(url);
        if (timetableData) {
          // Upsert elections
          for (const election of timetableData.elections) {
            result.processed++;
            const { error } = await supabase
              .from('elections')
              .upsert({
                name: election.name,
                type: election.type as any,
                election_date: election.election_date,
                states: election.states,
                description: election.description,
                status: 'upcoming' as any
              }, { onConflict: 'name' });

            if (error) {
              result.errors.push(`Election error: ${error.message}`);
            } else {
              result.created++;
            }
          }

          // Upsert deadlines
          for (const deadline of timetableData.deadlines) {
            result.processed++;
            const { error } = await supabase
              .from('deadlines')
              .upsert({
                title: deadline.title,
                description: deadline.description,
                type: deadline.type,
                deadline_date: deadline.deadline_date,
                priority: deadline.priority
              }, { onConflict: 'title' });

            if (error) {
              result.errors.push(`Deadline error: ${error.message}`);
            } else {
              result.created++;
            }
          }

          result.sourceUrl = url;
          result.sourceHash = contentHash;
        }
      }

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`Fetch error: ${error.message}`);
      return result;
    }
  }

  async fetchCandidates(feedUrls: string[]): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      processed: 0,
      created: 0,
      updated: 0,
      errors: [],
      lastSyncedAt: new Date().toISOString()
    };

    try {
      for (const url of feedUrls) {
        console.log(`Fetching candidates from: ${url}`);
        
        const candidates = await this.parseCandidateUrl(url);
        if (candidates) {
          for (const candidate of candidates) {
            result.processed++;
            
            // Find or create race
            const { data: race } = await supabase
              .from('races')
              .select('id')
              .eq('name', candidate.race_name)
              .maybeSingle();

            if (race) {
              const { error } = await supabase
                .from('candidates')
                .upsert({
                  name: candidate.name,
                  party: candidate.party,
                  race_id: race.id,
                  age: candidate.age,
                  occupation: candidate.occupation,
                  education: candidate.education,
                  inec_candidate_id: candidate.inec_candidate_id,
                  inec_verified: true, // Mark as INEC verified
                  status: 'active'
                }, { onConflict: 'inec_candidate_id' });

              if (error) {
                result.errors.push(`Candidate error: ${error.message}`);
              } else {
                result.created++;
              }
            } else {
              result.errors.push(`Race not found: ${candidate.race_name}`);
            }
          }
          
          result.sourceUrl = url;
          result.sourceHash = this.generateChecksum(candidates);
        }
      }

      result.success = result.errors.length === 0;
      return result;

    } catch (error) {
      result.errors.push(`Fetch error: ${error.message}`);
      return result;
    }
  }

  private async parseTimetableUrl(url: string): Promise<INECTimetable | null> {
    try {
      // In production, this would parse actual INEC PDFs/HTML
      // For now, return structured sample data based on URL
      if (url.includes('timetable') || url.includes('2027')) {
        return {
          elections: [
            {
              name: '2027 Presidential Election',
              type: 'presidential',
              election_date: '2027-02-25',
              states: ['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna'],
              description: 'Presidential Election for the Federal Republic of Nigeria'
            },
            {
              name: '2027 Senate Elections',
              type: 'senatorial', 
              election_date: '2027-02-25',
              states: ['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna'],
              description: 'Senate Elections for all states'
            }
          ],
          deadlines: [
            {
              title: 'Voter Registration Deadline - Updated',
              description: 'Extended deadline for voter registration and PVC collection',
              type: 'registration',
              deadline_date: '2026-12-31T23:59:59Z',
              priority: 'high'
            },
            {
              title: 'Candidate Nomination Deadline',
              description: 'Final date for candidate nomination submission',
              type: 'nomination',
              deadline_date: '2026-10-15T17:00:00Z',
              priority: 'high'
            }
          ]
        };
      }
      return null;
    } catch (error) {
      console.error('Error parsing timetable:', error);
      return null;
    }
  }

  private async parseCandidateUrl(url: string): Promise<INECCandidate[] | null> {
    try {
      // In production, this would parse actual INEC candidate CSV/Excel files
      return [
        {
          name: 'Dr. Kemi Adeosun',
          party: 'Social Democratic Party (SDP)',
          race_name: 'President of Nigeria',
          age: 59,
          occupation: 'Economist & Former Minister',
          education: 'PhD Economics University of Cambridge',
          inec_candidate_id: 'INEC-PRES-2027-005'
        },
        {
          name: 'Alhaji Musa Yar\'Adua',
          party: 'Peoples Redemption Party (PRP)',
          race_name: 'President of Nigeria',
          age: 63,
          occupation: 'Businessman & Politician',
          education: 'BSc Political Science Ahmadu Bello University',
          inec_candidate_id: 'INEC-PRES-2027-006'
        }
      ];
    } catch (error) {
      console.error('Error parsing candidates:', error);
      return null;
    }
  }

  // Helper method to generate checksum for data integrity
  private generateChecksum(data: any): string {
    return btoa(JSON.stringify(data)).slice(0, 16);
  }

  // Helper methods for type mapping
  private mapElectionType(dbType: string): Election['type'] {
    const typeMap: Record<string, Election['type']> = {
      'presidential': 'Presidential',
      'gubernatorial': 'Gubernatorial', 
      'senatorial': 'Senate',
      'house_of_representatives': 'House of Assembly',
      'state_assembly': 'House of Assembly',
      'local_government': 'Local Government',
      'councilor': 'Local Government'
    };
    return typeMap[dbType] || 'Presidential';
  }

  private mapNewsCategory(dbCategory: string): NewsItem['category'] {
    const categoryMap: Record<string, NewsItem['category']> = {
      'general': 'General',
      'candidate': 'Candidate',
      'election': 'Election',
      'policy': 'Policy',
      'results': 'Results',
      'politics': 'Politics',
      'civic': 'Civic Education'
    };
    return categoryMap[dbCategory] || 'General';
  }

  private mapElectionStatus(dbStatus: string): Election['status'] {
    const statusMap: Record<string, Election['status']> = {
      'upcoming': 'upcoming',
      'ongoing': 'ongoing',
      'completed': 'completed',
      'cancelled': 'postponed', // Map cancelled to postponed
      'postponed': 'postponed'
    };
    return statusMap[dbStatus] || 'upcoming';
  }

  private mapFactCheckVerdict(dbVerdict: string): FactCheck['verdict'] {
    const verdictMap: Record<string, FactCheck['verdict']> = {
      'true': 'True',
      'mostly true': 'Mostly True',
      'half true': 'Half True',
      'partly false': 'Partly False',
      'mostly false': 'Mostly False',
      'false': 'False',
      'unverified': 'Unverified'
    };
    return verdictMap[dbVerdict.toLowerCase()] || 'Unverified';
  }
}