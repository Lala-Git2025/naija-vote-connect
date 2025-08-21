// Provider registry and switcher logic
// Order: native → remote → manual. Falls back if provider fails or returns empty data.

import { BaseProvider, TimetableData, CandidateData, ResultData } from './base.js';
import { INECNativeProvider } from './inec.native.js';
import { INECRemoteProvider } from './inec.remote.js';

export interface ProviderConfig {
  native: {
    timetableUrls: string[];
    candidateUrls: string[];
    resultsUrls: string[];
  };
  remote: {
    apiBase: string;
    apiKey?: string;
  };
}

export class ProviderSwitcher {
  private providers: BaseProvider[] = [];
  
  constructor(config: ProviderConfig) {
    // Initialize providers in priority order
    if (config.native.timetableUrls.length > 0) {
      this.providers.push(new INECNativeProvider({
        timetableUrls: config.native.timetableUrls,
        candidateUrls: config.native.candidateUrls,
        resultsUrls: config.native.resultsUrls
      }));
    }

    if (config.remote.apiBase) {
      this.providers.push(new INECRemoteProvider({
        apiBase: config.remote.apiBase,
        apiKey: config.remote.apiKey
      }));
    }
  }

  async fetchTimetables(): Promise<{ data: TimetableData; provider: string }> {
    return this.tryProviders('fetchTimetables');
  }

  async fetchCandidates(): Promise<{ data: CandidateData; provider: string }> {
    return this.tryProviders('fetchCandidates');
  }

  async fetchResultsLinks(): Promise<{ data: ResultData; provider: string }> {
    return this.tryProviders('fetchResultsLinks');
  }

  private async tryProviders<T>(
    method: keyof BaseProvider
  ): Promise<{ data: T; provider: string }> {
    const errors: Array<{ provider: string; error: Error }> = [];

    for (const provider of this.providers) {
      try {
        console.log(`Trying provider: ${(provider as any).name}`);
        
        const data = await (provider as any)[method]();
        
        // Check if data is meaningful (not empty)
        if (this.hasData(data)) {
          console.log(`Success with provider: ${(provider as any).name}`);
          return { data, provider: (provider as any).name };
        } else {
          console.log(`Provider ${(provider as any).name} returned empty data`);
        }
      } catch (error) {
        const err = error as Error;
        console.error(`Provider ${(provider as any).name} failed:`, err.message);
        errors.push({ provider: (provider as any).name, error: err });
      }
    }

    // If all providers failed, throw aggregated error
    const errorMessages = errors.map(e => `${e.provider}: ${e.error.message}`).join('; ');
    throw new Error(`All providers failed for ${String(method)}: ${errorMessages}`);
  }

  private hasData(data: any): boolean {
    if (!data) return false;
    
    // Check for meaningful data in different response types
    if (data.elections) return data.elections.length > 0;
    if (data.races) return data.races.length > 0;
    if (data.results) return data.results.length > 0;
    if (data.results_links) return data.results_links.length > 0;
    
    return false;
  }

  getAvailableProviders(): string[] {
    return this.providers.map(p => (p as any).name);
  }
}

// Factory function for edge functions
export function createProviderSwitcher(config: ProviderConfig): ProviderSwitcher {
  return new ProviderSwitcher(config);
}