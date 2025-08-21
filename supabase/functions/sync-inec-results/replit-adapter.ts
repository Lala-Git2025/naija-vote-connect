// Replit API adapter for results sync - shared with main sync function
export async function fetchFromReplit(config: any, dataType: string): Promise<any> {
  if (!config.apiBase) {
    throw new Error('Replit API base URL not configured');
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (config.apiKey) {
    headers['Authorization'] = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(`${config.apiBase}/results`, { headers });
  
  if (!response.ok) {
    throw new Error(`Replit API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  return {
    results: data.results || [],
    results_links: data.results_links || [`${config.apiBase}/results`]
  };
}