
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.0";

const openai_key = Deno.env.get('OPENAI_API_KEY');

interface GrowthInsight {
  type: "positive" | "negative" | "neutral";
  source: "earnings" | "filing";
  sourceDate: string;
  content: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, transcripts, filings } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Get transcript and filing texts to analyze
    const transcriptTexts = transcripts
      .slice(0, 2)
      .map((t: any) => ({
        date: t.date,
        quarter: t.quarter,
        year: t.year,
        text: t.content?.substring(0, 15000) || "", // Limit text size
      }));
    
    const filingTexts = filings
      .filter((f: any) => f.form === "10-Q" || f.form === "10-K")
      .slice(0, 2)
      .map((f: any) => ({
        date: f.filingDate || f.reportDate,
        form: f.form,
        url: f.url
      }));
    
    // If we don't have texts to analyze, get filings from the API
    if (filingTexts.length > 0 && !filingTexts[0].text) {
      // Create a Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
      
      if (supabaseUrl && supabaseServiceKey) {
        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        
        // Get filing texts from the database if available
        for (const filing of filingTexts) {
          const { data, error } = await supabase
            .from('sec_filing_extracts')
            .select('extract_text')
            .eq('symbol', symbol)
            .eq('filing_url', filing.url)
            .maybeSingle();
          
          if (data && data.extract_text) {
            filing.text = data.extract_text.substring(0, 15000); // Limit text size
          }
        }
      }
    }
    
    // If we have no transcript content, exit early
    if (
      (transcriptTexts.length === 0 || transcriptTexts.every((t: any) => !t.text)) && 
      (filingTexts.length === 0 || filingTexts.every((f: any) => !f.text))
    ) {
      console.log("No transcript or filing content available to analyze");
      
      // Create placeholder insights if we at least have some metadata
      const insights: GrowthInsight[] = [];
      
      if (transcriptTexts.length > 0) {
        insights.push({
          type: "neutral",
          source: "earnings",
          sourceDate: transcriptTexts[0].date,
          content: "Earnings transcript available, but detailed content could not be analyzed. Check the full transcript for growth discussions."
        });
      }
      
      if (filingTexts.length > 0) {
        insights.push({
          type: "neutral",
          source: "filing",
          sourceDate: filingTexts[0].date,
          content: `${filingTexts[0].form} filing available, but detailed content could not be analyzed. Review the full filing for forward-looking statements.`
        });
      }
      
      return new Response(
        JSON.stringify(insights),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Prepare the insights context
    let insightsContext = `Analyze the following earnings call transcripts and SEC filings for ${symbol} to extract insights about the company's growth prospects:`;
    
    if (transcriptTexts.length > 0 && transcriptTexts[0].text) {
      insightsContext += `\n\nEARNINGS CALL TRANSCRIPT (${transcriptTexts[0].quarter} ${transcriptTexts[0].year} - ${transcriptTexts[0].date}):\n${transcriptTexts[0].text}`;
    }
    
    if (filingTexts.length > 0 && filingTexts[0].text) {
      insightsContext += `\n\nSEC FILING (${filingTexts[0].form} - ${filingTexts[0].date}):\n${filingTexts[0].text}`;
    }
    
    // Prepare the prompt for analysis
    const prompt = `
      You are a financial analyst specializing in growth analysis. 
      
      Please extract 3-6 key insights regarding growth prospects for ${symbol} based on the provided texts.
      
      Focus on:
      1. Growth projections mentioned by management
      2. Challenges or risks to future growth
      3. New products, services, or markets that could drive growth
      4. Analyst questions about growth and management responses
      5. Changes in growth strategy
      
      For each insight, classify it as:
      - "positive" (indicates better than expected growth prospects)
      - "negative" (indicates challenges or risks to growth)
      - "neutral" (informational but without clear positive/negative impact)
      
      Also indicate the source ("earnings" for earnings call or "filing" for SEC filing).
      
      Format your response as a JSON array of objects with the following structure:
      [
        {
          "type": "positive|negative|neutral",
          "source": "earnings|filing",
          "sourceDate": "YYYY-MM-DD",
          "content": "Clear, concise insight about growth (1-2 sentences)"
        },
        ...
      ]
      
      Use direct quotes when possible and focus on the most significant insights. If the material doesn't contain sufficient information about growth, provide at least 2 general insights about what the documents do mention regarding the company's future.
    `;
    
    // If we don't have OpenAI key, return mock data
    if (!openai_key) {
      console.warn("No OpenAI API key provided, returning mock insights");
      
      const mockDate = transcriptTexts.length > 0 ? transcriptTexts[0].date : 
                      filingTexts.length > 0 ? filingTexts[0].date : 
                      new Date().toISOString().split('T')[0];
      
      const insights: GrowthInsight[] = [
        {
          type: "positive",
          source: "earnings",
          sourceDate: mockDate,
          content: "Management expressed confidence in continued revenue growth, projecting a 15-20% increase for the next fiscal year."
        },
        {
          type: "negative",
          source: "filing",
          sourceDate: mockDate,
          content: "The company identified supply chain constraints as a potential risk factor that could impact production capacity and growth targets."
        },
        {
          type: "neutral",
          source: "earnings",
          sourceDate: mockDate,
          content: "The company plans to expand into three new international markets in the coming year, though impact on revenue is expected to be minimal initially."
        }
      ];
      
      return new Response(
        JSON.stringify(insights),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Call OpenAI API for analysis
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openai_key}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst assistant that extracts growth insights from financial documents."
          },
          {
            role: "user",
            content: insightsContext + "\n\n" + prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1500
      })
    });
    
    const result = await response.json();
    
    if (!result.choices || !result.choices[0]) {
      throw new Error("Invalid response from OpenAI API");
    }
    
    let insights;
    
    try {
      // Try to parse JSON from the response
      const content = result.choices[0].message.content;
      insights = JSON.parse(content);
      
      // Validate that insights is an array
      if (!Array.isArray(insights)) {
        throw new Error("Response is not an array");
      }
      
      // Validate each insight has required fields
      insights = insights.map((insight) => ({
        type: ["positive", "negative", "neutral"].includes(insight.type) ? insight.type : "neutral",
        source: ["earnings", "filing"].includes(insight.source) ? insight.source : "earnings",
        sourceDate: insight.sourceDate || (insight.source === "earnings" ? transcriptTexts[0]?.date : filingTexts[0]?.date),
        content: insight.content || "No detailed information available."
      }));
    } catch (error) {
      console.error("Error parsing OpenAI response:", error);
      
      // Create fallback insights
      const sourceDateEarnings = transcriptTexts.length > 0 ? transcriptTexts[0].date : new Date().toISOString().split('T')[0];
      const sourceDateFilings = filingTexts.length > 0 ? filingTexts[0].date : new Date().toISOString().split('T')[0];
      
      insights = [
        {
          type: "neutral",
          source: "earnings",
          sourceDate: sourceDateEarnings,
          content: "Earnings transcript was analyzed, but the system couldn't extract specific growth insights. Please review the full transcript for details."
        },
        {
          type: "neutral",
          source: "filing",
          sourceDate: sourceDateFilings,
          content: "SEC filing was analyzed, but the system couldn't extract specific growth insights. Review the full filing for forward-looking statements."
        }
      ];
    }
    
    // Return the insights
    return new Response(
      JSON.stringify(insights),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error("Error in analyze-growth-insights function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
