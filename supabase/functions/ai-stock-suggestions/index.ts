
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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
    const { query, existingSymbols } = await req.json();
    
    if (!query || query.length < 2) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If we don't have an OpenAI API key, return a helpful message
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ 
          error: "OpenAI API key not configured",
          suggestions: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format existing symbols for context
    const knownSymbolsContext = existingSymbols.length > 0 
      ? `Some popular stock symbols include: ${existingSymbols.slice(0, 10).map(s => `${s.symbol} (${s.name})`).join(', ')}.` 
      : '';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are a stock market expert assistant. Your task is to suggest relevant stock symbols and company names based on user queries.
            Return ONLY a JSON array of objects with 'symbol' and 'name' properties, with no additional text.
            For example: [{"symbol":"AAPL","name":"Apple Inc."},{"symbol":"MSFT","name":"Microsoft Corporation"}]
            Limit to 5 most relevant suggestions. ${knownSymbolsContext}`
          },
          { 
            role: 'user', 
            content: `Suggest stocks related to: "${query}"`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const suggestions = JSON.parse(data.choices[0].message.content);
    
    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-stock-suggestions function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message, suggestions: [] }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
