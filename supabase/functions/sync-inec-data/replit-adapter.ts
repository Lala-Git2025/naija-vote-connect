// Replit API adapter for fallback data fetching
// Used when native INEC parsing fails or returns no data

interface ReplitConfig {
  apiBase: string;
  apiKey?: string;
}

interface ReplitResponse<T> {
  data: T[];
  success: boolean;
  error?: string;
}

export async function fetchFromReplit(config: ReplitConfig, dataType: string): Promise<any> {
  const { apiBase, apiKey } = config;
  
  if (!apiBase) {
    throw new Error('Replit API base URL not configured');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  try {
    let endpoint = '';
    
    switch (dataType) {
      case 'elections':
        endpoint = '/elections';
        break;
      case 'candidates':
        endpoint = '/candidates';
        break;
      case 'races':
        endpoint = '/races';
        break;
      case 'deadlines':
        endpoint = '/deadlines';
        break;
      default:
        throw new Error(`Unsupported data type: ${dataType}`);
    }

    console.log(`Fetching from Replit API: ${apiBase}${endpoint}`);
    
    const response = await fetch(`${apiBase}${endpoint}`, { headers });
    
    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limited by Replit API');
      }
      throw new Error(`Replit API error: ${response.status} ${response.statusText}`);
    }

    const result: ReplitResponse<any> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Replit API returned error');
    }

    // Transform Replit data to match our expected format
    return transformReplitData(result.data, dataType);
    
  } catch (error) {
    console.error(`Replit API fetch failed for ${dataType}:`, error);
    throw error;
  }
}

function transformReplitData(data: any[], dataType: string): any {
  switch (dataType) {
    case 'elections':
      return {
        elections: data.map(e => ({
          name: e.name || e.title,
          type: e.type || 'general',
          election_date: e.date || e.election_date,
          states: e.states || [],
          description: e.description || ''
        })),
        deadlines: [] // Separate endpoint for deadlines
      };
      
    case 'candidates':
      return data.map(c => ({
        name: c.name || c.full_name,
        party: c.party || c.party_name,
        race_name: c.race || c.race_name || 'Unknown Race',
        age: c.age,
        occupation: c.occupation || c.job,
        education: c.education,
        inec_candidate_id: c.id || c.inec_id || `REPL-${Date.now()}`
      }));
      
    default:
      return data;
  }
}