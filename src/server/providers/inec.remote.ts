// Remote INEC provider - fallback to Replit API
import { BaseProvider, TimetableData, CandidateData, ResultData } from './base.js';

interface ReplitElection {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
  states?: string[];
}

interface ReplitRace {
  id: string;
  election_id: string;
  name: string;
  office: string;
  constituency?: string;
  state?: string;
}

interface ReplitCandidate {
  id: string;
  name: string;
  party: string;
  race_id: string;
  verified?: boolean;
  photo?: string;
}

export class INECRemoteProvider extends BaseProvider {
  private apiBase: string;
  private apiKey?: string;

  constructor(config: { apiBase: string; apiKey?: string }) {
    super('INEC_REMOTE');
    this.apiBase = config.apiBase.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
  }

  async fetchTimetables(): Promise<TimetableData> {
    const elections = await this.retryWithBackoff(() => 
      this.apiCall<ReplitElection[]>('/elections')
    );

    const deadlines = await this.retryWithBackoff(() =>
      this.apiCall<any[]>('/deadlines')
    );

    return {
      elections: elections.map(e => this.normalizeElection({
        name: e.name,
        scope: e.type,
        date_start: e.date,
        status: e.status,
        states: e.states,
        source_url: `${this.apiBase}/elections/${e.id}`
      })),
      deadlines: deadlines.map(d => ({
        election_id: d.election_id,
        kind: d.type || d.kind,
        due_at: d.due_date || d.deadline,
        source_url: `${this.apiBase}/deadlines/${d.id}`
      }))
    };
  }

  async fetchCandidates(): Promise<CandidateData> {
    const races = await this.retryWithBackoff(() =>
      this.apiCall<ReplitRace[]>('/races')
    );

    const allCandidates: ReplitCandidate[] = [];
    
    // Fetch candidates for each race
    for (const race of races) {
      try {
        const candidates = await this.retryWithBackoff(() =>
          this.apiCall<ReplitCandidate[]>(`/candidates?race=${race.id}`)
        );
        allCandidates.push(...candidates);
      } catch (error) {
        console.warn(`Failed to fetch candidates for race ${race.id}:`, error);
      }
    }

    return {
      races: races.map(r => ({
        election_id: r.election_id,
        office: r.office,
        district: r.constituency,
        seats: 1, // Default, API doesn't provide this
        source_url: `${this.apiBase}/races/${r.id}`
      })),
      candidates: allCandidates.map(c => this.normalizeCandidate({
        full_name: c.name,
        party: c.party,
        inec_verified: Boolean(c.verified),
        photo_url: c.photo,
        source_url: `${this.apiBase}/candidates/${c.id}`
      }, c.race_id))
    };
  }

  async fetchResultsLinks(): Promise<ResultData> {
    try {
      const results = await this.retryWithBackoff(() =>
        this.apiCall<any[]>('/results')
      );

      return {
        results: results.map(r => ({
          election_id: r.election_id,
          race_id: r.race_id,
          pu_code: r.polling_unit,
          party: r.party,
          votes: parseInt(r.votes) || 0,
          source_url: `${this.apiBase}/results/${r.id}`,
          captured_at: r.timestamp || new Date().toISOString()
        })),
        results_links: [`${this.apiBase}/results`]
      };
    } catch (error) {
      console.warn('Failed to fetch results from remote API:', error);
      return { results: [], results_links: [] };
    }
  }

  private async apiCall<T>(endpoint: string): Promise<T> {
    const url = `${this.apiBase}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limited by remote API');
      }
      throw new Error(`Remote API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }
}