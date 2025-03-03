
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { transcriptText, symbol, quarter, year, date } = await req.json();
    
    if (!transcriptText || transcriptText.trim().length < 100) {
      return new Response(
        JSON.stringify({ error: "Transcript text is too short or missing" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Check if we already have cached highlights
    if (symbol && quarter && year) {
      const cachedHighlights = await getCachedHighlights(symbol, quarter, year);
      if (cachedHighlights && cachedHighlights.length > 0) {
        console.log(`Using cached highlights for ${symbol} ${quarter} ${year}`);
        return new Response(
          JSON.stringify({ highlights: cachedHighlights }),
          { headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }
    
    // Generate new highlights
    const highlights = await generateHighlights(transcriptText);
    
    // Cache the highlights if we have metadata
    if (symbol && quarter && year) {
      await cacheHighlights(symbol, quarter, year, highlights);
    }
    
    return new Response(
      JSON.stringify({ highlights }),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error generating transcript highlights:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});

/**
 * Get cached highlights if available
 */
async function getCachedHighlights(symbol: string, quarter: string, year: string): Promise<string[] | null> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/earnings_transcripts?symbol=eq.${symbol}&quarter=eq.${quarter}&year=eq.${year}`, {
      headers: {
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "apikey": SUPABASE_SERVICE_ROLE_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0 && data[0].highlights) {
      return data[0].highlights;
    }
    
    return null;
  } catch (error) {
    console.error("Error getting cached highlights:", error);
    return null;
  }
}

/**
 * Cache highlights in the database
 */
async function cacheHighlights(symbol: string, quarter: string, year: string, highlights: string[]): Promise<void> {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/earnings_transcripts?symbol=eq.${symbol}&quarter=eq.${quarter}&year=eq.${year}`, {
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify({ highlights })
    });
    
    if (!response.ok) {
      throw new Error(`Supabase API error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error caching highlights:", error);
  }
}

/**
 * Generate highlights from transcript text using OpenAI
 */
async function generateHighlights(transcriptText: string): Promise<string[]> {
  try {
    // Truncate text if it's too long
    const truncatedText = transcriptText.length > 15000 
      ? transcriptText.substring(0, 15000) + "..." 
      : transcriptText;
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst assistant. Extract the 5 most important highlights from this earnings call transcript. Focus on key financial metrics, business changes, major announcements, and forward-looking statements. Return ONLY the highlights as a JSON array of strings, nothing else."
          },
          {
            role: "user",
            content: truncatedText
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    
    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      // Parse the JSON response
      const parsedContent = JSON.parse(content);
      if (Array.isArray(parsedContent.highlights)) {
        return parsedContent.highlights;
      } else if (Array.isArray(parsedContent)) {
        return parsedContent;
      } else {
        console.warn("Unexpected response format:", parsedContent);
        return extractHighlightsFromText(content);
      }
    } catch (parseError) {
      console.warn("Error parsing OpenAI response:", parseError);
      return extractHighlightsFromText(content);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return ["Failed to generate highlights due to an API error"];
  }
}

/**
 * Fallback method to extract highlights if JSON parsing fails
 */
function extractHighlightsFromText(text: string): string[] {
  // Try to extract anything that looks like a bullet point or numbered list
  const lines = text.split('\n').filter(line => line.trim());
  const highlights = [];
  
  for (const line of lines) {
    // Look for bullet points, numbers, or quotes
    if (/^[\s]*[\d\-\*\•\★\-\>\"\'\[\{]/.test(line)) {
      // Clean up the line
      let highlight = line.replace(/^[\s]*[\d\-\*\•\★\-\>\"\'\[\{]+[\s]*/, '');
      highlight = highlight.replace(/[\"\'\]\}]+$/, '').trim();
      
      if (highlight && highlight.length > 10) {
        highlights.push(highlight);
      }
    }
  }
  
  // If we couldn't find any bullet points, just take the first few sentences
  if (highlights.length === 0) {
    const sentences = text.split(/[\.\!\?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => s.trim());
  }
  
  return highlights.slice(0, 5);
}
