// Geocoding service for ballot location lookup
// Maps addresses to Nigerian LGA/Ward/Polling Unit data

import { supabase } from '@/integrations/supabase/client';

export interface LocationLookupResult {
  state: string;
  lga: string;
  ward: string;
  pollingUnits: Array<{
    id: string;
    name: string;
    code: string;
    address: string;
    distance?: number;
  }>;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface GeocodeCache {
  address: string;
  result: LocationLookupResult;
  timestamp: number;
}

class GeocodingService {
  private cache: Map<string, GeocodeCache> = new Map();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  async resolveAddress(address: string): Promise<LocationLookupResult | null> {
    // Check cache first
    const cached = this.getCachedResult(address);
    if (cached) {
      return cached.result;
    }

    try {
      // First, try to match against existing polling unit addresses
      const exactMatch = await this.findExactMatch(address);
      if (exactMatch) {
        this.setCacheResult(address, exactMatch);
        return exactMatch;
      }

      // If no exact match, try fuzzy matching
      const fuzzyMatch = await this.findFuzzyMatch(address);
      if (fuzzyMatch) {
        this.setCacheResult(address, fuzzyMatch);
        return fuzzyMatch;
      }

      // Last resort: parse address components and find nearest matches
      const parsed = await this.parseAddressComponents(address);
      if (parsed) {
        this.setCacheResult(address, parsed);
        return parsed;
      }

      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  private async findExactMatch(address: string): Promise<LocationLookupResult | null> {
    const { data: pollingUnits, error } = await supabase
      .from('polling_units')
      .select('*')
      .ilike('address', `%${address}%`)
      .limit(5);

    if (error || !pollingUnits?.length) {
      return null;
    }

    const firstUnit = pollingUnits[0];
    return {
      state: firstUnit.state,
      lga: firstUnit.lga,
      ward: firstUnit.ward,
      pollingUnits: pollingUnits.map(pu => ({
        id: pu.id,
        name: pu.name,
        code: pu.code,
        address: pu.address || ''
      })),
      coordinates: {
        lat: firstUnit.latitude ? parseFloat(String(firstUnit.latitude)) : 6.5244,
        lng: firstUnit.longitude ? parseFloat(String(firstUnit.longitude)) : 3.3792
      }
    };
  }

  private async findFuzzyMatch(address: string): Promise<LocationLookupResult | null> {
    // Extract potential state/LGA/ward names from address
    const addressWords = address.toLowerCase().split(/[\s,]+/);
    
    // Try to match state names
    const { data: pollingUnits, error } = await supabase
      .from('polling_units')
      .select('*')
      .or(
        addressWords
          .filter(word => word.length > 2)
          .map(word => `state.ilike.%${word}%,lga.ilike.%${word}%,ward.ilike.%${word}%`)
          .join(',')
      )
      .limit(10);

    if (error || !pollingUnits?.length) {
      return null;
    }

    // Group by location and return the most relevant match
    const grouped = pollingUnits.reduce((acc, pu) => {
      const key = `${pu.state}-${pu.lga}-${pu.ward}`;
      if (!acc[key]) {
        acc[key] = {
          state: pu.state,
          lga: pu.lga,
          ward: pu.ward,
          units: [],
          coordinates: {
            lat: pu.latitude ? parseFloat(String(pu.latitude)) : 6.5244,
            lng: pu.longitude ? parseFloat(String(pu.longitude)) : 3.3792
          }
        };
      }
      acc[key].units.push({
        id: pu.id,
        name: pu.name,
        code: pu.code,
        address: pu.address || ''
      });
      return acc;
    }, {} as any);

    const firstMatch = Object.values(grouped)[0] as any;
    return {
      state: firstMatch.state,
      lga: firstMatch.lga,
      ward: firstMatch.ward,
      pollingUnits: firstMatch.units.slice(0, 5),
      coordinates: firstMatch.coordinates
    };
  }

  private async parseAddressComponents(address: string): Promise<LocationLookupResult | null> {
    // Simple pattern matching for Nigerian addresses
    const statePattern = /(?:^|\s)(Lagos|Kano|Rivers|Kaduna|Oyo|Delta|Imo|Anambra|Borno|Osun|Cross River|Bauchi|Ogun|Enugu|Kebbi|Sokoto|Katsina|Bayelsa|Jigawa|Benue|Abia|Niger|Zamfara|Gombe|Ebonyi|Ekiti|Kwara|Plateau|Kogi|Nasarawa|Taraba|Adamawa|Akwa Ibom|Edo|Ondo|Yobe|FCT|Abuja)(?:\s|state|$)/i;
    
    const stateMatch = address.match(statePattern);
    if (stateMatch) {
      const state = stateMatch[1];
      
      // Find polling units in this state
      const { data: pollingUnits, error } = await supabase
        .from('polling_units')
        .select('*')
        .ilike('state', state)
        .limit(5);

      if (!error && pollingUnits?.length) {
        const firstUnit = pollingUnits[0];
        return {
          state: firstUnit.state,
          lga: firstUnit.lga,
          ward: firstUnit.ward,
          pollingUnits: pollingUnits.map(pu => ({
            id: pu.id,
            name: pu.name,
            code: pu.code,
            address: pu.address || ''
          })),
          coordinates: {
            lat: firstUnit.latitude ? parseFloat(String(firstUnit.latitude)) : 6.5244,
            lng: firstUnit.longitude ? parseFloat(String(firstUnit.longitude)) : 3.3792
          }
        };
      }
    }

    return null;
  }

  private getCachedResult(address: string): GeocodeCache | null {
    const cached = this.cache.get(address.toLowerCase());
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      return cached;
    }
    if (cached) {
      this.cache.delete(address.toLowerCase());
    }
    return null;
  }

  private setCacheResult(address: string, result: LocationLookupResult) {
    this.cache.set(address.toLowerCase(), {
      address,
      result,
      timestamp: Date.now()
    });
  }

  async getBallotForLocation(state: string, lga: string, ward?: string) {
    // Get races for this location
    let racesQuery = supabase
      .from('races')
      .select(`
        *,
        election:elections(*)
      `)
      .eq('state', state);
    
    if (lga) {
      racesQuery = racesQuery.eq('lga', lga);
    }
    
    if (ward) {
      racesQuery = racesQuery.eq('ward', ward);
    }

    const { data: races, error: racesError } = await racesQuery;
    
    if (racesError) {
      throw racesError;
    }

    // Get candidates for these races
    const raceIds = races?.map(r => r.id) || [];
    const { data: candidates, error: candidatesError } = await supabase
      .from('candidates')
      .select('*')
      .in('race_id', raceIds);

    if (candidatesError) {
      throw candidatesError;
    }

    return {
      races: races || [],
      candidates: candidates || [],
      location: { state, lga, ward }
    };
  }
}

export const geocodingService = new GeocodingService();