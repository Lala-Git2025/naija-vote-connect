import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.55.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }
    
    if (!supabaseUrl || !supabaseServiceRoleKey) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    const { manifestoId } = await req.json();
    
    console.log(`Starting embedding update for manifesto: ${manifestoId || 'all'}`);

    let manifestos;
    if (manifestoId) {
      // Update single manifesto
      const { data, error } = await supabase
        .from('manifestos')
        .select('id, raw_text')
        .eq('id', manifestoId)
        .single();
        
      if (error) throw error;
      manifestos = data ? [data] : [];
    } else {
      // Update all manifestos without embeddings
      const { data, error } = await supabase
        .from('manifestos')
        .select('id, raw_text')
        .is('embedding', null);
        
      if (error) throw error;
      manifestos = data || [];
    }

    if (manifestos.length === 0) {
      return new Response(JSON.stringify({ 
        message: 'No manifestos to update',
        updated: 0,
        errors: []
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let updated = 0;
    const errors: string[] = [];

    for (const manifesto of manifestos) {
      try {
        console.log(`Generating embedding for manifesto ${manifesto.id}`);
        
        // Generate embedding
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: manifesto.raw_text.substring(0, 8000),
          }),
        });

        if (!embeddingResponse.ok) {
          throw new Error(`OpenAI API error: ${embeddingResponse.status}`);
        }

        const embeddingData = await embeddingResponse.json();
        const embedding = embeddingData.data[0].embedding;

        // Update manifesto with embedding
        const { error } = await supabase
          .from('manifestos')
          .update({ embedding: `[${embedding.join(',')}]` })
          .eq('id', manifesto.id);

        if (error) throw error;

        updated++;
        console.log(`Updated embedding for manifesto ${manifesto.id}`);
      } catch (error) {
        const errorMsg = `Failed to update manifesto ${manifesto.id}: ${error.message}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`Embedding update completed: ${updated} updated, ${errors.length} errors`);

    return new Response(JSON.stringify({
      message: `Embedding update completed: ${updated} updated, ${errors.length} errors`,
      updated,
      errors
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in update-embeddings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to update embeddings' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});