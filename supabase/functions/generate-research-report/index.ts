
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user } } = await supabase.auth.getUser(req.headers.get("Authorization")?.split(" ")[1] || "");
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { reportRequest } = await req.json();

    if (!reportRequest || !reportRequest.symbol) {
      return new Response(
        JSON.stringify({ error: "Report request data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the prompt for OpenAI
    const prompt = `
    Create a professional equity research report for ${reportRequest.companyName} (${reportRequest.symbol}). 
    
    Company Information:
    - Sector: ${reportRequest.sector}
    - Industry: ${reportRequest.industry}
    - Description: ${reportRequest.description}
    
    Current Stock Information:
    - Price: $${reportRequest.stockData.price}
    - Market Cap: $${reportRequest.stockData.marketCap}
    - P/E Ratio: ${reportRequest.stockData.pe || "N/A"}
    - 52 Week Range: $${reportRequest.stockData.yearLow} - $${reportRequest.stockData.yearHigh}
    
    Based on the provided financial data, recent news, and industry trends, create a comprehensive equity research report with the following sections:
    
    1. Executive Summary (brief overview and recommendation)
    2. Business Overview (company description, products/services, market position)
    3. Industry Analysis (industry trends, competitive landscape)
    4. Financial Analysis (revenue trends, profitability, balance sheet health)
    5. Valuation (methodology, fair value estimate, target price)
    6. Investment Risks (potential downside risks)
    7. Investment Thesis (key reasons for recommendation)
    8. Price Target and Recommendation (Buy/Hold/Sell with 12-month price target)
    
    Make the report detailed, professional, and insightful, with specific numbers and analysis. Format your response as JSON with the following structure:
    {
      "symbol": "${reportRequest.symbol}",
      "companyName": "${reportRequest.companyName}",
      "date": "current date",
      "recommendation": "Buy/Hold/Sell",
      "targetPrice": "price target as string",
      "summary": "brief executive summary",
      "sections": [
        {"title": "section title", "content": "detailed section content"}
      ]
    }
    `;

    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a professional equity research analyst with expertise in financial analysis and stock valuations." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices || openAIData.choices.length === 0) {
      throw new Error("Failed to generate report: " + JSON.stringify(openAIData));
    }

    // Parse the response to JSON
    let reportContent;
    try {
      reportContent = JSON.parse(openAIData.choices[0].message.content);
    } catch (e) {
      throw new Error("Failed to parse OpenAI response: " + e.message);
    }

    // Store the report in the database
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert({
        user_id: user.id,
        symbol: reportRequest.symbol,
        company_name: reportRequest.companyName,
        report_data: reportContent
      })
      .select();

    if (reportError) {
      console.error("Error storing report:", reportError);
    }

    return new Response(
      JSON.stringify(reportContent),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-research-report function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
