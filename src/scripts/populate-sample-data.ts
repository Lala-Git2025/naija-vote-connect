// Script to populate database with sample INEC data
import { supabase } from "@/integrations/supabase/client";

export async function populateSampleData() {
  try {
    console.log('Starting data population...')
    
    // Trigger INEC data sync for elections (which creates races and deadlines too)
    console.log('Syncing elections, races, and deadlines...')
    const electionsResponse = await supabase.functions.invoke('sync-inec-data', {
      body: { sync_type: 'elections' }
    })
    
    if (electionsResponse.error) {
      console.error('Error syncing elections:', electionsResponse.error)
    } else {
      console.log('Elections synced:', electionsResponse.data)
    }

    // Wait a bit for elections to be created
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Trigger candidates sync
    console.log('Syncing candidates...')
    const candidatesResponse = await supabase.functions.invoke('sync-inec-data', {
      body: { sync_type: 'candidates' }
    })
    
    if (candidatesResponse.error) {
      console.error('Error syncing candidates:', candidatesResponse.error)
    } else {
      console.log('Candidates synced:', candidatesResponse.data)
    }

    // Trigger polling units sync
    console.log('Syncing polling units...')
    const pollingResponse = await supabase.functions.invoke('sync-inec-data', {
      body: { sync_type: 'polling_units' }
    })
    
    if (pollingResponse.error) {
      console.error('Error syncing polling units:', pollingResponse.error)
    } else {
      console.log('Polling units synced:', pollingResponse.data)
    }

    // Trigger news sync
    console.log('Syncing news...')
    const newsResponse = await supabase.functions.invoke('sync-news')
    
    if (newsResponse.error) {
      console.error('Error syncing news:', newsResponse.error)
    } else {
      console.log('News synced:', newsResponse.data)
    }

    // Trigger fact-checks sync
    console.log('Syncing fact-checks...')
    const factCheckResponse = await supabase.functions.invoke('sync-fact-checks')
    
    if (factCheckResponse.error) {
      console.error('Error syncing fact-checks:', factCheckResponse.error)
    } else {
      console.log('Fact-checks synced:', factCheckResponse.data)
    }

    console.log('Sample data population completed successfully!')
    return {
      success: true,
      elections: electionsResponse.data,
      candidates: candidatesResponse.data,
      polling_units: pollingResponse.data,
      news: newsResponse.data,
      fact_checks: factCheckResponse.data
    }

  } catch (error) {
    console.error('Error populating sample data:', error)
    return { success: false, error: error.message }
  }
}

// Auto-run when imported in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  console.log('Auto-populating sample data in development mode...')
  populateSampleData()
}