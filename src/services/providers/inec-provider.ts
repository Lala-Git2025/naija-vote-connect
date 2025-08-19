// INEC Official Data Provider for CivicLens
// Connects to official INEC APIs where available, falls back to manual imports

import { 
  BaseDataProvider, 
  DataProviderConfig
} from '@/services/data-provider';
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
  SearchFilters,
  DataProviderResponse 
} from '@/types/election';
import { supabase } from '@/integrations/supabase/client';

export interface InecProviderConfig extends DataProviderConfig {
  inecApiKey?: string;
  inecBaseUrl?: string;
  fallbackMode: 'api' | 'manual' | 'hybrid';
  manualDataEndpoint?: string;
}

export class InecProvider extends BaseDataProvider {
  readonly name = 'INEC_OFFICIAL';
  readonly version = '1.0.0';
  
  private inecConfig: InecProviderConfig;
  
  constructor(config: InecProviderConfig) {
    super(config);
    this.inecConfig = config;
  }
  
  get isAvailable(): boolean {
    return this.inecConfig.fallbackMode === 'manual' || 
           !!(this.inecConfig.inecApiKey && this.inecConfig.inecBaseUrl);
  }
  
  async getElections(filters?: SearchFilters): Promise<DataProviderResponse<Election>> {
    await this.rateLimit();
    
    return this.retryRequest(async () => {
      try {
        const { data, error } = await supabase
          .from('elections')
          .select('*')
          .order('election_date', { ascending: false });

        if (error) throw error;

        const mappedData: Election[] = data.map(election => ({
          id: election.id,
          name: election.name,
          type: this.mapElectionType(election.type),
          date: election.election_date,
          status: this.mapElectionStatus(election.status),
          description: election.description || '',
          sourceId: 'supabase',
          createdAt: election.created_at,
          updatedAt: election.updated_at
        }));

        return {
          data: mappedData,
          meta: {
            total: mappedData.length,
            source: this.name,
            version: this.version
          },
          success: true
        };
      } catch (error) {
        console.warn('Supabase elections query failed, falling back to manual data:', error);
        return this.fetchFromManualData('elections', filters);
      }
    });
  }
  
  private mapElectionType(dbType: string): Election['type'] {
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
  }

  private mapElectionStatus(dbStatus: string): Election['status'] {
    const mapping: Record<string, Election['status']> = {
      'upcoming': 'upcoming',
      'ongoing': 'ongoing', 
      'completed': 'completed',
      'cancelled': 'postponed',
      'postponed': 'postponed'
    };
    return mapping[dbStatus] || 'upcoming';
  }
  
  async getRaces(electionId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Race>> {
    await this.rateLimit();
    
    return this.retryRequest(async () => {
      const endpoint = electionId ? `/elections/${electionId}/races` : '/races';
      
      if (this.inecConfig.fallbackMode === 'api' && this.inecConfig.inecBaseUrl) {
        return this.fetchFromInecApi(endpoint, filters);
      } else {
        return this.fetchFromManualData('races', { ...filters, electionId });
      }
    });
  }
  
  async getCandidates(raceId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Candidate>> {
    await this.rateLimit();
    
    return this.retryRequest(async () => {
      const endpoint = raceId ? `/races/${raceId}/candidates` : '/candidates';
      
      if (this.inecConfig.fallbackMode === 'api' && this.inecConfig.inecBaseUrl) {
        return this.fetchFromInecApi(endpoint, filters);
      } else {
        return this.fetchFromManualData('candidates', { ...filters, raceId });
      }
    });
  }
  
  async getBallotByDistrict(state: string, lga: string, ward?: string): Promise<DataProviderResponse<BallotByDistrict>> {
    await this.rateLimit();
    
    return this.retryRequest(async () => {
      const endpoint = `/ballot/${state}/${lga}${ward ? `/${ward}` : ''}`;
      
      if (this.inecConfig.fallbackMode === 'api' && this.inecConfig.inecBaseUrl) {
        return this.fetchFromInecApi(endpoint);
      } else {
        return this.fetchFromManualData('ballots', { state, lga, ward });
      }
    });
  }
  
  async getPollingUnits(filters?: SearchFilters): Promise<DataProviderResponse<PollingUnit>> {
    await this.rateLimit();
    
    return this.retryRequest(async () => {
      if (this.inecConfig.fallbackMode === 'api' && this.inecConfig.inecBaseUrl) {
        return this.fetchFromInecApi('/polling-units', filters);
      } else {
        return this.fetchFromManualData('polling_units', filters);
      }
    });
  }
  
  async getDeadlines(filters?: SearchFilters): Promise<DataProviderResponse<Deadline>> {
    await this.rateLimit();
    
    return this.retryRequest(async () => {
      if (this.inecConfig.fallbackMode === 'api' && this.inecConfig.inecBaseUrl) {
        return this.fetchFromInecApi('/deadlines', filters);
      } else {
        return this.fetchFromManualData('deadlines', filters);
      }
    });
  }
  
  async getResults(raceId?: string, pollingUnitId?: string): Promise<DataProviderResponse<ElectionResult>> {
    await this.rateLimit();
    
    return this.retryRequest(async () => {
      let endpoint = '/results';
      if (raceId) endpoint += `?raceId=${raceId}`;
      if (pollingUnitId) endpoint += `${raceId ? '&' : '?'}pollingUnitId=${pollingUnitId}`;
      
      if (this.inecConfig.fallbackMode === 'api' && this.inecConfig.inecBaseUrl) {
        return this.fetchFromInecApi(endpoint);
      } else {
        return this.fetchFromManualData('results', { raceId, pollingUnitId });
      }
    });
  }
  
  async getNews(filters?: SearchFilters): Promise<DataProviderResponse<NewsItem>> {
    // INEC doesn't provide news, return empty response
    return {
      data: [],
      meta: {
        total: 0,
        source: this.name,
        version: this.version
      },
      success: true
    };
  }
  
  async getFactChecks(candidateId?: string, topic?: string): Promise<DataProviderResponse<FactCheck>> {
    // INEC doesn't provide fact checks, return empty response
    return {
      data: [],
      meta: {
        total: 0,
        source: this.name,
        version: this.version
      },
      success: true
    };
  }
  
  async getLastSync(): Promise<string | null> {
    try {
      const stored = localStorage.getItem(`${this.name}_last_sync`);
      return stored ? new Date(stored).toISOString() : null;
    } catch {
      return null;
    }
  }
  
  async sync(): Promise<{ success: boolean; changes: number; error?: string }> {
    try {
      let totalChanges = 0;
      
      // Sync all data types
      const syncTasks = [
        this.syncDataType('elections'),
        this.syncDataType('races'),
        this.syncDataType('candidates'),
        this.syncDataType('polling_units'),
        this.syncDataType('deadlines')
      ];
      
      const results = await Promise.allSettled(syncTasks);
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          totalChanges += result.value;
        }
      }
      
      // Update last sync timestamp
      localStorage.setItem(`${this.name}_last_sync`, new Date().toISOString());
      
      return { success: true, changes: totalChanges };
    } catch (error) {
      return { 
        success: false, 
        changes: 0, 
        error: error instanceof Error ? error.message : 'Unknown sync error' 
      };
    }
  }
  
  async checkHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      if (this.inecConfig.fallbackMode === 'api' && this.inecConfig.inecBaseUrl) {
        const response = await fetch(`${this.inecConfig.inecBaseUrl}/health`, {
          method: 'GET',
          headers: this.inecConfig.inecApiKey ? {
            'Authorization': `Bearer ${this.inecConfig.inecApiKey}`,
            'Content-Type': 'application/json'
          } : { 'Content-Type': 'application/json' }
        });
        
        if (!response.ok) {
          throw new Error(`Health check failed: ${response.status}`);
        }
      }
      
      const latency = Date.now() - startTime;
      return { healthy: true, latency };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      };
    }
  }
  
  private async fetchFromInecApi(endpoint: string, filters?: any): Promise<DataProviderResponse<any>> {
    if (!this.inecConfig.inecBaseUrl) {
      throw new Error('INEC API URL not configured');
    }
    
    const url = new URL(endpoint, this.inecConfig.inecBaseUrl);
    
    // Add filters as query parameters
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (this.inecConfig.inecApiKey) {
      headers['Authorization'] = `Bearer ${this.inecConfig.inecApiKey}`;
    }
    
    const response = await fetch(url.toString(), { headers });
    
    if (!response.ok) {
      throw new Error(`INEC API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return this.normalizeInecResponse(data);
  }
  
  private async fetchFromManualData(dataType: string, filters?: any): Promise<DataProviderResponse<any>> {
    // This would connect to our manual data import endpoint
    // For now, return mock data
    
    const mockData = this.getMockData(dataType, filters);
    
    return {
      data: mockData,
      meta: {
        total: mockData.length,
        source: this.name,
        version: this.version,
        lastSync: await this.getLastSync() || undefined
      },
      success: true
    };
  }
  
  private normalizeInecResponse(apiResponse: any): DataProviderResponse<any> {
    // Transform INEC API response to our standard format
    return {
      data: Array.isArray(apiResponse.data) ? apiResponse.data : apiResponse.items || [],
      meta: {
        total: apiResponse.total || apiResponse.count || 0,
        page: apiResponse.page,
        pageSize: apiResponse.pageSize || apiResponse.limit,
        source: this.name,
        version: this.version,
        lastSync: apiResponse.lastModified || new Date().toISOString()
      },
      success: true
    };
  }
  
  private async syncDataType(dataType: string): Promise<number> {
    // Implementation would depend on the specific sync strategy
    // For now, return 0 changes
    return 0;
  }
  
  private getMockData(dataType: string, filters?: any): any[] {
    // Return empty array for now - real implementation would have mock data
    // This will be populated with realistic Nigerian election data
    return [];
  }
}