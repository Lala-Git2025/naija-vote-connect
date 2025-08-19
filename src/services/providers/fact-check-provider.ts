// Fact Check Provider for CivicLens
// Integrates with Africa Check, DUBAWA, and other fact-checking services

import { 
  BaseDataProvider, 
  DataProviderConfig,
  DataProviderResponse 
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
  SearchFilters 
} from '@/types/election';

export interface FactCheckConfig extends DataProviderConfig {
  providers: {
    africaCheck: {
      enabled: boolean;
      apiKey?: string;
      feedUrl?: string;
    };
    dubawa: {
      enabled: boolean;
      apiKey?: string;
      feedUrl?: string;
    };
    custom: {
      name: string;
      url: string;
      apiKey?: string;
    }[];
  };
  refreshIntervalHours: number;
  trustThreshold: number; // 0-1, minimum trust score to include
}

export class FactCheckProvider extends BaseDataProvider {
  readonly name = 'FACT_CHECK';
  readonly version = '1.0.0';
  
  private factCheckConfig: FactCheckConfig;
  private cache: Map<string, { data: FactCheck[]; timestamp: number }> = new Map();
  
  constructor(config: FactCheckConfig) {
    super(config);
    this.factCheckConfig = config;
  }
  
  get isAvailable(): boolean {
    return this.factCheckConfig.providers.africaCheck.enabled ||
           this.factCheckConfig.providers.dubawa.enabled ||
           this.factCheckConfig.providers.custom.length > 0;
  }

  // Core methods (return empty for non-factcheck data)
  async getElections(): Promise<DataProviderResponse<Election>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getRaces(): Promise<DataProviderResponse<Race>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getCandidates(): Promise<DataProviderResponse<Candidate>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getBallotByDistrict(): Promise<DataProviderResponse<BallotByDistrict>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getPollingUnits(): Promise<DataProviderResponse<PollingUnit>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getDeadlines(): Promise<DataProviderResponse<Deadline>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getResults(): Promise<DataProviderResponse<ElectionResult>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  async getNews(): Promise<DataProviderResponse<NewsItem>> {
    return { data: [], meta: { total: 0, source: this.name, version: this.version }, success: true };
  }

  // Fact check implementation
  async getFactChecks(candidateId?: string, topic?: string): Promise<DataProviderResponse<FactCheck>> {
    await this.rateLimit();
    
    try {
      const allFactChecks = await this.fetchAllFactChecks();
      let filteredFactChecks = allFactChecks;
      
      if (candidateId) {
        filteredFactChecks = filteredFactChecks.filter(fc => 
          fc.candidateId === candidateId || fc.tags.includes(candidateId)
        );
      }
      
      if (topic) {
        filteredFactChecks = filteredFactChecks.filter(fc => 
          fc.topic.toLowerCase().includes(topic.toLowerCase()) ||
          fc.tags.some(tag => tag.toLowerCase().includes(topic.toLowerCase()))
        );
      }
      
      return {
        data: filteredFactChecks,
        meta: {
          total: filteredFactChecks.length,
          source: this.name,
          version: this.version,
          lastSync: await this.getLastSync()
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
        error: error instanceof Error ? error.message : 'Failed to fetch fact checks'
      };
    }
  }

  async sync(): Promise<{ success: boolean; changes: number; error?: string }> {
    try {
      const before = this.cache.size;
      await this.fetchAllFactChecks(true); // Force refresh
      const after = this.cache.size;
      
      // Update last sync
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${this.name}_lastSync`, new Date().toISOString());
      }
      
      return { success: true, changes: Math.abs(after - before) };
    } catch (error) {
      return { 
        success: false, 
        changes: 0, 
        error: error instanceof Error ? error.message : 'Sync failed' 
      };
    }
  }

  async getLastSync(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(`${this.name}_lastSync`);
  }

  async checkHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const start = Date.now();
    
    try {
      const healthChecks: Promise<boolean>[] = [];
      
      if (this.factCheckConfig.providers.africaCheck.enabled) {
        healthChecks.push(this.testAfricaCheckAPI());
      }
      
      if (this.factCheckConfig.providers.dubawa.enabled) {
        healthChecks.push(this.testDubawaAPI());
      }
      
      this.factCheckConfig.providers.custom.forEach(provider => {
        healthChecks.push(this.testCustomAPI(provider.url));
      });
      
      const results = await Promise.allSettled(healthChecks);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value).length;
      
      const healthy = successCount > 0;
      const latency = Date.now() - start;
      
      return { 
        healthy, 
        latency,
        error: healthy ? undefined : 'All fact-check APIs failed'
      };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Health check failed' 
      };
    }
  }

  // Private methods
  private async fetchAllFactChecks(forceRefresh = false): Promise<FactCheck[]> {
    const cacheKey = 'all_factchecks';
    const cached = this.cache.get(cacheKey);
    const now = Date.now();
    const cacheValidUntil = now - (this.factCheckConfig.refreshIntervalHours * 60 * 60 * 1000);
    
    if (!forceRefresh && cached && cached.timestamp > cacheValidUntil) {
      return cached.data;
    }

    const allFactChecks: FactCheck[] = [];
    
    // Fetch from Africa Check
    if (this.factCheckConfig.providers.africaCheck.enabled) {
      try {
        const checks = await this.fetchAfricaCheckData();
        allFactChecks.push(...checks);
      } catch (error) {
        console.warn('Failed to fetch Africa Check data:', error);
      }
    }
    
    // Fetch from DUBAWA
    if (this.factCheckConfig.providers.dubawa.enabled) {
      try {
        const checks = await this.fetchDubawaData();
        allFactChecks.push(...checks);
      } catch (error) {
        console.warn('Failed to fetch DUBAWA data:', error);
      }
    }
    
    // Fetch from custom providers
    for (const provider of this.factCheckConfig.providers.custom) {
      try {
        const checks = await this.fetchCustomProviderData(provider);
        allFactChecks.push(...checks);
      } catch (error) {
        console.warn(`Failed to fetch from ${provider.name}:`, error);
      }
    }
    
    // Filter by trust threshold and deduplicate
    const trustedChecks = allFactChecks.filter(fc => fc.trustScore >= this.factCheckConfig.trustThreshold);
    const uniqueChecks = this.deduplicateFactChecks(trustedChecks);
    
    // Sort by date (newest first)
    uniqueChecks.sort((a, b) => new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime());
    
    // Cache the results
    this.cache.set(cacheKey, { data: uniqueChecks, timestamp: now });
    
    return uniqueChecks;
  }

  private async fetchAfricaCheckData(): Promise<FactCheck[]> {
    // In real implementation, this would call Africa Check API
    // For now, return mock data
    return this.getMockFactChecks('Africa Check');
  }

  private async fetchDubawaData(): Promise<FactCheck[]> {
    // In real implementation, this would call DUBAWA API
    // For now, return mock data
    return this.getMockFactChecks('DUBAWA');
  }

  private async fetchCustomProviderData(provider: { name: string; url: string; apiKey?: string }): Promise<FactCheck[]> {
    // In real implementation, this would call custom provider API
    // For now, return mock data
    return this.getMockFactChecks(provider.name);
  }

  private async testAfricaCheckAPI(): Promise<boolean> {
    // Test Africa Check API connectivity
    try {
      const url = this.factCheckConfig.providers.africaCheck.feedUrl || 'https://africacheck.org';
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testDubawaAPI(): Promise<boolean> {
    // Test DUBAWA API connectivity
    try {
      const url = this.factCheckConfig.providers.dubawa.feedUrl || 'https://dubawa.org';
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private async testCustomAPI(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getMockFactChecks(providerName: string): FactCheck[] {
    const now = new Date();
    
    return [
      {
        id: `factcheck_${providerName}_${Date.now()}_1`,
        claim: 'Candidate claims to have built 100 schools in Lagos',
        verdict: 'Mostly True',
        explanation: 'Records show 87 schools were completed, with 13 more under construction.',
        topic: 'Education Infrastructure',
        candidateId: 'candidate_lagos_gov_1',
        checkedAt: new Date(now.getTime() - Math.random() * 86400000 * 30).toISOString(), // Within last month
        sourceUrl: `https://${providerName.toLowerCase().replace(' ', '')}.org/factcheck/education-claims`,
        organization: providerName,
        methodology: 'Document review and site visits',
        trustScore: 0.85,
        tags: ['education', 'infrastructure', 'lagos'],
        verified: true,
        sourceId: this.name,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        id: `factcheck_${providerName}_${Date.now()}_2`,
        claim: 'Opposition claims current administration spent ₦50 billion on non-existent projects',
        verdict: 'Partly False',
        explanation: 'Some projects exist but are incomplete. Total spending was ₦35 billion, not ₦50 billion.',
        topic: 'Government Spending',
        candidateId: undefined,
        checkedAt: new Date(now.getTime() - Math.random() * 86400000 * 14).toISOString(), // Within last 2 weeks
        sourceUrl: `https://${providerName.toLowerCase().replace(' ', '')}.org/factcheck/spending-claims`,
        organization: providerName,
        methodology: 'Budget analysis and project verification',
        trustScore: 0.92,
        tags: ['spending', 'corruption', 'government'],
        verified: true,
        sourceId: this.name,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ];
  }

  private deduplicateFactChecks(factChecks: FactCheck[]): FactCheck[] {
    const seen = new Set<string>();
    const unique: FactCheck[] = [];
    
    for (const factCheck of factChecks) {
      // Create a hash based on claim and topic
      const hash = `${factCheck.claim.toLowerCase().trim()}_${factCheck.topic.toLowerCase().trim()}`;
      
      if (!seen.has(hash)) {
        seen.add(hash);
        unique.push(factCheck);
      }
    }
    
    return unique;
  }
}