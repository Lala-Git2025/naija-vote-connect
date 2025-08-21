// Election Service - Main service layer for CivicLens
// Initializes data providers and provides a unified interface

import { dataProviderRegistry } from '@/services/data-provider';
import { InecProvider } from '@/services/providers/inec-provider';
import { MockProvider } from '@/services/providers/mock-provider';
import { ManualInecProvider } from '@/services/providers/manual-inec-provider';
import { CivicFeedsProvider } from '@/services/providers/civic-feeds-provider';
import { FactCheckProvider } from '@/services/providers/fact-check-provider';
import { syncService } from '@/services/sync-service';
import { dataOrchestrator } from '@/services/data-orchestrator';

// Initialize data providers
export function initializeDataProviders() {
  // Register mock provider (always available for development)
  const mockProvider = new MockProvider();
  dataProviderRegistry.register(mockProvider);
  
  // Register INEC provider (production ready)
  const inecProvider = new InecProvider({
    name: 'INEC_OFFICIAL',
    rateLimit: {
      requests: 100,
      windowMs: 60000 // 100 requests per minute
    },
    retryConfig: {
      maxRetries: 3,
      backoffMs: 1000
    }
  });
  
  dataProviderRegistry.register(inecProvider, true); // Set as primary
  
  console.log('CivicLens data providers initialized');
}

// Call initialization
initializeDataProviders();

// Start automated sync service
console.log('Starting automated sync service...');
syncService.start();

// Start comprehensive data integration
console.log('Starting comprehensive data integration...');
dataOrchestrator.performIncrementalSync(['inec', 'dubawa']);