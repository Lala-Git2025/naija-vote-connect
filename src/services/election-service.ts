// Election Service - Main service layer for CivicLens
// Initializes data providers and provides a unified interface

import { dataProviderRegistry } from '@/services/data-provider';
import { InecProvider } from '@/services/providers/inec-provider';
import { MockProvider } from '@/services/providers/mock-provider';

// Initialize data providers
export function initializeDataProviders() {
  // Register mock provider (always available for development)
  const mockProvider = new MockProvider();
  dataProviderRegistry.register(mockProvider);
  
  // Register INEC provider (production ready)
  const inecProvider = new InecProvider({
    name: 'INEC_OFFICIAL',
    fallbackMode: 'manual', // Start with manual mode
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