import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProviderConfig {
  supabase: {
    url: string;
    serviceKey: string;
  };
  inec: {
    resultsUrls: string[];
  };
  replit: {
    apiBase?: string;
    apiKey?: string;
  };
}

interface SyncResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  provider: string;
  lastSyncedAt: string;
}

async function getProviderConfig(): Promise<ProviderConfig> {
  return {
    supabase: {
      url: Deno.env.get('SUPABASE_URL') || 'https://cjyjfxeeyumstsfsknyb.supabase.co',
      serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    },
    inec: {
      resultsUrls: (Deno.env.get('INEC_RESULTS_LINKS') || 'https://inecelectionresults.ng,https://irev.inec.gov.ng').split(',').filter(Boolean)
    },
    replit: {
      apiBase: Deno.env.get('REPLIT_API_BASE'),
      apiKey: Deno.env.get('REPLIT_API_KEY')
    }
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const config = await getProviderConfig()
    const supabase = createClient(
      config.supabase.url,
      config.supabase.serviceKey
    )

    console.log('Starting INEC results sync')

    // Start sync run record
    const { data: syncRun, error: syncError } = await supabase
      .from('sync_runs')
      .insert({
        provider: 'inec_results',
        sync_type: 'results',
        status: 'running',
        started_at: new Date().toISOString(),
        records_processed: 0,
        records_created: 0,
        records_updated: 0
      })
      .select()
      .single()

    if (syncError) {
      console.error('Failed to create sync run:', syncError)
      throw syncError
    }

    let result: SyncResult;

    try {
      result = await syncResults(supabase, config)

      // Update sync run with results
      await supabase
        .from('sync_runs')
        .update({
          status: result.success ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          records_processed: result.processed,
          records_created: result.created,
          records_updated: result.updated,
          error_message: result.errors.length > 0 ? result.errors.join('; ') : null,
          metadata: {
            provider: result.provider,
            errors: result.errors
          }
        })
        .eq('id', syncRun.id)

      console.log('Results sync completed:', result)

      return new Response(
        JSON.stringify({
          success: result.success,
          processed: result.processed,
          created: result.created,
          updated: result.updated,
          provider: result.provider,
          errors: result.errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )

    } catch (syncError) {
      console.error('Results sync failed:', syncError)
      
      // Update sync run with error
      await supabase
        .from('sync_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: syncError.message
        })
        .eq('id', syncRun.id)

      throw syncError
    }

  } catch (error) {
    console.error('INEC results sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function syncResults(supabase: any, config: ProviderConfig): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    processed: 0,
    created: 0,
    updated: 0,
    errors: [],
    provider: 'native',
    lastSyncedAt: new Date().toISOString()
  }

  try {
    console.log(`Syncing results from ${config.inec.resultsUrls.length} sources`)

    // Try native parsing first
    let resultsData = null;

    for (const url of config.inec.resultsUrls) {
      console.log(`Trying native results parsing for: ${url}`)
      
      try {
        resultsData = await parseResultsUrl(url)
        if (resultsData && resultsData.results_links.length > 0) {
          console.log(`Native parsing successful: ${resultsData.results_links.length} result links`)
          break;
        }
      } catch (error) {
        console.warn(`Native parsing failed for ${url}:`, error.message)
      }
    }

    // Fallback to Replit API if native parsing fails
    if (!resultsData && config.replit.apiBase) {
      console.log('Native parsing failed, trying Replit API fallback...')
      try {
        resultsData = await fetchFromReplit(config.replit, 'results')
        result.provider = 'replit';
        console.log(`Replit API successful: ${resultsData?.results?.length || 0} results`)
      } catch (error) {
        console.warn('Replit API fallback failed:', error.message)
      }
    }
    
    if (resultsData) {
      // Store result links for deep linking
      for (const link of resultsData.results_links) {
        result.processed++
        
        // Check if we already have this result link
        const { data: existing } = await supabase
          .from('results')
          .select('id')
          .eq('source_url', link)
          .maybeSingle()

        if (!existing) {
          const { error } = await supabase
            .from('results')
            .insert({
              race_id: null, // Will be linked when we have race data
              candidate_id: null, // Will be linked when we have candidate data
              polling_unit_id: null, // Will be linked when we have PU data
              votes: 0,
              status: 'pending',
              source_url: link,
              collated_at: new Date().toISOString()
            })

          if (error) {
            result.errors.push(`Result link error: ${error.message}`)
          } else {
            result.created++
          }
        }
      }

      // Store actual results if available
      if (resultsData.results && resultsData.results.length > 0) {
        for (const resultRow of resultsData.results) {
          result.processed++
          
          const { error } = await supabase
            .from('results')
            .upsert({
              race_id: resultRow.race_id,
              candidate_id: resultRow.candidate_id,
              polling_unit_id: resultRow.polling_unit_id,
              votes: resultRow.votes,
              status: 'verified',
              source_url: resultRow.source_url,
              collated_at: resultRow.captured_at || new Date().toISOString()
            }, { 
              onConflict: 'race_id,candidate_id,polling_unit_id',
              ignoreDuplicates: false 
            })

          if (error) {
            result.errors.push(`Result row error: ${error.message}`)
          } else {
            result.created++
          }
        }
      }
    } else {
      result.errors.push('No results data available from any provider')
    }

    result.success = result.errors.length === 0 || result.created > 0
    return result

  } catch (error) {
    result.errors.push(`Sync error: ${error.message}`)
    return result
  }
}

async function parseResultsUrl(url: string): Promise<any> {
  try {
    console.log(`Parsing results from: ${url}`)
    
    // Mock implementation - in production this would parse actual INEC results
    // This could be IReV JSON API, scraping HTML tables, or parsing CSV downloads
    return {
      results: [], // Actual vote counts would go here
      results_links: [
        url,
        `${url}/2027-presidential-results`,
        `${url}/2027-gubernatorial-results`
      ]
    }
  } catch (error) {
    console.error('Error parsing results:', error)
    return null
  }
}

async function fetchFromReplit(config: any, dataType: string): Promise<any> {
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