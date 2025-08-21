// Base provider interface for CivicLens data providers
// Enforces idempotent upserts and checksum-based deduplication

export interface SyncRun {
  id: string;
  provider: string;
  sync_type: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  items_ingested: number;
  error?: string;
  metadata?: Record<string, any>;
}

export interface TimetableData {
  elections: Array<{
    name: string;
    scope: string;
    state_code?: string;
    lga_code?: string;
    ward_code?: string;
    date_start?: string;
    date_end?: string;
    status: string;
    source_url: string;
    source_hash: string;
  }>;
  deadlines: Array<{
    election_id: string;
    kind: string;
    due_at: string;
    source_url: string;
  }>;
}

export interface CandidateData {
  races: Array<{
    election_id: string;
    office: string;
    district?: string;
    seats?: number;
    source_url: string;
  }>;
  candidates: Array<{
    race_id: string;
    full_name: string;
    party?: string;
    inec_verified: boolean;
    photo_url?: string;
    manifesto_url?: string;
    source_url: string;
  }>;
}

export interface ResultData {
  results: Array<{
    election_id: string;
    race_id: string;
    pu_code: string;
    party: string;
    votes: number;
    source_url?: string;
    captured_at?: string;
  }>;
  results_links: string[];
}

export abstract class BaseProvider {
  protected name: string;
  protected lastSyncHash: Map<string, string> = new Map();

  constructor(name: string) {
    this.name = name;
  }

  // Abstract methods to be implemented by concrete providers
  abstract fetchTimetables(): Promise<TimetableData>;
  abstract fetchCandidates(): Promise<CandidateData>;
  abstract fetchResultsLinks(): Promise<ResultData>;

  // Common helpers for all providers
  protected generateChecksum(data: any): string {
    const jsonString = JSON.stringify(data, Object.keys(data).sort());
    return btoa(jsonString).slice(0, 16); // Simple hash for deduplication
  }

  protected hasDataChanged(key: string, newHash: string): boolean {
    const lastHash = this.lastSyncHash.get(key);
    if (lastHash === newHash) {
      return false;
    }
    this.lastSyncHash.set(key, newHash);
    return true;
  }

  // Retry with exponential backoff
  protected async retryWithBackoff<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelayMs = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }

        // Handle 429 rate limiting with longer backoff
        const isRateLimit = error instanceof Error && 
          (error.message.includes('429') || error.message.includes('rate limit'));
        
        const delayMs = isRateLimit ? 
          baseDelayMs * Math.pow(3, attempt) : 
          baseDelayMs * Math.pow(2, attempt);
          
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    }
    
    throw lastError!;
  }

  // Parse guards - validate data structure before processing
  protected validateElectionData(data: any): boolean {
    return data && 
           Array.isArray(data.elections) && 
           Array.isArray(data.deadlines) &&
           data.elections.every((e: any) => e.name && e.source_url);
  }

  protected validateCandidateData(data: any): boolean {
    return data && 
           Array.isArray(data.races) && 
           Array.isArray(data.candidates) &&
           data.candidates.every((c: any) => c.full_name && c.race_id);
  }

  // Normalize provider-specific data to common format
  protected normalizeElection(raw: any): TimetableData['elections'][0] {
    return {
      name: raw.name || raw.title || '',
      scope: raw.scope || raw.type || 'general',
      state_code: raw.state_code || raw.state,
      lga_code: raw.lga_code || raw.lga,
      ward_code: raw.ward_code || raw.ward,
      date_start: raw.date_start || raw.start_date || raw.date,
      date_end: raw.date_end || raw.end_date,
      status: raw.status || 'upcoming',
      source_url: raw.source_url || '',
      source_hash: this.generateChecksum(raw)
    };
  }

  protected normalizeCandidate(raw: any, raceId: string): CandidateData['candidates'][0] {
    return {
      race_id: raceId,
      full_name: raw.full_name || raw.name || '',
      party: raw.party || raw.party_name,
      inec_verified: Boolean(raw.inec_verified || raw.verified),
      photo_url: raw.photo_url || raw.image,
      manifesto_url: raw.manifesto_url || raw.manifesto,
      source_url: raw.source_url || ''
    };
  }
}