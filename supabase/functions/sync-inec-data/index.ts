import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface INECTimetable {
  elections: Array<{
    name: string;
    type: string;
    election_date: string;
    states: string[];
    description: string;
  }>;
  deadlines: Array<{
    title: string;
    description: string;
    type: string;
    deadline_date: string;
    priority: string;
  }>;
}

interface INECCandidate {
  name: string;
  party: string;
  race_name: string;
  state?: string;
  constituency?: string;
  age?: number;
  occupation?: string;
  education?: string;
  inec_candidate_id: string;
}

interface SyncResult {
  success: boolean;
  processed: number;
  created: number;
  updated: number;
  errors: string[];
  sourceUrl?: string;
  sourceHash?: string;
  lastSyncedAt: string;
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

    const { sync_type } = await req.json()
    console.log(`Starting INEC sync for: ${sync_type}`)

    // Start sync run record
    const { data: syncRun, error: syncError } = await supabase
      .from('sync_runs')
      .insert({
        provider: 'inec_api',
        sync_type,
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
      switch (sync_type) {
        case 'elections':
          result = await syncTimetables(supabase)
          break
        case 'candidates':
          result = await syncCandidates(supabase)
          break
        case 'polling_units':
          result = await syncPollingUnits(supabase)
          break
        default:
          throw new Error(`Unknown sync type: ${sync_type}`)
      }

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
            source_url: result.sourceUrl,
            source_hash: result.sourceHash,
            errors: result.errors
          }
        })
        .eq('id', syncRun.id)

      console.log(`Sync completed: ${sync_type}`, result)

      return new Response(
        JSON.stringify({
          success: result.success,
          processed: result.processed,
          created: result.created,
          updated: result.updated,
          errors: result.errors
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )

    } catch (syncError) {
      console.error(`Sync failed for ${sync_type}:`, syncError)
      
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
    console.error('INEC sync error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})

async function syncTimetables(supabase: any): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    processed: 0,
    created: 0,
    updated: 0,
    errors: [],
    lastSyncedAt: new Date().toISOString()
  }

  try {
    const urls = [
      'https://www.inecnigeria.org/timetable/',
      'https://www.inecnigeria.org/2027-elections/'
    ]

    for (const url of urls) {
      console.log(`Fetching timetable from: ${url}`)
      
      // Check if URL has been updated using ETag/Last-Modified
      const headResponse = await fetchWithRetry(url, { method: 'HEAD' })
      const etag = headResponse.headers.get('etag')
      const lastModified = headResponse.headers.get('last-modified')
      const contentHash = etag || lastModified || Date.now().toString()
      
      // Check if we've already processed this version
      const { data: existingSync } = await supabase
        .from('sync_runs')
        .select('metadata')
        .eq('provider', 'inec_api')
        .eq('sync_type', 'elections')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (existingSync?.metadata && 
          typeof existingSync.metadata === 'object' && 
          'source_hash' in existingSync.metadata && 
          existingSync.metadata.source_hash === contentHash) {
        console.log(`No changes detected for ${url}`)
        continue
      }

      // Fetch and parse the content (mock data for now)
      const timetableData = await parseTimetableUrl(url)
      if (timetableData) {
        // Upsert elections
        for (const election of timetableData.elections) {
          result.processed++
          const { error } = await supabase
            .from('elections')
            .upsert({
              name: election.name,
              type: mapElectionType(election.type),
              election_date: election.election_date,
              states: election.states,
              description: election.description,
              status: 'upcoming'
            }, { onConflict: 'name' })

          if (error) {
            result.errors.push(`Election error: ${error.message}`)
          } else {
            result.created++
          }
        }

        // Upsert deadlines
        for (const deadline of timetableData.deadlines) {
          result.processed++
          const { error } = await supabase
            .from('deadlines')
            .upsert({
              title: deadline.title,
              description: deadline.description,
              type: deadline.type,
              deadline_date: deadline.deadline_date,
              priority: deadline.priority
            }, { onConflict: 'title' })

          if (error) {
            result.errors.push(`Deadline error: ${error.message}`)
          } else {
            result.created++
          }
        }

        result.sourceUrl = url
        result.sourceHash = contentHash
      }
    }

    result.success = result.errors.length === 0
    return result

  } catch (error) {
    result.errors.push(`Fetch error: ${error.message}`)
    return result
  }
}

async function syncCandidates(supabase: any): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    processed: 0,
    created: 0,
    updated: 0,
    errors: [],
    lastSyncedAt: new Date().toISOString()
  }

  try {
    const feedUrls = [
      'https://www.inecnigeria.org/candidates/',
      'https://www.inecnigeria.org/2027-candidate-list/'
    ]

    for (const url of feedUrls) {
      console.log(`Fetching candidates from: ${url}`)
      
      const candidates = await parseCandidateUrl(url)
      if (candidates) {
        for (const candidate of candidates) {
          result.processed++
          
          // Find or create race
          const { data: race } = await supabase
            .from('races')
            .select('id')
            .eq('name', candidate.race_name)
            .maybeSingle()

          if (race) {
            const { error } = await supabase
              .from('candidates')
              .upsert({
                name: candidate.name,
                party: candidate.party,
                race_id: race.id,
                age: candidate.age,
                occupation: candidate.occupation,
                education: candidate.education,
                inec_candidate_id: candidate.inec_candidate_id,
                status: 'active'
              }, { onConflict: 'inec_candidate_id' })

            if (error) {
              result.errors.push(`Candidate error: ${error.message}`)
            } else {
              result.created++
            }
          } else {
            result.errors.push(`Race not found: ${candidate.race_name}`)
          }
        }
        
        result.sourceUrl = url
        result.sourceHash = generateChecksum(candidates)
      }
    }

    result.success = result.errors.length === 0
    return result

  } catch (error) {
    result.errors.push(`Fetch error: ${error.message}`)
    return result
  }
}

async function syncPollingUnits(supabase: any): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    processed: 0,
    created: 0,
    updated: 0,
    errors: [],
    lastSyncedAt: new Date().toISOString()
  }

  try {
    // Mock polling units data - in production this would parse INEC CSV/Excel files
    const mockPollingUnits = [
      {
        name: 'Ojodu Primary School',
        code: 'LAG001-001',
        state: 'Lagos',
        lga: 'Ikeja',
        ward: 'Ward 1',
        address: '123 Ojodu Road, Ikeja',
        registered_voters: 2500,
        latitude: 6.5244,
        longitude: 3.3792
      },
      {
        name: 'Community Hall Surulere',
        code: 'LAG002-001', 
        state: 'Lagos',
        lga: 'Surulere',
        ward: 'Ward 2',
        address: '456 Surulere Street',
        registered_voters: 1800,
        latitude: 6.5056,
        longitude: 3.3568
      }
    ]

    for (const unit of mockPollingUnits) {
      result.processed++
      const { error } = await supabase
        .from('polling_units')
        .upsert({
          name: unit.name,
          code: unit.code,
          state: unit.state,
          lga: unit.lga,
          ward: unit.ward,
          address: unit.address,
          registered_voters: unit.registered_voters,
          latitude: unit.latitude,
          longitude: unit.longitude,
          inec_pu_id: unit.code
        }, { onConflict: 'code' })

      if (error) {
        result.errors.push(`Polling unit error: ${error.message}`)
      } else {
        result.created++
      }
    }

    result.success = result.errors.length === 0
    return result

  } catch (error) {
    result.errors.push(`Sync error: ${error.message}`)
    return result
  }
}

// Helper functions
async function parseTimetableUrl(url: string): Promise<INECTimetable | null> {
  try {
    // Mock data - in production this would parse actual INEC PDFs/HTML
    return {
      elections: [
        {
          name: '2027 Presidential Election',
          type: 'presidential',
          election_date: '2027-02-25',
          states: ['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna'],
          description: 'Presidential Election for the Federal Republic of Nigeria'
        },
        {
          name: '2027 Senate Elections',
          type: 'senatorial', 
          election_date: '2027-02-25',
          states: ['FCT', 'Lagos', 'Kano', 'Rivers', 'Ogun', 'Kaduna'],
          description: 'Senate Elections for all states'
        }
      ],
      deadlines: [
        {
          title: 'Voter Registration Deadline - Updated',
          description: 'Extended deadline for voter registration and PVC collection',
          type: 'registration',
          deadline_date: '2026-12-31T23:59:59Z',
          priority: 'high'
        },
        {
          title: 'Candidate Nomination Deadline',
          description: 'Final date for candidate nomination submission',
          type: 'nomination',
          deadline_date: '2026-10-15T17:00:00Z',
          priority: 'high'
        }
      ]
    }
  } catch (error) {
    console.error('Error parsing timetable:', error)
    return null
  }
}

async function parseCandidateUrl(url: string): Promise<INECCandidate[] | null> {
  try {
    // Mock data - in production this would parse actual INEC candidate files
    return [
      {
        name: 'Dr. Kemi Adeosun',
        party: 'Social Democratic Party (SDP)',
        race_name: 'President of Nigeria',
        age: 59,
        occupation: 'Economist & Former Minister',
        education: 'PhD Economics University of Cambridge',
        inec_candidate_id: 'INEC-PRES-2027-005'
      },
      {
        name: 'Alhaji Musa Yar\'Adua',
        party: 'Peoples Redemption Party (PRP)',
        race_name: 'President of Nigeria',
        age: 63,
        occupation: 'Businessman & Politician',
        education: 'BSc Political Science Ahmadu Bello University',
        inec_candidate_id: 'INEC-PRES-2027-006'
      }
    ]
  } catch (error) {
    console.error('Error parsing candidates:', error)
    return null
  }
}

async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
  let lastError;
  
  for (let i = 0; i <= maxRetries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'User-Agent': 'CivicLens/1.0 (Nigeria Election Monitor)',
          ...options.headers
        }
      });
      
      if (response.status === 429) {
        // Rate limited - exponential backoff
        const delay = Math.pow(2, i) * 1000;
        console.log(`Rate limited, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      if (response.status >= 500) {
        // Server error - retry
        if (i < maxRetries) {
          const delay = Math.pow(2, i) * 1000;
          console.log(`Server error ${response.status}, retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }
      
      return response;
    } catch (error) {
      lastError = error;
      if (i < maxRetries) {
        const delay = Math.pow(2, i) * 1000;
        console.log(`Network error, retrying in ${delay}ms...`, error);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
    }
  }
  
  throw lastError;
}

function mapElectionType(dbType: string): string {
  const typeMap: Record<string, string> = {
    'presidential': 'presidential',
    'gubernatorial': 'gubernatorial', 
    'senatorial': 'senatorial',
    'house_of_representatives': 'house_of_representatives',
    'state_assembly': 'state_assembly',
    'local_government': 'local_government',
    'councilor': 'local_government'
  };
  return typeMap[dbType] || 'presidential';
}

function generateChecksum(data: any): string {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify(data);
  const hashBuffer = encoder.encode(dataString);
  return btoa(String.fromCharCode(...new Uint8Array(hashBuffer))).slice(0, 16);
}