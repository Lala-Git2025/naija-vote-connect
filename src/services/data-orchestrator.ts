// Data Orchestrator - Coordinates all source adapters with precedence rules
// Implements explicit source precedence and validation workflows

import { INECAdapter } from './source-adapters/inec-adapter';
import { ManifestoNGAdapter } from './source-adapters/manifesto-ng-adapter';
import { DubawaAdapter } from './source-adapters/dubawa-adapter';
import { PartyWebsiteAdapter } from './source-adapters/party-website-adapter';
import { ragService } from './rag-service';
import { supabase } from '@/integrations/supabase/client';

export interface SyncReport {
  source: string;
  sync_type: 'candidates' | 'manifestos' | 'fact_checks';
  status: 'success' | 'error';
  created: number;
  updated: number;
  errors: string[];
  duration_ms: number;
}

export interface ConflictReport {
  candidate_id: string;
  candidate_name: string;
  conflicts: {
    field: string;
    inec_value: any;
    other_value: any;
    other_source: string;
  }[];
}

export class DataOrchestrator {
  private adapters: {
    inec: INECAdapter;
    manifestoNG: ManifestoNGAdapter;
    dubawa: DubawaAdapter;
    partyWebsites: PartyWebsiteAdapter;
  };

  constructor() {
    this.adapters = {
      inec: new INECAdapter(),
      manifestoNG: new ManifestoNGAdapter(),
      dubawa: new DubawaAdapter(),
      partyWebsites: new PartyWebsiteAdapter()
    };
  }

  // Full data sync with precedence enforcement
  async performFullSync(): Promise<SyncReport[]> {
    const reports: SyncReport[] = [];
    
    console.log('Starting comprehensive data sync...');

    // Step 1: Sync INEC candidates (highest priority)
    reports.push(await this.syncWithReport('inec', 'candidates', async () => {
      return await this.adapters.inec.syncCandidates();
    }));

    // Step 2: Sync manifestos (co-equal priority for Manifesto.NG and party websites)
    reports.push(await this.syncWithReport('manifesto-ng', 'manifestos', async () => {
      return await this.adapters.manifestoNG.syncManifestos();
    }));

    reports.push(await this.syncWithReport('party-websites', 'manifestos', async () => {
      return await this.adapters.partyWebsites.syncPartyManifestos();
    }));

    // Step 3: Sync fact-checks (annotation only, never modifies core data)
    reports.push(await this.syncWithReport('dubawa', 'fact_checks', async () => {
      return await this.adapters.dubawa.syncFactChecks();
    }));

    // Step 4: Update embeddings for new/changed manifestos
    reports.push(await this.syncWithReport('rag-embeddings', 'manifestos', async () => {
      return await ragService.updateAllEmbeddings();
    }));

    console.log('Full sync completed');
    await this.logSyncRun(reports);

    return reports;
  }

  // Incremental sync (daily/hourly updates)
  async performIncrementalSync(sources?: string[]): Promise<SyncReport[]> {
    const reports: SyncReport[] = [];
    const syncSources = sources || ['inec', 'manifesto-ng', 'dubawa'];

    console.log(`Starting incremental sync for: ${syncSources.join(', ')}`);

    for (const source of syncSources) {
      switch (source) {
        case 'inec':
          reports.push(await this.syncWithReport('inec', 'candidates', async () => {
            return await this.adapters.inec.syncCandidates();
          }));
          break;

        case 'manifesto-ng':
          reports.push(await this.syncWithReport('manifesto-ng', 'manifestos', async () => {
            return await this.adapters.manifestoNG.syncManifestos();
          }));
          break;

        case 'dubawa':
          reports.push(await this.syncWithReport('dubawa', 'fact_checks', async () => {
            return await this.adapters.dubawa.syncFactChecks();
          }));
          break;

        case 'party-websites':
          reports.push(await this.syncWithReport('party-websites', 'manifestos', async () => {
            return await this.adapters.partyWebsites.syncPartyManifestos();
          }));
          break;
      }
    }

    await this.logSyncRun(reports);
    return reports;
  }

  // Detect and report data conflicts (INEC vs other sources)
  async generateConflictReport(): Promise<ConflictReport[]> {
    const conflicts: ConflictReport[] = [];

    const { data: candidates } = await supabase
      .from('candidates')
      .select('*')
      .not('external_id_inec', 'is', null);

    if (!candidates) return conflicts;

    for (const candidate of candidates) {
      const candidateConflicts: ConflictReport = {
        candidate_id: candidate.id,
        candidate_name: candidate.name,
        conflicts: []
      };

      // Check for conflicts with non-INEC sourced candidates
      const { data: duplicates } = await supabase
        .from('candidates')
        .select('*')
        .eq('normalized_name', candidate.normalized_name)
        .eq('party_code', candidate.party_code)
        .neq('id', candidate.id);

      if (duplicates && duplicates.length > 0) {
        for (const duplicate of duplicates) {
          // Compare key fields and report conflicts
          const fieldsToCheck = ['name', 'office', 'constituency', 'state'];
          
          for (const field of fieldsToCheck) {
            if (candidate[field] !== duplicate[field]) {
              candidateConflicts.conflicts.push({
                field,
                inec_value: candidate[field],
                other_value: duplicate[field],
                other_source: duplicate.bio_source || 'unknown'
              });
            }
          }
        }
      }

      if (candidateConflicts.conflicts.length > 0) {
        conflicts.push(candidateConflicts);
      }
    }

    return conflicts;
  }

  // Find orphaned manifestos (no matching candidate)
  async findOrphanedManifestos(): Promise<any[]> {
    const { data: orphans } = await supabase
      .from('manifestos')
      .select(`
        id,
        party_code,
        source,
        source_url,
        created_at
      `)
      .is('candidate_id', null);

    return orphans || [];
  }

  // Generate coverage report (completeness by office)
  async generateCoverageReport(): Promise<any[]> {
    // Simple coverage query - in production would be a database function
    const { data: coverage } = await supabase
      .from('candidates')
      .select('office, party_code')
      .order('office');
    
    return coverage || [];
  }

  // Validate data integrity
  async validateDataIntegrity(): Promise<{
    missing_parties: string[];
    invalid_records: any[];
    orphaned_manifestos: number;
    conflicts: number;
  }> {
    // Check for candidates with invalid party codes
    const { data: invalidParties } = await supabase
      .from('candidates')
      .select('party_code')
      .not('party_code', 'in', '(APC,PDP,LP,NNPP,APGA,YPP,SDP,ADC,AA,ACCORD)');

    // Check for records missing required fields
    const { data: invalidCandidates } = await supabase
      .from('candidates')
      .select('id, name, party, office')
      .or('name.is.null,party.is.null,office.is.null');

    const orphans = await this.findOrphanedManifestos();
    const conflicts = await this.generateConflictReport();

    return {
      missing_parties: [...new Set(invalidParties?.map(p => p.party_code) || [])],
      invalid_records: invalidCandidates || [],
      orphaned_manifestos: orphans.length,
      conflicts: conflicts.length
    };
  }

  // Helper method to wrap sync operations with reporting
  private async syncWithReport(
    source: string, 
    syncType: 'candidates' | 'manifestos' | 'fact_checks',
    operation: () => Promise<{ created: number; updated: number; errors: string[] }>
  ): Promise<SyncReport> {
    const startTime = Date.now();
    
    try {
      const result = await operation();
      
      return {
        source,
        sync_type: syncType,
        status: 'success',
        created: result.created,
        updated: result.updated,
        errors: result.errors,
        duration_ms: Date.now() - startTime
      };
    } catch (error) {
      return {
        source,
        sync_type: syncType,
        status: 'error',
        created: 0,
        updated: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        duration_ms: Date.now() - startTime
      };
    }
  }

  // Log sync run to database
  private async logSyncRun(reports: SyncReport[]): Promise<void> {
    const totalCreated = reports.reduce((sum, r) => sum + r.created, 0);
    const totalUpdated = reports.reduce((sum, r) => sum + r.updated, 0);
    const allErrors = reports.flatMap(r => r.errors);
    
    await supabase.from('sync_runs').insert({
      provider: 'inec_api', // Use existing enum value
      sync_type: 'comprehensive',
      status: allErrors.length > 0 ? 'completed' : 'completed',
      records_created: totalCreated,
      records_updated: totalUpdated,
      error_message: allErrors.length > 0 ? allErrors.join('; ') : null,
      metadata: JSON.parse(JSON.stringify({ reports })) // Convert to proper JSON
    });
  }
}

// Export singleton instance
export const dataOrchestrator = new DataOrchestrator();