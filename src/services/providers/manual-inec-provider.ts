// Manual INEC Data Import Provider
// Handles CSV/JSON uploads and manual data imports with admin validation

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

export interface ImportValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  preview: any[];
  totalRows: number;
  validRows: number;
}

export interface ImportSnapshot {
  id: string;
  timestamp: string;
  type: 'elections' | 'candidates' | 'polling-units' | 'deadlines';
  filename: string;
  rowCount: number;
  userId: string;
  status: 'pending' | 'active' | 'archived';
  description?: string;
}

export class ManualInecProvider extends BaseDataProvider {
  readonly name = 'MANUAL_INEC_IMPORT';
  readonly version = '1.0.0';
  
  private storage: Storage;
  private snapshots: Map<string, ImportSnapshot> = new Map();
  
  constructor(config: DataProviderConfig = { name: 'MANUAL_INEC_IMPORT' }) {
    super(config);
    this.storage = typeof window !== 'undefined' ? window.localStorage : ({} as Storage);
    this.loadSnapshots();
  }
  
  get isAvailable(): boolean {
    return true; // Always available for admin imports
  }

  // Data retrieval methods
  async getElections(filters?: SearchFilters): Promise<DataProviderResponse<Election>> {
    const data = this.getStoredData('elections', filters);
    return {
      data,
      meta: {
        total: data.length,
        source: this.name,
        version: this.version,
        lastSync: await this.getLastSync()
      },
      success: true
    };
  }

  async getRaces(electionId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Race>> {
    let data = this.getStoredData('races', filters);
    
    if (electionId) {
      data = data.filter(race => race.electionId === electionId);
    }
    
    return {
      data,
      meta: {
        total: data.length,
        source: this.name,
        version: this.version,
        lastSync: await this.getLastSync()
      },
      success: true
    };
  }

  async getCandidates(raceId?: string, filters?: SearchFilters): Promise<DataProviderResponse<Candidate>> {
    let data = this.getStoredData('candidates', filters);
    
    if (raceId) {
      data = data.filter(candidate => candidate.races.includes(raceId));
    }
    
    return {
      data,
      meta: {
        total: data.length,
        source: this.name,
        version: this.version,
        lastSync: await this.getLastSync()
      },
      success: true
    };
  }

  async getBallotByDistrict(state: string, lga: string, ward?: string): Promise<DataProviderResponse<BallotByDistrict>> {
    // Implementation would combine races and candidates for the district
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

  async getPollingUnits(filters?: SearchFilters): Promise<DataProviderResponse<PollingUnit>> {
    const data = this.getStoredData('polling-units', filters);
    return {
      data,
      meta: {
        total: data.length,
        source: this.name,
        version: this.version,
        lastSync: await this.getLastSync()
      },
      success: true
    };
  }

  async getDeadlines(filters?: SearchFilters): Promise<DataProviderResponse<Deadline>> {
    const data = this.getStoredData('deadlines', filters);
    return {
      data,
      meta: {
        total: data.length,
        source: this.name,
        version: this.version,
        lastSync: await this.getLastSync()
      },
      success: true
    };
  }

  async getResults(): Promise<DataProviderResponse<ElectionResult>> {
    const data = this.getStoredData('results', {});
    return {
      data,
      meta: {
        total: data.length,
        source: this.name,
        version: this.version
      },
      success: true
    };
  }

  async getNews(): Promise<DataProviderResponse<NewsItem>> {
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

  async getFactChecks(): Promise<DataProviderResponse<FactCheck>> {
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

  // Import methods
  async validateImport(file: File, dataType: string): Promise<ImportValidationResult> {
    const text = await file.text();
    let data: any[];
    
    try {
      if (file.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (file.name.endsWith('.csv')) {
        data = this.parseCSV(text);
      } else {
        throw new Error('Unsupported file format. Use CSV or JSON.');
      }
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`],
        warnings: [],
        preview: [],
        totalRows: 0,
        validRows: 0
      };
    }

    return this.validateData(data, dataType);
  }

  async importData(file: File, dataType: string, description?: string): Promise<ImportSnapshot> {
    const validation = await this.validateImport(file, dataType);
    
    if (!validation.valid) {
      throw new Error(`Import validation failed: ${validation.errors.join(', ')}`);
    }

    const snapshot: ImportSnapshot = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      type: dataType as any,
      filename: file.name,
      rowCount: validation.validRows,
      userId: 'admin', // Would come from auth context
      status: 'pending',
      description
    };

    // Store the data
    const key = `${this.name}_${dataType}_${snapshot.id}`;
    this.storage.setItem(key, await file.text());
    
    // Store the snapshot
    this.snapshots.set(snapshot.id, snapshot);
    this.saveSnapshots();

    return snapshot;
  }

  async activateSnapshot(snapshotId: string): Promise<void> {
    const snapshot = this.snapshots.get(snapshotId);
    if (!snapshot) {
      throw new Error('Snapshot not found');
    }

    // Deactivate current active snapshot
    const currentActive = Array.from(this.snapshots.values())
      .find(s => s.type === snapshot.type && s.status === 'active');
    
    if (currentActive) {
      currentActive.status = 'archived';
      this.snapshots.set(currentActive.id, currentActive);
    }

    // Activate new snapshot
    snapshot.status = 'active';
    this.snapshots.set(snapshotId, snapshot);
    this.saveSnapshots();

    // Update last sync time
    this.storage.setItem(`${this.name}_lastSync`, new Date().toISOString());
  }

  async rollbackSnapshot(dataType: string): Promise<ImportSnapshot | null> {
    const archived = Array.from(this.snapshots.values())
      .filter(s => s.type === dataType && s.status === 'archived')
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (archived.length === 0) {
      return null;
    }

    const previousSnapshot = archived[0];
    await this.activateSnapshot(previousSnapshot.id);
    return previousSnapshot;
  }

  getSnapshots(dataType?: string): ImportSnapshot[] {
    let snapshots = Array.from(this.snapshots.values());
    
    if (dataType) {
      snapshots = snapshots.filter(s => s.type === dataType);
    }
    
    return snapshots.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  // Standard provider methods
  async getLastSync(): Promise<string | null> {
    return this.storage.getItem(`${this.name}_lastSync`);
  }

  async sync(): Promise<{ success: boolean; changes: number; error?: string }> {
    // Manual provider doesn't sync, but we can validate stored data
    try {
      const dataTypes = ['elections', 'candidates', 'polling-units', 'deadlines'];
      let totalChanges = 0;

      for (const dataType of dataTypes) {
        const data = this.getStoredData(dataType, {});
        totalChanges += data.length;
      }

      return { success: true, changes: totalChanges };
    } catch (error) {
      return { 
        success: false, 
        changes: 0, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async checkHealth(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    const start = Date.now();
    
    try {
      // Check if we can access storage and snapshots
      this.loadSnapshots();
      const latency = Date.now() - start;
      
      return { healthy: true, latency };
    } catch (error) {
      return { 
        healthy: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Private helper methods
  private getStoredData(dataType: string, filters?: SearchFilters): any[] {
    const activeSnapshot = Array.from(this.snapshots.values())
      .find(s => s.type === dataType && s.status === 'active');

    if (!activeSnapshot) {
      return [];
    }

    const key = `${this.name}_${dataType}_${activeSnapshot.id}`;
    const rawData = this.storage.getItem(key);
    
    if (!rawData) {
      return [];
    }

    try {
      let data = JSON.parse(rawData);
      
      if (typeof data === 'string') {
        // Handle CSV data
        data = this.parseCSV(data);
      }

      return this.applyFilters(data, filters);
    } catch {
      return [];
    }
  }

  private parseCSV(csvText: string): any[] {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      const row: any = {};
      
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      
      data.push(row);
    }

    return data;
  }

  private validateData(data: any[], dataType: string): ImportValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let validRows = 0;

    // Basic validation
    if (!Array.isArray(data)) {
      errors.push('Data must be an array');
      return {
        valid: false,
        errors,
        warnings,
        preview: [],
        totalRows: 0,
        validRows: 0
      };
    }

    // Type-specific validation
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowErrors = this.validateRow(row, dataType, i + 1);
      
      if (rowErrors.length === 0) {
        validRows++;
      } else {
        errors.push(...rowErrors);
      }
    }

    const valid = errors.length === 0 && validRows > 0;

    return {
      valid,
      errors,
      warnings,
      preview: data.slice(0, 5), // First 5 rows for preview
      totalRows: data.length,
      validRows
    };
  }

  private validateRow(row: any, dataType: string, rowNumber: number): string[] {
    const errors: string[] = [];

    switch (dataType) {
      case 'elections':
        if (!row.name) errors.push(`Row ${rowNumber}: Missing election name`);
        if (!row.date) errors.push(`Row ${rowNumber}: Missing election date`);
        if (!row.type) errors.push(`Row ${rowNumber}: Missing election type`);
        break;
        
      case 'candidates':
        if (!row.name) errors.push(`Row ${rowNumber}: Missing candidate name`);
        if (!row.party) errors.push(`Row ${rowNumber}: Missing party`);
        break;
        
      case 'polling-units':
        if (!row.name) errors.push(`Row ${rowNumber}: Missing polling unit name`);
        if (!row.code) errors.push(`Row ${rowNumber}: Missing polling unit code`);
        if (!row.ward) errors.push(`Row ${rowNumber}: Missing ward`);
        if (!row.lga) errors.push(`Row ${rowNumber}: Missing LGA`);
        if (!row.state) errors.push(`Row ${rowNumber}: Missing state`);
        break;
    }

    return errors;
  }

  private applyFilters(data: any[], filters?: SearchFilters): any[] {
    if (!filters) return data;

    return data.filter(item => {
      if (filters.state && item.state && item.state !== filters.state) return false;
      if (filters.lga && item.lga && item.lga !== filters.lga) return false;
      if (filters.ward && item.ward && item.ward !== filters.ward) return false;
      if (filters.verified !== undefined && item.verified !== filters.verified) return false;
      
      return true;
    });
  }

  private loadSnapshots(): void {
    try {
      const snapshotsJson = this.storage.getItem(`${this.name}_snapshots`);
      if (snapshotsJson) {
        const snapshots = JSON.parse(snapshotsJson);
        this.snapshots.clear();
        
        for (const snapshot of snapshots) {
          this.snapshots.set(snapshot.id, snapshot);
        }
      }
    } catch (error) {
      console.warn('Failed to load snapshots:', error);
      this.snapshots.clear();
    }
  }

  private saveSnapshots(): void {
    try {
      const snapshots = Array.from(this.snapshots.values());
      this.storage.setItem(`${this.name}_snapshots`, JSON.stringify(snapshots));
    } catch (error) {
      console.warn('Failed to save snapshots:', error);
    }
  }

  private generateId(): string {
    return `import_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}