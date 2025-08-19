// React hooks for managing election data in CivicLens
// Provides easy access to elections, candidates, and ballot information

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dataProviderRegistry } from '@/services/data-provider';
import { 
  Election, 
  Race, 
  Candidate, 
  BallotByDistrict, 
  Deadline, 
  PollingUnit,
  SearchFilters,
  ComparisonCandidate 
} from '@/types/election';

// Query keys for consistent caching
export const QUERY_KEYS = {
  elections: (filters?: SearchFilters) => ['elections', filters],
  races: (electionId?: string, filters?: SearchFilters) => ['races', electionId, filters],
  candidates: (raceId?: string, filters?: SearchFilters) => ['candidates', raceId, filters],
  ballotByDistrict: (state: string, lga: string, ward?: string) => ['ballot', state, lga, ward],
  pollingUnits: (filters?: SearchFilters) => ['polling-units', filters],
  deadlines: (filters?: SearchFilters) => ['deadlines', filters],
  providerHealth: () => ['provider-health']
};

// Hook for getting all elections
export function useElections(filters?: SearchFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.elections(filters),
    queryFn: async () => {
      const provider = dataProviderRegistry.get();
      if (!provider) throw new Error('No data provider available');
      return provider.getElections(filters);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook for getting races for a specific election
export function useRaces(electionId?: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.races(electionId, filters),
    queryFn: async () => {
      const provider = dataProviderRegistry.get();
      if (!provider) throw new Error('No data provider available');
      return provider.getRaces(electionId, filters);
    },
    enabled: !!electionId || !filters || Object.keys(filters).length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting candidates for a specific race
export function useCandidates(raceId?: string, filters?: SearchFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.candidates(raceId, filters),
    queryFn: async () => {
      const provider = dataProviderRegistry.get();
      if (!provider) throw new Error('No data provider available');
      return provider.getCandidates(raceId, filters);
    },
    enabled: !!raceId || !filters || Object.keys(filters).length > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

// Hook for getting ballot information by district
export function useBallotByDistrict(state: string, lga: string, ward?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ballotByDistrict(state, lga, ward),
    queryFn: async () => {
      const provider = dataProviderRegistry.get();
      if (!provider) throw new Error('No data provider available');
      return provider.getBallotByDistrict(state, lga, ward);
    },
    enabled: !!(state && lga),
    staleTime: 10 * 60 * 1000, // 10 minutes for ballot data
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Hook for getting polling units
export function usePollingUnits(filters?: SearchFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.pollingUnits(filters),
    queryFn: async () => {
      const provider = dataProviderRegistry.get();
      if (!provider) throw new Error('No data provider available');
      return provider.getPollingUnits(filters);
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000,
  });
}

// Hook for getting important deadlines
export function useDeadlines(filters?: SearchFilters) {
  return useQuery({
    queryKey: QUERY_KEYS.deadlines(filters),
    queryFn: async () => {
      const provider = dataProviderRegistry.get();
      if (!provider) throw new Error('No data provider available');
      return provider.getDeadlines(filters);
    },
    staleTime: 30 * 60 * 1000, // 30 minutes for deadlines
    gcTime: 60 * 60 * 1000, // 1 hour
  });
}

// Hook for checking data provider health
export function useProviderHealth() {
  return useQuery({
    queryKey: QUERY_KEYS.providerHealth(),
    queryFn: async () => {
      const providers = dataProviderRegistry.getAll();
      const healthChecks = await Promise.all(
        providers.map(async (provider) => ({
          name: provider.name,
          version: provider.version,
          ...(await provider.checkHealth())
        }))
      );
      return healthChecks;
    },
    refetchInterval: 2 * 60 * 1000, // Check health every 2 minutes
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000,
  });
}

// Hook for candidate comparison functionality
export function useCandidateComparison() {
  const [comparisonCandidates, setComparisonCandidates] = useState<ComparisonCandidate[]>([]);
  const queryClient = useQueryClient();
  
  const addToComparison = useCallback((candidate: Candidate, race?: Race) => {
    const comparisonKey = `${candidate.id}-${race?.id || 'no-race'}`;
    const comparisonCandidate: ComparisonCandidate = {
      ...candidate,
      comparisonKey,
      selectedRace: race
    };
    
    setComparisonCandidates(prev => {
      const exists = prev.find(c => c.comparisonKey === comparisonKey);
      if (exists) return prev;
      
      // Limit to 4 candidates for comparison
      if (prev.length >= 4) {
        return [...prev.slice(1), comparisonCandidate];
      }
      
      return [...prev, comparisonCandidate];
    });
  }, []);
  
  const removeFromComparison = useCallback((comparisonKey: string) => {
    setComparisonCandidates(prev => prev.filter(c => c.comparisonKey !== comparisonKey));
  }, []);
  
  const clearComparison = useCallback(() => {
    setComparisonCandidates([]);
  }, []);
  
  const isInComparison = useCallback((candidateId: string, raceId?: string) => {
    const comparisonKey = `${candidateId}-${raceId || 'no-race'}`;
    return comparisonCandidates.some(c => c.comparisonKey === comparisonKey);
  }, [comparisonCandidates]);
  
  return {
    comparisonCandidates,
    addToComparison,
    removeFromComparison,
    clearComparison,
    isInComparison,
    canAddMore: comparisonCandidates.length < 4
  };
}

// Hook for user's location-based data
export function useUserLocation() {
  const [userLocation, setUserLocation] = useState<{
    state?: string;
    lga?: string;
    ward?: string;
  }>({});
  
  useEffect(() => {
    // Load user location from localStorage
    const savedLocation = localStorage.getItem('civicLens_user_location');
    if (savedLocation) {
      try {
        setUserLocation(JSON.parse(savedLocation));
      } catch (error) {
        console.error('Failed to parse saved location:', error);
      }
    }
  }, []);
  
  const updateLocation = useCallback((location: { state?: string; lga?: string; ward?: string }) => {
    setUserLocation(location);
    localStorage.setItem('civicLens_user_location', JSON.stringify(location));
    
    // Invalidate related queries when location changes
    const queryClient = useQueryClient();
    queryClient.invalidateQueries({ queryKey: ['ballot'] });
    queryClient.invalidateQueries({ queryKey: ['polling-units'] });
    queryClient.invalidateQueries({ queryKey: ['deadlines'] });
  }, []);
  
  // Get user's ballot based on their location
  const userBallot = useBallotByDistrict(
    userLocation.state || '',
    userLocation.lga || '',
    userLocation.ward
  );
  
  return {
    userLocation,
    updateLocation,
    userBallot,
    hasLocation: !!(userLocation.state && userLocation.lga)
  };
}

// Hook for data synchronization
export function useDataSync() {
  const [syncStatus, setSyncStatus] = useState<{
    isLoading: boolean;
    lastSync?: string;
    error?: string;
  }>({ isLoading: false });
  
  const queryClient = useQueryClient();
  
  const syncData = useCallback(async () => {
    setSyncStatus({ isLoading: true });
    
    try {
      const provider = dataProviderRegistry.get();
      if (!provider) throw new Error('No data provider available');
      
      const result = await provider.sync();
      
      if (result.success) {
        // Invalidate all queries to refetch with new data
        await queryClient.invalidateQueries();
        
        setSyncStatus({
          isLoading: false,
          lastSync: new Date().toISOString()
        });
      } else {
        setSyncStatus({
          isLoading: false,
          error: result.error || 'Sync failed'
        });
      }
      
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown sync error';
      setSyncStatus({
        isLoading: false,
        error: errorMessage
      });
      throw error;
    }
  }, [queryClient]);
  
  const getLastSync = useCallback(async () => {
    try {
      const provider = dataProviderRegistry.get();
      if (!provider) return null;
      
      return await provider.getLastSync();
    } catch (error) {
      console.error('Failed to get last sync time:', error);
      return null;
    }
  }, []);
  
  return {
    syncStatus,
    syncData,
    getLastSync
  };
}