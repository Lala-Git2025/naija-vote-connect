// RAG (Retrieval-Augmented Generation) Service
// Handles embeddings, semantic search, and AI-powered query responses

import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  candidate_id: string;
  candidate_name: string;
  party_code: string;
  section_heading: string;
  content: string;
  source_url: string;
  similarity: number;
  topic: string;
}

export interface RAGResponse {
  answer: string;
  citations: {
    source_url: string;
    candidate_name: string;
    party: string;
    section_heading: string;
    excerpt: string;
  }[];
  confidence: number;
}

export class RAGService {
  private openAIApiKey: string | null = null;

  constructor() {
    // In production, this would be handled by edge functions
    this.openAIApiKey = process.env.OPENAI_API_KEY || null;
  }

  // Generate embeddings for manifesto text
  async generateEmbedding(text: string): Promise<number[]> {
    if (!this.openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text.substring(0, 8000), // Limit input length
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Error generating embedding:', error);
      throw error;
    }
  }

  // Update manifesto embeddings
  async updateManifestoEmbeddings(manifestoId: string): Promise<void> {
    try {
      // Get manifesto content
      const { data: manifesto } = await supabase
        .from('manifestos')
        .select('raw_text, sections')
        .eq('id', manifestoId)
        .single();

      if (!manifesto) {
        throw new Error('Manifesto not found');
      }

      // Generate embedding for full text
      const embedding = await this.generateEmbedding(manifesto.raw_text);

      // Update manifesto with embedding
      const { error } = await supabase
        .from('manifestos')
        .update({ embedding: `[${embedding.join(',')}]` })
        .eq('id', manifestoId);

      if (error) throw error;

      console.log(`Updated embedding for manifesto ${manifestoId}`);
    } catch (error) {
      console.error(`Error updating embedding for manifesto ${manifestoId}:`, error);
      throw error;
    }
  }

  // Semantic search across manifestos
  async searchManifestos(query: string, candidateId?: string, topK = 5): Promise<SearchResult[]> {
    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);
      
      // Build SQL query for vector similarity search
      let sqlQuery = `
        SELECT 
          m.id,
          m.candidate_id,
          c.name as candidate_name,
          c.party_code,
          s.value ->> 'heading' as section_heading,
          s.value ->> 'content' as content,
          s.value ->> 'topic' as topic,
          m.source_url,
          1 - (m.embedding <=> '[${queryEmbedding.join(',')}]'::vector) as similarity
        FROM manifestos m
        JOIN candidates c ON m.candidate_id = c.id
        JOIN LATERAL jsonb_array_elements(m.sections) s ON true
        WHERE m.embedding IS NOT NULL
      `;

      if (candidateId) {
        sqlQuery += ` AND m.candidate_id = '${candidateId}'`;
      }

      sqlQuery += `
        ORDER BY m.embedding <=> '[${queryEmbedding.join(',')}]'::vector
        LIMIT ${topK}
      `;

      // Execute search using a simple similarity search for now
      // In production, this would use a proper vector search function
      const { data: results, error } = await supabase
        .from('manifestos')
        .select(`
          id,
          candidate_id,
          candidates!inner(name, party_code),
          sections,
          source_url,
          raw_text
        `)
        .not('embedding', 'is', null)
        .limit(topK);

      if (error) {
        console.error('Search error:', error);
        return this.fallbackTextSearch(query, candidateId, topK);
      }

      // Process results to match expected format
      const searchResults: SearchResult[] = [];
      results?.forEach(manifesto => {
        const sections = Array.isArray(manifesto.sections) ? manifesto.sections : [];
        sections.forEach((section: any) => {
          if (section.content && section.content.toLowerCase().includes(query.toLowerCase())) {
            searchResults.push({
              id: manifesto.id,
              candidate_id: manifesto.candidate_id,
              candidate_name: (manifesto.candidates as any).name,
              party_code: (manifesto.candidates as any).party_code,
              section_heading: section.heading || 'General',
              content: section.content,
              source_url: manifesto.source_url,
              similarity: 0.7, // Mock similarity score
              topic: section.topic || 'governance'
            });
          }
        });
      });

      return searchResults.slice(0, topK);
    } catch (error) {
      console.error('Error in semantic search:', error);
      // Fallback to text search
      return this.fallbackTextSearch(query, candidateId, topK);
    }
  }

  // Fallback text search when vector search fails
  private async fallbackTextSearch(query: string, candidateId?: string, topK = 5): Promise<SearchResult[]> {
    let searchQuery = supabase
      .from('manifestos')
      .select(`
        id,
        candidate_id,
        candidates!inner(name, party_code),
        raw_text,
        sections,
        source_url
      `)
      .textSearch('raw_text', query, { type: 'websearch' })
      .limit(topK);

    if (candidateId) {
      searchQuery = searchQuery.eq('candidate_id', candidateId);
    }

    const { data: manifestos } = await searchQuery;

    return manifestos?.map(manifesto => ({
      id: manifesto.id,
      candidate_id: manifesto.candidate_id,
      candidate_name: (manifesto.candidates as any).name,
      party_code: (manifesto.candidates as any).party_code,
      section_heading: 'General Manifesto',
      content: manifesto.raw_text.substring(0, 500),
      source_url: manifesto.source_url,
      similarity: 0.5, // Default similarity for text search
      topic: 'governance'
    })) || [];
  }

  // Generate AI response with citations
  async generateResponse(query: string, candidateId?: string): Promise<RAGResponse> {
    try {
      // Search for relevant content
      const searchResults = await this.searchManifestos(query, candidateId, 5);

      if (searchResults.length === 0) {
        return {
          answer: 'I could not find relevant information in the available manifestos to answer your query.',
          citations: [],
          confidence: 0
        };
      }

      // Build context from search results
      const context = searchResults.map(result => 
        `Source: ${result.candidate_name} (${result.party_code}) - ${result.section_heading}\n${result.content}`
      ).join('\n\n---\n\n');

      // Generate response using AI
      const aiResponse = await this.callAI(query, context);

      // Extract citations from search results
      const citations = searchResults.map(result => ({
        source_url: result.source_url,
        candidate_name: result.candidate_name,
        party: result.party_code,
        section_heading: result.section_heading,
        excerpt: result.content.substring(0, 200) + '...'
      }));

      return {
        answer: aiResponse,
        citations,
        confidence: Math.max(...searchResults.map(r => r.similarity))
      };
    } catch (error) {
      console.error('Error generating RAG response:', error);
      return {
        answer: 'I encountered an error while processing your query. Please try again.',
        citations: [],
        confidence: 0
      };
    }
  }

  private async callAI(query: string, context: string): Promise<string> {
    if (!this.openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

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

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openAIApiKey}`,
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
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error calling OpenAI:', error);
      return 'I encountered an error while generating a response. Please try again.';
    }
  }

  // Batch update all manifesto embeddings
  async updateAllEmbeddings(): Promise<{ created: number; updated: number; errors: string[] }> {
    const { data: manifestos } = await supabase
      .from('manifestos')
      .select('id, raw_text')
      .is('embedding', null);

    if (!manifestos || manifestos.length === 0) {
      return { created: 0, updated: 0, errors: [] };
    }

    let updated = 0;
    const errors: string[] = [];

    for (const manifesto of manifestos) {
      try {
        await this.updateManifestoEmbeddings(manifesto.id);
        updated++;
      } catch (error) {
        errors.push(`Failed to update embedding for manifesto ${manifesto.id}: ${error}`);
      }
    }

    console.log(`Embedding update completed: ${updated} updated, ${errors.length} errors`);
    return { created: 0, updated, errors };
  }
}

// Export singleton instance
export const ragService = new RAGService();