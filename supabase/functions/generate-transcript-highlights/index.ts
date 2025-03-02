
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { transcriptText, symbol, quarter, year, date, title, url } = await req.json();

    if (!transcriptText) {
      return new Response(JSON.stringify({ error: "Missing transcript text" }), { 
        status: 400, 
        headers: { "Content-Type": "application/json", ...corsHeaders } 
      });
    }

    // Generate highlights using OpenAI
    const highlights = await generateHighlights(transcriptText);
    
    // Store in database if we have the necessary metadata
    if (symbol && quarter && year && date) {
      // First check if we already have this transcript
      const { data: existingTranscript } = await supabase
        .from('earnings_transcripts')
        .select('id, highlights')
        .eq('symbol', symbol)
        .eq('quarter', quarter)
        .eq('year', year)
        .single();
      
      if (existingTranscript) {
        // Update existing transcript with highlights if they don't exist
        if (!existingTranscript.highlights) {
          await supabase
            .from('earnings_transcripts')
            .update({ 
              highlights: highlights,
              content: transcriptText,
              title: title || `${symbol} ${quarter} ${year} Earnings Call`,
              url: url
            })
            .eq('id', existingTranscript.id);
        }
      } else {
        // Insert new transcript
        await supabase
          .from('earnings_transcripts')
          .insert({
            symbol,
            quarter,
            year,
            date: new Date(date).toISOString(),
            title: title || `${symbol} ${quarter} ${year} Earnings Call`,
            content: transcriptText,
            highlights,
            url
          });
      }
    }
    
    return new Response(JSON.stringify({ highlights }), { 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  } catch (error) {
    console.error("Error generating transcript highlights:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500, 
      headers: { "Content-Type": "application/json", ...corsHeaders } 
    });
  }
});

/**
 * Generate key highlights from an earnings call transcript using OpenAI API
 */
async function generateHighlights(transcriptText: string): Promise<string[]> {
  try {
    // For long transcripts, we'll trim to a reasonable size
    const trimmedText = transcriptText.length > 16000 
      ? transcriptText.substring(0, 16000) + "..."
      : transcriptText;
    
    const prompt = `
    You are a financial analyst assistant. Extract the 5-7 most important highlights from this earnings call transcript.
    Focus on key financial metrics, significant announcements, forward guidance, and important business developments.
    Format each highlight as a concise, standalone bullet point that includes specific numbers when available.
    
    Transcript:
    ${trimmedText}
    `;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", data);
      throw new Error(`OpenAI API error: ${data.error?.message || "Unknown error"}`);
    }

    // Extract bullet points from the response
    const content = data.choices[0]?.message?.content || "";
    // Parse the bullet points, handling various formats
    const bulletPoints = content
      .split(/\n+/)
      .filter(line => line.trim().match(/^[-•*]|\d+\.|\w+:/))
      .map(line => line.replace(/^[-•*]\s*|\d+\.\s*|\w+:\s*/, "").trim())
      .filter(line => line.length > 0);
    
    return bulletPoints.length > 0 ? bulletPoints : [content];
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return ["Failed to generate highlights due to an error."];
  }
}
