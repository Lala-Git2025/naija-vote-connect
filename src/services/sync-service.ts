// Background Sync Service for CivicLens
// Manages scheduled and on-demand data synchronization

import { dataProviderRegistry } from '@/services/data-provider';

export interface SyncStats {
  provider: string;
  lastSync: string | null;
  success: boolean;
  changes: number;
  duration: number;
  error?: string;
}

export interface SyncConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxRetries: number;
  parallelProviders: boolean;
}

export class SyncService {
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;
  private isRunning = false;
  private listeners: ((stats: SyncStats[]) => void)[] = [];

  constructor(config: SyncConfig = {
    enabled: true,
    intervalMinutes: 60,
    maxRetries: 3,
    parallelProviders: true
  }) {
    this.config = config;
  }

  start(): void {
    if (this.syncTimer || !this.config.enabled) return;

    console.log(`Starting sync service with ${this.config.intervalMinutes}min interval`);
    
    // Initial sync
    this.syncNow();
    
    // Schedule periodic syncs
    this.syncTimer = setInterval(() => {
      this.syncNow();
    }, this.config.intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
      console.log('Sync service stopped');
    }
  }

  async syncNow(): Promise<SyncStats[]> {
    if (this.isRunning) {
      console.log('Sync already in progress, skipping');
      return [];
    }

    this.isRunning = true;
    const startTime = Date.now();
    const providers = dataProviderRegistry.getAvailable();
    const stats: SyncStats[] = [];

    console.log(`Starting sync for ${providers.length} providers`);

    try {
      if (this.config.parallelProviders) {
        // Sync all providers in parallel
        const syncPromises = providers.map(provider => this.syncProvider(provider.name));
        const results = await Promise.allSettled(syncPromises);
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            stats.push(result.value);
          } else {
            stats.push({
              provider: providers[index].name,
              lastSync: null,
              success: false,
              changes: 0,
              duration: Date.now() - startTime,
              error: result.reason?.message || 'Unknown error'
            });
          }
        });
      } else {
        // Sync providers sequentially
        for (const provider of providers) {
          try {
            const stat = await this.syncProvider(provider.name);
            stats.push(stat);
          } catch (error) {
            stats.push({
              provider: provider.name,
              lastSync: null,
              success: false,
              changes: 0,
              duration: Date.now() - startTime,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
      }
    } finally {
      this.isRunning = false;
      const totalDuration = Date.now() - startTime;
      console.log(`Sync completed in ${totalDuration}ms`);
      
      // Notify listeners
      this.listeners.forEach(listener => listener(stats));
    }

    return stats;
  }

  private async syncProvider(providerName: string): Promise<SyncStats> {
    const startTime = Date.now();
    const provider = dataProviderRegistry.get(providerName);
    
    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    console.log(`Syncing ${providerName}...`);
    
    try {
      const result = await provider.sync();
      const lastSync = await provider.getLastSync();
      
      return {
        provider: providerName,
        lastSync,
        success: result.success,
        changes: result.changes,
        duration: Date.now() - startTime,
        error: result.error
      };
    } catch (error) {
      return {
        provider: providerName,
        lastSync: null,
        success: false,
        changes: 0,
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  onSyncComplete(listener: (stats: SyncStats[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  getConfig(): SyncConfig {
    return { ...this.config };
  }

  updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };
    
    if (this.syncTimer && config.intervalMinutes) {
      this.stop();
      this.start();
    }
  }

  getStatus(): { isRunning: boolean; nextSync: Date | null } {
    return {
      isRunning: this.isRunning,
      nextSync: this.syncTimer ? 
        new Date(Date.now() + this.config.intervalMinutes * 60 * 1000) : 
        null
    };
  }
}

// Global sync service instance
export const syncService = new SyncService();