import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncRunRecord {
  id: string
  provider: string
  sync_type: string
  status: string
  started_at: string
  completed_at?: string
  records_processed: number
  records_created: number
  records_updated: number
  error_message?: string
  metadata: any
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

    const { sync_type = 'elections' } = await req.json().catch(() => ({}))
    
    console.log(`Starting INEC data sync for: ${sync_type}`)

    // Create sync run record
    const { data: syncRun, error: syncError } = await supabase
      .from('sync_runs')
      .insert({
        provider: 'inec_api',
        sync_type,
        status: 'running',
        metadata: { source: 'inec_api', version: '1.0' }
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
      // Sync different data types based on sync_type
      switch (sync_type) {
        case 'elections':
          const electionData = await syncElections(supabase)
          recordsProcessed = electionData.processed
          recordsCreated = electionData.created
          recordsUpdated = electionData.updated
          break
          
        case 'candidates':
          const candidateData = await syncCandidates(supabase)
          recordsProcessed = candidateData.processed
          recordsCreated = candidateData.created
          recordsUpdated = candidateData.updated
          break
          
        case 'polling_units':
          const puData = await syncPollingUnits(supabase)
          recordsProcessed = puData.processed
          recordsCreated = puData.created
          recordsUpdated = puData.updated
          break
          
        default:
          throw new Error(`Unknown sync type: ${sync_type}`)
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

      console.log(`Sync completed: ${recordsProcessed} processed, ${recordsCreated} created, ${recordsUpdated} updated`)

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
    console.error('Sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

async function syncElections(supabase: any) {
  // Mock INEC elections data - in production, this would fetch from INEC API
  const mockElections = [
    {
      id: '2027-general',
      name: '2027 General Elections',
      type: 'presidential',
      election_date: '2027-02-25',
      status: 'upcoming',
      description: 'Presidential and National Assembly Elections',
      states: ['Lagos', 'Kano', 'Rivers', 'Kaduna']
    },
    {
      id: '2027-gubernatorial',
      name: '2027 Gubernatorial Elections',
      type: 'gubernatorial',
      election_date: '2027-03-11',
      status: 'upcoming',
      description: 'Governorship and State Assembly Elections',
      states: ['Lagos', 'Kano', 'Rivers', 'Kaduna']
    }
  ]

  let processed = 0
  let created = 0
  let updated = 0

  for (const election of mockElections) {
    processed++
    
    const { data: existing } = await supabase
      .from('elections')
      .select('id')
      .eq('name', election.name)
      .single()

    if (existing) {
      await supabase
        .from('elections')
        .update(election)
        .eq('id', existing.id)
      updated++
    } else {
      await supabase
        .from('elections')
        .insert(election)
      created++
    }
  }

  return { processed, created, updated }
}

async function syncCandidates(supabase: any) {
  // Mock candidate data - in production, this would fetch from INEC API
  const mockCandidates = [
    {
      name: 'Bola Ahmed Tinubu',
      party: 'APC',
      age: 71,
      occupation: 'Politician',
      education: 'Chicago State University',
      experience: 'Former Governor of Lagos State',
      manifesto: 'Renewed Hope 2023',
      status: 'active'
    },
    {
      name: 'Atiku Abubakar',
      party: 'PDP',
      age: 76,
      occupation: 'Politician/Businessman',
      education: 'Ahmadu Bello University',
      experience: 'Former Vice President of Nigeria',
      manifesto: 'My Covenant with Nigerians',
      status: 'active'
    }
  ]

  let processed = 0
  let created = 0
  let updated = 0

  // First, get or create a default race
  const { data: race } = await supabase
    .from('races')
    .select('id')
    .limit(1)
    .single()

  if (!race) {
    console.log('No races found, skipping candidate sync')
    return { processed, created, updated }
  }

  for (const candidate of mockCandidates) {
    processed++
    
    const candidateWithRace = { ...candidate, race_id: race.id }
    
    const { data: existing } = await supabase
      .from('candidates')
      .select('id')
      .eq('name', candidate.name)
      .eq('party', candidate.party)
      .single()

    if (existing) {
      await supabase
        .from('candidates')
        .update(candidateWithRace)
        .eq('id', existing.id)
      updated++
    } else {
      await supabase
        .from('candidates')
        .insert(candidateWithRace)
      created++
    }
  }

  return { processed, created, updated }
}

async function syncPollingUnits(supabase: any) {
  // Mock polling unit data
  const mockPollingUnits = [
    {
      name: 'Ikeja Primary School',
      code: 'LA/IKJ/001',
      state: 'Lagos',
      lga: 'Ikeja',
      ward: 'Ward 1',
      address: 'Ikeja GRA, Lagos',
      registered_voters: 1500,
      inec_pu_id: 'PU001'
    },
    {
      name: 'Victoria Island Community Center',
      code: 'LA/VI/002',
      state: 'Lagos',
      lga: 'Lagos Island',
      ward: 'Ward 2',
      address: 'Victoria Island, Lagos',
      registered_voters: 2200,
      inec_pu_id: 'PU002'
    }
  ]

  let processed = 0
  let created = 0
  let updated = 0

  for (const pu of mockPollingUnits) {
    processed++
    
    const { data: existing } = await supabase
      .from('polling_units')
      .select('id')
      .eq('code', pu.code)
      .single()

    if (existing) {
      await supabase
        .from('polling_units')
        .update(pu)
        .eq('id', existing.id)
      updated++
    } else {
      await supabase
        .from('polling_units')
        .insert(pu)
      created++
    }
  }

  return { processed, created, updated }
}