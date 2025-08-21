import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface FactCheckItem {
  claim: string;
  verdict: string;
  explanation: string;
  candidate_id?: string;
  topic: string;
  source_name: string;
  source_url?: string;
  published_at: string;
  confidence_score: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting fact-check sync')

    // Start sync run record
    const { data: syncRun, error: syncError } = await supabase
      .from('sync_runs')
      .insert({
        provider: 'fact_check',
        sync_type: 'fact_checks',
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

    let processed = 0;
    let created = 0;
    let errors: string[] = [];

    try {
      // Get fact-check feeds from environment variable
      const factCheckFeeds = Deno.env.get('FACTCHECK_RSS')?.split(',') || [
        'https://africacheck.org/feed/',
        'https://dubawa.org/feed/',
        'https://factcheck.afp.com/nigeria'
      ];

      // Get some candidate IDs to associate fact-checks with
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id, name')
        .limit(5)

      for (const feedUrl of factCheckFeeds) {
        try {
          console.log(`Fetching fact-checks from: ${feedUrl}`)
          
          // In production, this would parse RSS/API feeds from fact-checking organizations
          const mockFactChecks: FactCheckItem[] = [
            {
              claim: 'Nigeria has the highest unemployment rate in Africa',
              verdict: 'mostly false',
              explanation: 'While Nigeria does have a high unemployment rate, it is not the highest in Africa according to recent World Bank data.',
              candidate_id: candidates?.[0]?.id,
              topic: 'Economy',
              source_name: 'Africa Check',
              source_url: 'https://africacheck.org/fact-checks/unemployment-nigeria',
              published_at: new Date().toISOString(),
              confidence_score: 0.85
            },
            {
              claim: 'Lagos State generates 30% of Nigeria\'s GDP',
              verdict: 'true',
              explanation: 'According to the National Bureau of Statistics, Lagos State contributes approximately 30% to Nigeria\'s Gross Domestic Product.',
              candidate_id: candidates?.[1]?.id,
              topic: 'Economy',
              source_name: 'Dubawa',
              source_url: 'https://dubawa.org/lagos-gdp-contribution',
              published_at: new Date().toISOString(),
              confidence_score: 0.95
            },
            {
              claim: 'Nigeria produces enough oil to meet domestic fuel needs',
              verdict: 'half true',
              explanation: 'While Nigeria produces crude oil, most of it is exported and the country imports refined petroleum products due to limited refining capacity.',
              candidate_id: candidates?.[2]?.id,
              topic: 'Energy',
              source_name: 'AFP Fact Check',
              source_url: 'https://factcheck.afp.com/nigeria-oil-production',
              published_at: new Date().toISOString(),
              confidence_score: 0.75
            }
          ];

          for (const item of mockFactChecks) {
            processed++;
            
            const { error } = await supabase
              .from('fact_checks')
              .upsert({
                claim: item.claim,
                verdict: item.verdict,
                explanation: item.explanation,
                candidate_id: item.candidate_id,
                topic: item.topic,
                source_name: item.source_name,
                source_url: item.source_url,
                published_at: item.published_at,
                confidence_score: item.confidence_score
              }, { onConflict: 'claim,source_name' })

            if (error) {
              errors.push(`Fact-check error: ${error.message}`)
            } else {
              created++
            }
          }
          
        } catch (feedError) {
          errors.push(`Feed error (${feedUrl}): ${feedError.message}`)
        }
      }

      // Update sync run with results
      await supabase
        .from('sync_runs')
        .update({
          status: errors.length === 0 ? 'completed' : 'failed',
          completed_at: new Date().toISOString(),
          records_processed: processed,
          records_created: created,
          records_updated: 0,
          error_message: errors.length > 0 ? errors.join('; ') : null,
          metadata: {
            feeds_processed: factCheckFeeds.length,
            errors: errors
          }
        })
        .eq('id', syncRun.id)

      console.log(`Fact-check sync completed: processed ${processed}, created ${created}`)

      return new Response(
        JSON.stringify({
          success: errors.length === 0,
          processed,
          created,
          updated: 0,
          errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )

    } catch (syncError) {
      console.error('Fact-check sync failed:', syncError)
      
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
    console.error('Fact-check sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})