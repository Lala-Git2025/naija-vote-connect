import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const { query, context } = await req.json();
    
    if (!query || !context) {
      throw new Error('Query and context are required');
    }

    console.log(`Generating RAG response for query: ${query.substring(0, 100)}...`);

    const systemPrompt = `You are an expert analyst of Nigerian political manifestos. Answer questions based ONLY on the provided manifesto content. 

Guidelines:
- Provide factual, balanced responses
- Always cite specific candidates and parties when referencing their positions
- If information is not in the provided context, say so clearly
- Maintain neutral language and avoid political bias
- Include specific policy details when available`;

    const userPrompt = `Query: ${query}

Available manifesto content:
${context}

Please provide a comprehensive answer based on the manifesto content provided.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error: ${response.status} - ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    console.log(`Successfully generated RAG response of length: ${aiResponse.length}`);

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-rag-response function:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate response' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});