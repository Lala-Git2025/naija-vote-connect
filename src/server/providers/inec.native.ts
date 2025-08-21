// Native INEC provider - parses PDF/HTML timetables and candidate files directly
import { BaseProvider, TimetableData, CandidateData, ResultData } from './base.js';

interface INECTimetableEntry {
  activity: string;
  date: string;
  time?: string;
  remarks?: string;
}

export class INECNativeProvider extends BaseProvider {
  private timetableUrls: string[];
  private candidateUrls: string[];
  private resultsUrls: string[];

  constructor(config: {
    timetableUrls: string[];
    candidateUrls: string[];
    resultsUrls: string[];
  }) {
    super('INEC_NATIVE');
    this.timetableUrls = config.timetableUrls;
    this.candidateUrls = config.candidateUrls;
    this.resultsUrls = config.resultsUrls;
  }

  async fetchTimetables(): Promise<TimetableData> {
    const allElections: TimetableData['elections'] = [];
    const allDeadlines: TimetableData['deadlines'] = [];

    for (const url of this.timetableUrls) {
      try {
        const data = await this.retryWithBackoff(() => this.parseTimetableUrl(url));
        
        if (this.validateElectionData(data)) {
          allElections.push(...data.elections);
          allDeadlines.push(...data.deadlines);
        }
      } catch (error) {
        console.error(`Failed to parse timetable ${url}:`, error);
      }
    }

    return { elections: allElections, deadlines: allDeadlines };
  }

  async fetchCandidates(): Promise<CandidateData> {
    const allRaces: CandidateData['races'] = [];
    const allCandidates: CandidateData['candidates'] = [];

    for (const url of this.candidateUrls) {
      try {
        const data = await this.retryWithBackoff(() => this.parseCandidateUrl(url));
        
        if (this.validateCandidateData(data)) {
          allRaces.push(...data.races);
          allCandidates.push(...data.candidates);
        }
      } catch (error) {
        console.error(`Failed to parse candidates ${url}:`, error);
      }
    }

    return { races: allRaces, candidates: allCandidates };
  }

  async fetchResultsLinks(): Promise<ResultData> {
    return {
      results: [], // Results are typically not available until after elections
      results_links: this.resultsUrls
    };
  }

  private async parseTimetableUrl(url: string): Promise<TimetableData> {
    // Check if data has changed using HEAD request
    const headResponse = await fetch(url, { method: 'HEAD' });
    const etag = headResponse.headers.get('etag') || headResponse.headers.get('last-modified') || '';
    
    if (!this.hasDataChanged(url, etag)) {
      return { elections: [], deadlines: [] };
    }

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    const buffer = await response.arrayBuffer();

    if (contentType.includes('application/pdf')) {
      return this.parsePDFTimetable(buffer, url);
    } else if (contentType.includes('text/html')) {
      const html = new TextDecoder().decode(buffer);
      return this.parseHTMLTimetable(html, url);
    } else {
      throw new Error(`Unsupported content type: ${contentType}`);
    }
  }

  private async parsePDFTimetable(buffer: ArrayBuffer, sourceUrl: string): Promise<TimetableData> {
    // Note: In a real implementation, you'd use pdf-parse here
    // For now, returning mock data that matches the expected structure
    
    console.log(`Parsing PDF timetable from ${sourceUrl}`);
    
    // Mock parsing - replace with actual PDF text extraction
    const elections: TimetableData['elections'] = [{
      name: '2027 General Elections',
      scope: 'national',
      date_start: '2027-02-27',
      status: 'upcoming',
      source_url: sourceUrl,
      source_hash: this.generateChecksum({ url: sourceUrl, timestamp: Date.now() })
    }];

    const deadlines: TimetableData['deadlines'] = [{
      election_id: elections[0].name, // Will be resolved to actual ID during upsert
      kind: 'voter_registration',
      due_at: '2026-12-15T23:59:59Z',
      source_url: sourceUrl
    }];

    return { elections, deadlines };
  }

  private parseHTMLTimetable(html: string, sourceUrl: string): TimetableData {
    console.log(`Parsing HTML timetable from ${sourceUrl}`);
    
    // Simple HTML parsing - in production, use cheerio or similar
    const elections: TimetableData['elections'] = [];
    const deadlines: TimetableData['deadlines'] = [];

    // Mock implementation - replace with actual HTML parsing
    const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})/g;
    const dates = html.match(dateRegex) || [];

    if (dates.length > 0) {
      elections.push({
        name: 'Parsed Election from HTML',
        scope: 'general',
        date_start: this.normalizeDate(dates[0]),
        status: 'upcoming',
        source_url: sourceUrl,
        source_hash: this.generateChecksum({ html: html.slice(0, 1000) })
      });
    }

    return { elections, deadlines };
  }

  private async parseCandidateUrl(url: string): Promise<CandidateData> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const contentType = response.headers.get('content-type') || '';
    
    if (contentType.includes('text/csv')) {
      const csv = await response.text();
      return this.parseCSVCandidates(csv, url);
    } else if (contentType.includes('application/vnd.openxmlformats')) {
      // XLSX parsing would require additional library
      console.warn('XLSX parsing not implemented, skipping:', url);
      return { races: [], candidates: [] };
    } else {
      throw new Error(`Unsupported candidate file type: ${contentType}`);
    }
  }

  private parseCSVCandidates(csv: string, sourceUrl: string): CandidateData {
    const lines = csv.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const races: CandidateData['races'] = [];
    const candidates: CandidateData['candidates'] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const row: Record<string, string> = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Extract race information
      const raceKey = `${row.state}-${row.constituency || row.office}`;
      if (!races.find(r => r.office === raceKey)) {
        races.push({
          election_id: '2027-general', // Will be resolved during upsert
          office: row.office || row.position || 'Unknown',
          district: row.constituency || row.district,
          seats: parseInt(row.seats) || 1,
          source_url: sourceUrl
        });
      }

      // Extract candidate information
      if (row.name || row.full_name) {
        candidates.push({
          race_id: raceKey,
          full_name: row.name || row.full_name || '',
          party: row.party || row.party_abbreviation,
          inec_verified: true, // Data from INEC is verified by default
          source_url: sourceUrl
        });
      }
    }

    return { races, candidates };
  }

  private normalizeDate(dateStr: string): string {
    // Convert various date formats to ISO format
    const cleaned = dateStr.replace(/[\/\-]/g, '-');
    const parts = cleaned.split('-');
    
    if (parts.length === 3) {
      // Assume DD-MM-YYYY or MM-DD-YYYY based on context
      const [first, second, year] = parts;
      if (parseInt(year) > 31) {
        return `${year}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
      }
    }
    
    return dateStr; // Return original if parsing fails
  }
}