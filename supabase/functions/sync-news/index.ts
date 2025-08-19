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

    console.log('Starting news sync')

    // Create sync run record
    const { data: syncRun, error: syncError } = await supabase
      .from('sync_runs')
      .insert({
        provider: 'civic_feeds',
        sync_type: 'news',
        status: 'running',
        metadata: { sources: ['premium_times', 'punch', 'guardian'], version: '1.0' }
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
      // Mock news data - in production, this would fetch from RSS feeds
      const mockNews = [
        {
          title: 'INEC Announces Voter Registration Extension',
          content: 'The Independent National Electoral Commission has announced an extension of the continuous voter registration exercise to accommodate more eligible voters.',
          summary: 'INEC extends voter registration deadline to increase participation.',
          source_name: 'Premium Times',
          source_url: 'https://premiumtimesng.com/news/elections',
          published_at: new Date().toISOString(),
          category: 'elections',
          tags: ['INEC', 'voter-registration', 'elections'],
          is_verified: true
        },
        {
          title: 'Electoral Reforms Bill Passes Second Reading',
          content: 'The National Assembly has passed the Electoral Act Amendment Bill for second reading, introducing new provisions for electronic transmission of results.',
          summary: 'Electoral reforms advance in National Assembly with new technology provisions.',
          source_name: 'The Guardian',
          source_url: 'https://guardian.ng/politics/electoral-reforms',
          published_at: new Date().toISOString(),
          category: 'politics',
          tags: ['electoral-reforms', 'national-assembly', 'technology'],
          is_verified: true
        },
        {
          title: 'Security Agencies Begin Election Preparations',
          content: 'Security agencies across Nigeria have commenced preparations for the upcoming elections, with focus on ensuring peaceful conduct.',
          summary: 'Security forces prepare comprehensive election security framework.',
          source_name: 'Punch Newspapers',
          source_url: 'https://punchng.com/security-election-prep',
          published_at: new Date().toISOString(),
          category: 'security',
          tags: ['security', 'elections', 'preparation'],
          is_verified: true
        }
      ]

      for (const newsItem of mockNews) {
        recordsProcessed++
        
        const { data: existing } = await supabase
          .from('news')
          .select('id')
          .eq('title', newsItem.title)
          .eq('source_name', newsItem.source_name)
          .single()

        if (existing) {
          await supabase
            .from('news')
            .update(newsItem)
            .eq('id', existing.id)
          recordsUpdated++
        } else {
          await supabase
            .from('news')
            .insert(newsItem)
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

      console.log(`News sync completed: ${recordsProcessed} processed, ${recordsCreated} created, ${recordsUpdated} updated`)

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
    console.error('News sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})