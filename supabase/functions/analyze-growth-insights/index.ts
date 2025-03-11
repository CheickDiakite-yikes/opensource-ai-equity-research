
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.36.0";
import { OPENAI_MODELS } from "../_shared/constants.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, transcripts, filings } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if we have data to analyze
    if ((!transcripts || transcripts.length === 0) && (!filings || filings.length === 0)) {
      console.log(`No transcripts or filings for ${symbol}`);
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing growth insights for ${symbol} with ${transcripts?.length || 0} transcripts and ${filings?.length || 0} filings`);

    // Prepare the prompt with transcript and filing data
    const formattedData = formatDataForPrompt(symbol, transcripts, filings);

    // Make OpenAI API call
    const insights = await analyzeWithOpenAI(formattedData);
    
    return new Response(
      JSON.stringify(insights),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-growth-insights function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Format transcript and filing data for the OpenAI prompt
function formatDataForPrompt(symbol: string, transcripts: any[], filings: any[]) {
  let prompt = `Company: ${symbol}\n\n`;

  // Add transcript data
  if (transcripts && transcripts.length > 0) {
    prompt += "### EARNINGS CALL TRANSCRIPTS ###\n\n";
    
    // Take only the most recent 2 transcripts for analysis
    const recentTranscripts = transcripts.slice(0, 2);
    
    recentTranscripts.forEach((transcript, index) => {
      prompt += `TRANSCRIPT ${index + 1} (${transcript.date || "Unknown Date"}):\n`;
      
      // For brevity, we'll focus on sections likely to contain growth information
      // These are usually in opening remarks, Q&A about guidance, and closing statements
      const content = transcript.content || "";
      
      // Extract manageable portions of the transcript
      const truncatedContent = extractRelevantContent(content, 8000);
      prompt += truncatedContent + "\n\n";
    });
  }

  // Add filing data - focus on recent 10-Q or 10-K filings
  if (filings && filings.length > 0) {
    prompt += "### SEC FILINGS ###\n\n";
    
    // Filter for 10-Q and 10-K filings and take the most recent ones
    const relevantFilings = filings
      .filter(filing => filing.form === "10-Q" || filing.form === "10-K")
      .slice(0, 2);
    
    relevantFilings.forEach((filing, index) => {
      prompt += `FILING ${index + 1} (${filing.form}, ${filing.filing_date || "Unknown Date"}):\n`;
      
      // Extract relevant sections from filings
      const content = filing.content || "";
      const relevantContent = extractRelevantSections(content, filing.form);
      prompt += relevantContent + "\n\n";
    });
  }

  return prompt;
}

// Extract relevant content from transcripts
function extractRelevantContent(content: string, maxLength: number) {
  if (!content) return "No content available";
  
  // Look for sections that typically discuss growth prospects
  const sections = [
    "opening remarks",
    "prepared remarks",
    "guidance",
    "outlook",
    "future growth",
    "growth strategy",
    "forward-looking",
    "fiscal year",
    "next quarter",
    "expansion",
    "revenue growth",
    "question and answer"
  ];
  
  // Try to find and extract these sections
  let relevantContent = "";
  sections.forEach(section => {
    const regex = new RegExp(`((?:.*?\\b${section}\\b.*?)(?:\\n|$).{0,1000})`, "i");
    const match = content.match(regex);
    if (match && match[0]) {
      relevantContent += match[0] + "\n\n";
    }
  });
  
  // If no sections found, just take the beginning of the transcript
  if (!relevantContent) {
    relevantContent = content.substring(0, maxLength);
  }
  
  // Ensure we don't exceed max length
  if (relevantContent.length > maxLength) {
    relevantContent = relevantContent.substring(0, maxLength) + "...";
  }
  
  return relevantContent;
}

// Extract relevant sections from SEC filings
function extractRelevantSections(content: string, form: string) {
  if (!content) return "No content available";
  
  // Sections to look for in filings
  const sections = [
    "Management's Discussion and Analysis",
    "Risk Factors",
    "Business Outlook",
    "Forward-Looking Statements",
    "Results of Operations",
    "Liquidity and Capital Resources"
  ];
  
  let relevantContent = "";
  sections.forEach(section => {
    const regex = new RegExp(`(${section}.*?)(?:Item\\s\\d|$)`, "is");
    const match = content.match(regex);
    if (match && match[0]) {
      let extractedText = match[0].trim();
      // Limit size of each section
      if (extractedText.length > 2000) {
        extractedText = extractedText.substring(0, 2000) + "...";
      }
      relevantContent += `** ${section} **\n${extractedText}\n\n`;
    }
  });
  
  // If no sections found, extract a portion of the document
  if (!relevantContent) {
    relevantContent = content.substring(0, 6000) + "...";
  }
  
  // Limit total size
  if (relevantContent.length > 10000) {
    relevantContent = relevantContent.substring(0, 10000) + "...";
  }
  
  return relevantContent;
}

// Call OpenAI API to analyze the data
async function analyzeWithOpenAI(prompt: string) {
  const systemPrompt = `You are a financial analyst specialized in growth analysis. 
Your task is to analyze earnings call transcripts and SEC filings to identify insights about a company's growth prospects.
Focus on forward-looking statements, management's guidance, growth strategies, and any risks or challenges mentioned.

For each insight you find:
1. Determine if it's positive, negative, or neutral for the company's growth prospects
2. Note if it came from an earnings call transcript or SEC filing
3. Include the approximate date of the source
4. Provide a brief description of the insight

Format each insight as a JSON object with these properties:
- type: "positive", "negative", or "neutral"
- source: "earnings" or "filing"
- sourceDate: date in format "YYYY-MM-DD" or quarter (e.g., "Q2 2023")
- content: brief description of the insight (1-2 sentences)

Return an array of 3-5 of the most significant growth insights.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.DEFAULT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 1000,
        reasoning_effort: "medium"
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", responseData);
      throw new Error(`OpenAI API error: ${responseData.error?.message || "Unknown error"}`);
    }

    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    try {
      // Try to parse the JSON array from the content
      let insights;
      
      // First try to parse directly if the response is already JSON
      try {
        insights = JSON.parse(content);
      } catch (e) {
        // If direct parsing fails, try to extract JSON from the text
        const jsonMatch = content.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("Could not extract JSON from response");
        }
      }
      
      // Validate the parsed insights
      if (!Array.isArray(insights)) {
        throw new Error("Parsed result is not an array");
      }
      
      return insights;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      
      // If parsing fails, create a structured fallback
      return [
        {
          type: "neutral",
          source: "analysis",
          sourceDate: new Date().toISOString().split("T")[0],
          content: "Our AI system was unable to parse the growth insights. This may be due to insufficient data in the transcripts or filings."
        }
      ];
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw new Error(`OpenAI analysis failed: ${error.message}`);
  }
}
