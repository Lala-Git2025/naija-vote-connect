import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Starting fact-check sync')

    // Create sync run record
    const { data: syncRun, error: syncError } = await supabase
      .from('sync_runs')
      .insert({
        provider: 'fact_check',
        sync_type: 'fact_checks',
        status: 'running',
        metadata: { sources: ['africa_check', 'dubawa', 'fact_check_ng'], version: '1.0' }
      })
      .select()
      .single()

    if (syncError) {
      console.error('Error creating sync run:', syncError)
      throw syncError
    }

    let recordsProcessed = 0
    let recordsCreated = 0
    let recordsUpdated = 0

    try {
      // Get some candidates to associate fact checks with
      const { data: candidates } = await supabase
        .from('candidates')
        .select('id, name')
        .limit(5)

      // Mock fact-check data - in production, this would fetch from fact-checking APIs
      const mockFactChecks = [
        {
          candidate_id: candidates?.[0]?.id || null,
          claim: 'Claimed to have built 100 schools during tenure as governor',
          verdict: 'partly-true',
          explanation: 'Records show 67 schools were built, not 100 as claimed. However, significant progress was made in education infrastructure.',
          source_name: 'Africa Check',
          source_url: 'https://africacheck.org/fact-checks/reports/schools-claim-check',
          topic: 'education',
          confidence_score: 0.85,
          published_at: new Date().toISOString()
        },
        {
          candidate_id: candidates?.[1]?.id || null,
          claim: 'Created 2 million jobs in previous role',
          verdict: 'misleading',
          explanation: 'While employment increased, the figure includes indirect jobs and temporary positions that may not represent permanent job creation.',
          source_name: 'DUBAWA',
          source_url: 'https://dubawa.org/employment-claims-analysis',
          topic: 'employment',
          confidence_score: 0.78,
          published_at: new Date().toISOString()
        },
        {
          candidate_id: null,
          claim: 'Nigeria has the highest unemployment rate in Africa',
          verdict: 'false',
          explanation: 'While Nigeria faces unemployment challenges, South Africa currently has the highest unemployment rate in Africa according to recent statistics.',
          source_name: 'FactCheck.ng',
          source_url: 'https://factcheck.ng/unemployment-statistics-africa',
          topic: 'economy',
          confidence_score: 0.92,
          published_at: new Date().toISOString()
        },
        {
          candidate_id: candidates?.[0]?.id || null,
          claim: 'Reduced crime rate by 60% in Lagos State',
          verdict: 'true',
          explanation: 'Official statistics from the Lagos State Police Command confirm a significant reduction in reported crimes during the specified period.',
          source_name: 'Africa Check',
          source_url: 'https://africacheck.org/crime-statistics-lagos',
          topic: 'security',
          confidence_score: 0.89,
          published_at: new Date().toISOString()
        }
      ]

      for (const factCheck of mockFactChecks) {
        recordsProcessed++
        
        const { data: existing } = await supabase
          .from('fact_checks')
          .select('id')
          .eq('claim', factCheck.claim)
          .eq('source_name', factCheck.source_name)
          .single()

        if (existing) {
          await supabase
            .from('fact_checks')
            .update(factCheck)
            .eq('id', existing.id)
          recordsUpdated++
        } else {
          await supabase
            .from('fact_checks')
            .insert(factCheck)
          recordsCreated++
        }
      }

      // Update sync run as completed
      await supabase
        .from('sync_runs')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          records_processed: recordsProcessed,
          records_created: recordsCreated,
          records_updated: recordsUpdated
        })
        .eq('id', syncRun.id)

      console.log(`Fact-check sync completed: ${recordsProcessed} processed, ${recordsCreated} created, ${recordsUpdated} updated`)

      return new Response(
        JSON.stringify({
          success: true,
          sync_run_id: syncRun.id,
          records_processed: recordsProcessed,
          records_created: recordsCreated,
          records_updated: recordsUpdated
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )

    } catch (error) {
      // Update sync run as failed
      await supabase
        .from('sync_runs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error.message,
          records_processed: recordsProcessed,
          records_created: recordsCreated,
          records_updated: recordsUpdated
        })
        .eq('id', syncRun.id)

      throw error
    }

  } catch (error) {
    console.error('Fact-check sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})