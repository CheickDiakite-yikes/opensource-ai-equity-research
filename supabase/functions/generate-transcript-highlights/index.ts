
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
    const { transcriptText } = await req.json();
    
    if (!transcriptText || transcriptText.trim().length === 0) {
      throw new Error('Transcript text is required');
    }

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
            content: 'You are a financial analyst assistant. Extract 3-5 key highlights from the earnings call transcript provided. Focus on revenue numbers, growth metrics, strategic initiatives, and forward guidance. Format each highlight as a concise bullet point.' 
          },
          { 
            role: 'user', 
            content: `Extract the most important highlights from this earnings call transcript: ${transcriptText.substring(0, 8000)}` 
          }
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error('Failed to generate highlights');
    }
    
    const generatedText = data.choices[0].message.content;
    
    // Parse bullet points into array
    const highlights = generatedText
      .split(/\n+/)
      .map(line => line.replace(/^[•\-*]\s*/, '').trim())
      .filter(line => line.length > 0)
      .slice(0, 5);

    return new Response(JSON.stringify({ highlights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-transcript-highlights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
