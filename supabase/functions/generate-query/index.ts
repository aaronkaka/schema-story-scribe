
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { schema, userStory } = await req.json();

    if (!schema || !userStory) {
      return new Response(
        JSON.stringify({ error: 'Schema and user story are required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Received request with schema and user story');
    console.log('Schema length:', schema.length);
    console.log('User story length:', userStory.length);

    const prompt = `
You are an expert in GraphQL and SQL, tasked with generating GraphQL queries based on a GraphQL schema and a user story.

GraphQL Schema:
\`\`\`
${schema}
\`\`\`

User Story:
\`\`\`
${userStory}
\`\`\`

Generate a GraphQL query that satisfies the user story requirements. 
Focus on creating a query that is efficient and follows GraphQL best practices.
Only include fields that are relevant to the user story.
Return ONLY the GraphQL query without any explanations.
    `;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Anthropic API error:', errorData);
      return new Response(
        JSON.stringify({ error: 'Failed to generate query', details: errorData }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    const generatedQuery = data.content[0].text;

    console.log('Successfully generated query');

    // Store in query_history table
    const createClient = (await import('https://esm.sh/@supabase/supabase-js@2.38.4')).createClient;
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    await supabase.from('query_history').insert({
      schema,
      user_story: userStory,
      generated_query: generatedQuery
    });

    return new Response(
      JSON.stringify({ success: true, data: generatedQuery }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in generate-query function:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An unexpected error occurred', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
