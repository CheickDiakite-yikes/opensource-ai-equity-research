
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
    const { symbol, stockData, financials, news } = await req.json();

    if (!symbol || !stockData) {
      return new Response(
        JSON.stringify({ error: "Symbol and stock data are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare the prompt for OpenAI
    const prompt = `
    Based on the financial data and news for ${symbol}, predict the stock price for the following time periods:
    - 1 month
    - 3 months
    - 6 months
    - 1 year
    
    Current stock information:
    - Current price: $${stockData.price}
    - Market cap: $${stockData.marketCap}
    - P/E ratio: ${stockData.pe || "N/A"}
    - 52-week range: $${stockData.yearLow} - $${stockData.yearHigh}
    
    Also provide:
    - A brief sentiment analysis
    - Confidence level (a percentage)
    - Key drivers for the prediction
    - Potential risks
    
    Format your response as JSON with the following structure:
    {
      "symbol": "${symbol}",
      "currentPrice": ${stockData.price},
      "predictedPrice": {
        "oneMonth": number,
        "threeMonths": number,
        "sixMonths": number,
        "oneYear": number
      },
      "sentimentAnalysis": "string",
      "confidenceLevel": number,
      "keyDrivers": ["string", "string", "string"],
      "risks": ["string", "string", "string"]
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
          { 
            role: "system", 
            content: "You are a financial analyst with expertise in stock price prediction and technical analysis." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    const openAIData = await openAIResponse.json();
    
    if (!openAIData.choices || openAIData.choices.length === 0) {
      throw new Error("Failed to generate prediction: " + JSON.stringify(openAIData));
    }

    // Parse the response to JSON
    let prediction;
    try {
      prediction = JSON.parse(openAIData.choices[0].message.content);
    } catch (e) {
      throw new Error("Failed to parse OpenAI response: " + e.message);
    }

    return new Response(
      JSON.stringify(prediction),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in predict-stock-price function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
