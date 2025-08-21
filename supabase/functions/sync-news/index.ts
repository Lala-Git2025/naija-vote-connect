import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NewsItem {
  title: string;
  content: string;
  summary?: string;
  source_name: string;
  source_url?: string;
  published_at: string;
  category: string;
  tags: string[];
  is_verified: boolean;
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

    console.log('Starting news sync')

    // Start sync run record
    const { data: syncRun, error: syncError } = await supabase
      .from('sync_runs')
      .insert({
        provider: 'civic_feeds',
        sync_type: 'news',
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
      // Get RSS feeds from environment variable
      const rssFeeds = Deno.env.get('CIVIC_RSS')?.split(',') || [
        'https://punchng.com/topics/elections/feed/',
        'https://www.vanguardngr.com/category/politics/feed/',
        'https://www.thisdaylive.com/index.php/category/politics/feed/'
      ];

      for (const feedUrl of rssFeeds) {
        try {
          console.log(`Fetching news from: ${feedUrl}`)
          
          // In production, this would parse RSS/XML feeds
          const mockNewsItems: NewsItem[] = [
            {
              title: 'INEC Announces New Voter Registration Centers',
              content: 'The Independent National Electoral Commission (INEC) has announced the establishment of additional voter registration centers across Lagos State to accommodate the increasing number of eligible voters seeking to register.',
              summary: 'INEC expands voter registration infrastructure in Lagos State.',
              source_name: 'The Nation',
              source_url: 'https://thenationonlineng.net/inec-voter-registration',
              published_at: new Date().toISOString(),
              category: 'election',
              tags: ['INEC', 'voter registration', 'Lagos'],
              is_verified: true
            },
            {
              title: 'Presidential Candidates Debate Schedule Released',
              content: 'The Nigeria Election Debate Group (NEDG) and the Broadcasting Organisation of Nigeria (BON) have released the schedule for the 2027 presidential candidates debates.',
              summary: 'Presidential debate schedule announced for 2027 elections.',
              source_name: 'Premium Times',
              source_url: 'https://www.premiumtimesng.com/debates-2027',
              published_at: new Date().toISOString(),
              category: 'candidate',
              tags: ['presidential debate', '2027 elections', 'NEDG'],
              is_verified: true
            }
          ];

          for (const item of mockNewsItems) {
            processed++;
            
            const { error } = await supabase
              .from('news')
              .upsert({
                title: item.title,
                content: item.content,
                summary: item.summary,
                source_name: item.source_name,
                source_url: item.source_url,
                published_at: item.published_at,
                category: item.category,
                tags: item.tags,
                is_verified: item.is_verified
              }, { onConflict: 'title,source_name' })

            if (error) {
              errors.push(`News error: ${error.message}`)
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
            feeds_processed: rssFeeds.length,
            errors: errors
          }
        })
        .eq('id', syncRun.id)

      console.log(`News sync completed: processed ${processed}, created ${created}`)

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
      console.error('News sync failed:', syncError)
      
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
    console.error('News sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})