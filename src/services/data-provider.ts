// Data Provider Interface for CivicLens
// Pluggable architecture for INEC, external APIs, and manual data imports

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

// Re-export types for convenience
export type { DataProviderResponse, SearchFilters } from '@/types/election';

export interface DataProvider {
  readonly name: string;
  readonly version: string;
  readonly isAvailable: boolean;
  
  // Core election data
  getElections(filters?: SearchFilters): Promise<DataProviderResponse<Election>>;
  getRaces(electionId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Race>>;
  getCandidates(raceId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Candidate>>;
  getBallotByDistrict(state: string, lga: string, ward?: string): Promise<DataProviderResponse<BallotByDistrict>>;
  
  // Location and polling
  getPollingUnits(filters?: SearchFilters): Promise<DataProviderResponse<PollingUnit>>;
  
  // Deadlines and important dates
  getDeadlines(filters?: SearchFilters): Promise<DataProviderResponse<Deadline>>;
  
  // Results (when available)
  getResults(raceId?: string, pollingUnitId?: string): Promise<DataProviderResponse<ElectionResult>>;
  
  // News and fact-checking
  getNews(filters?: SearchFilters): Promise<DataProviderResponse<NewsItem>>;
  getFactChecks(candidateId?: string, topic?: string): Promise<DataProviderResponse<FactCheck>>;
  
  // Sync and cache management
  getLastSync(): Promise<string | null>;
  sync(): Promise<{ success: boolean; changes: number; error?: string }>;
  
  // Health check
  checkHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }>;
}

export interface DataProviderConfig {
  name: string;
  apiKey?: string;
  baseUrl?: string;
  rateLimit?: {
    requests: number;
    windowMs: number;
  };
  retryConfig?: {
    maxRetries: number;
    backoffMs: number;
  };
  cacheConfig?: {
    ttlMs: number;
    maxEntries: number;
  };
}

export abstract class BaseDataProvider implements DataProvider {
  abstract readonly name: string;
  abstract readonly version: string;
  
  protected config: DataProviderConfig;
  protected lastRequest: number = 0;
  protected requestCount: number = 0;
  
  constructor(config: DataProviderConfig) {
    this.config = config;
  }
  
  get isAvailable(): boolean {
    return true; // Override in specific providers
  }
  
  protected async rateLimit(): Promise<void> {
    if (!this.config.rateLimit) return;
    
    const now = Date.now();
    const windowStart = now - this.config.rateLimit.windowMs;
    
    // Reset counter if outside window
    if (this.lastRequest < windowStart) {
      this.requestCount = 0;
    }
    
    if (this.requestCount >= this.config.rateLimit.requests) {
      const waitTime = this.config.rateLimit.windowMs - (now - this.lastRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      this.requestCount = 0;
    }
    
    this.requestCount++;
    this.lastRequest = now;
  }
  
  protected async retryRequest<T>(
    operation: () => Promise<T>,
    retries: number = this.config.retryConfig?.maxRetries || 3
  ): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i <= retries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (i < retries) {
          const backoff = Math.pow(2, i) * (this.config.retryConfig?.backoffMs || 1000);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }
    
    throw lastError!;
  }
  
  // Abstract methods to be implemented by specific providers
  abstract getElections(filters?: SearchFilters): Promise<DataProviderResponse<Election>>;
  abstract getRaces(electionId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Race>>;
  abstract getCandidates(raceId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Candidate>>;
  abstract getBallotByDistrict(state: string, lga: string, ward?: string): Promise<DataProviderResponse<BallotByDistrict>>;
  abstract getPollingUnits(filters?: SearchFilters): Promise<DataProviderResponse<PollingUnit>>;
  abstract getDeadlines(filters?: SearchFilters): Promise<DataProviderResponse<Deadline>>;
  abstract getResults(raceId?: string, pollingUnitId?: string): Promise<DataProviderResponse<ElectionResult>>;
  abstract getNews(filters?: SearchFilters): Promise<DataProviderResponse<NewsItem>>;
  abstract getFactChecks(candidateId?: string, topic?: string): Promise<DataProviderResponse<FactCheck>>;
  abstract getLastSync(): Promise<string | null>;
  abstract sync(): Promise<{ success: boolean; changes: number; error?: string }>;
  abstract checkHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }>;
}

// Provider registry for dependency injection
export class DataProviderRegistry {
  private providers = new Map<string, DataProvider>();
  private primaryProvider?: string;
  
  register(provider: DataProvider, isPrimary = false): void {
    this.providers.set(provider.name, provider);
    if (isPrimary) {
      this.primaryProvider = provider.name;
    }
  }
  
  get(name?: string): DataProvider | undefined {
    if (name) {
      return this.providers.get(name);
    }
    
    if (this.primaryProvider) {
      return this.providers.get(this.primaryProvider);
    }
    
    // Return first available provider
    for (const provider of this.providers.values()) {
      if (provider.isAvailable) {
        return provider;
      }
    }
    
    return undefined;
  }
  
  getAll(): DataProvider[] {
    return Array.from(this.providers.values());
  }
  
  getAvailable(): DataProvider[] {
    return Array.from(this.providers.values()).filter(p => p.isAvailable);
  }
  
  setPrimary(name: string): boolean {
    if (this.providers.has(name)) {
      this.primaryProvider = name;
      return true;
    }
    return false;
  }
}

// Global registry instance
export const dataProviderRegistry = new DataProviderRegistry();