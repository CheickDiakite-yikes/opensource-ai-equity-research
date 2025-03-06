
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { FMP_API_KEY, API_BASE_URLS } from "../_shared/constants.ts";
import { OPENAI_API_KEY } from "../_shared/constants.ts";

// Cache control headers
const cacheHeaders = {
  'Cache-Control': 'public, max-age=3600',
  'Vary': 'Origin, Accept-Encoding',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request data
    const { symbol, refreshCache = false } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter", details: "Symbol is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Processing AI DCF assumptions for ${symbol}, refreshCache=${refreshCache}`);
    
    // Check if we have OpenAI API key
    if (!OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY not set in environment variables");
      return new Response(
        JSON.stringify({ error: "API key not configured", details: "OPENAI_API_KEY environment variable is missing" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch financial data from FMP API
    const financialData = await fetchFinancialData(symbol);
    
    if (!financialData) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch financial data", details: `Could not retrieve data for ${symbol}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Generate AI assumptions
    const assumptions = await generateAIAssumptions(symbol, financialData);
    
    // Return the AI-generated DCF assumptions
    return new Response(
      JSON.stringify(assumptions),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...cacheHeaders
        } 
      }
    );
    
  } catch (error) {
    console.error("Error generating DCF assumptions:", error);
    
    // Generate mock assumptions as fallback
    const mockAssumptions = createMockAssumptions(error instanceof Error ? error.message : String(error));
    
    return new Response(
      JSON.stringify(mockAssumptions),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Mock-Data': 'true'
        } 
      }
    );
  }
});

// Fetch financial data from FMP API
async function fetchFinancialData(symbol: string) {
  try {
    // Fetch income statements
    const incomeUrl = `${API_BASE_URLS.FMP}/income-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
    console.log(`Fetching income statement for ${symbol}`);
    
    const incomeResponse = await fetch(incomeUrl);
    if (!incomeResponse.ok) {
      console.error(`Error fetching income statement: ${incomeResponse.status}`);
      throw new Error(`Failed to fetch income statement for ${symbol}`);
    }
    
    const incomeData = await incomeResponse.json();
    
    if (!Array.isArray(incomeData) || incomeData.length === 0) {
      console.error("Empty income statement data");
      throw new Error("No income statement data available");
    }
    
    // Fetch cash flow statements
    const cashFlowUrl = `${API_BASE_URLS.FMP}/cash-flow-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
    console.log(`Fetching cash flow statement for ${symbol}`);
    
    const cashFlowResponse = await fetch(cashFlowUrl);
    if (!cashFlowResponse.ok) {
      console.error(`Error fetching cash flow statement: ${cashFlowResponse.status}`);
      // Continue even if we can't get cash flow data
    }
    
    let cashFlowData = [];
    try {
      cashFlowData = await cashFlowResponse.json();
    } catch (e) {
      console.error("Error parsing cash flow data", e);
      // Continue with empty cash flow data
    }
    
    // Combine the data
    return {
      income: incomeData,
      cashFlow: Array.isArray(cashFlowData) ? cashFlowData : []
    };
    
  } catch (error) {
    console.error("Error fetching financial data:", error);
    throw error;
  }
}

// Generate AI-based DCF assumptions using your approach
async function generateAIAssumptions(symbol: string, financialData: any) {
  try {
    // Extract relevant financial data for the model
    const revenueData = financialData.income.map((stmt: any) => ({
      date: stmt.date || stmt.calendarYear,
      revenue: stmt.revenue,
      netIncome: stmt.netIncome || 0,
    }));
    
    // Extract cash flow data if available
    const cashFlowData = financialData.cashFlow.map((stmt: any) => ({
      date: stmt.date || stmt.calendarYear,
      operatingCashFlow: stmt.operatingCashFlow || 0,
      capitalExpenditure: stmt.capitalExpenditure || 0,
      freeCashFlow: stmt.freeCashFlow || 0,
    }));

    // Prepare the prompt for OpenAI similar to your example
    const prompt = `
      I have the following historical financial data for company ${symbol}:
      
      Revenue Data:
      ${JSON.stringify(revenueData, null, 2)}
      
      Cash Flow Data:
      ${JSON.stringify(cashFlowData, null, 2)}
      
      Please provide reasonable assumptions for a DCF valuation with the following parameters:
      1. averageRevenueGrowth (annual growth rate as decimal)
      2. wacc (weighted average cost of capital as decimal)
      3. terminalGrowth (long term growth rate as decimal)
      4. taxRate (effective tax rate as decimal)
      5. ebitdaMargin (EBITDA margin as decimal)
      6. capitalExpenditurePercent (CapEx as % of revenue as decimal)
      
      Return your answer in valid JSON only, with the following structure:
      {
        "explanation": "Briefly explain your reasoning",
        "assumptions": {
          "averageRevenueGrowth": number,
          "wacc": number,
          "terminalGrowth": number,
          "taxRate": number,
          "ebitdaMargin": number,
          "capitalExpenditurePercent": number
        }
      }
    `;

    console.log("Calling OpenAI to generate DCF assumptions");
    
    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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
            content: "You are a financial analyst specializing in DCF valuations. Provide realistic assumptions based on historical data."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      console.error(`OpenAI API Error: ${response.status}`);
      throw new Error("Failed to generate AI assumptions");
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }
    
    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract the JSON from the response (in case it returns markdown or additional text)
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/{[\s\S]*}/);
      const jsonContent = jsonMatch ? jsonMatch[0] : content;
      
      parsedResponse = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Error parsing OpenAI response:", e, "Raw response:", content);
      throw new Error("Failed to parse AI response");
    }
    
    // Create final result
    const aiAssumptions = {
      symbol,
      company: symbol, // Replace with actual company name if available
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      explanation: parsedResponse.explanation || "AI-generated DCF assumptions based on historical financial data",
      assumptions: {
        // Map the received assumptions to our expected format
        revenueGrowthPct: parsedResponse.assumptions.averageRevenueGrowth || 0.085,
        ebitdaMarginPct: parsedResponse.assumptions.ebitdaMargin || 0.30,
        capitalExpenditurePct: parsedResponse.assumptions.capitalExpenditurePercent || 0.05,
        taxRatePct: parsedResponse.assumptions.taxRate || 0.21,
        longTermGrowthRatePct: parsedResponse.assumptions.terminalGrowth || 0.03,
        costOfEquityPct: 0.10,
        costOfDebtPct: 0.05,
        marketRiskPremiumPct: 0.05,
        riskFreeRatePct: 0.04,
        beta: 1.2,
        // Add additional fields to match our core data structure
        depreciationAndAmortizationPct: 0.05,
        cashAndShortTermInvestmentsPct: 0.15,
        receivablesPct: 0.12,
        inventoriesPct: 0.08,
        payablesPct: 0.10,
        ebitPct: 0.25,
        operatingCashFlowPct: 0.25,
        sellingGeneralAndAdministrativeExpensesPct: 0.15
      }
    };
    
    console.log(`Generated AI DCF assumptions for ${symbol}`, aiAssumptions);
    return aiAssumptions;
    
  } catch (error) {
    console.error("Error generating AI assumptions:", error);
    throw error;
  }
}

// Create mock assumptions for fallback
function createMockAssumptions(errorMessage: string) {
  const currentDate = new Date();
  
  return {
    symbol: "N/A",
    company: "Unknown Company",
    timestamp: currentDate.toISOString(),
    expiresAt: new Date(currentDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    explanation: `Using default assumptions due to an error: ${errorMessage}`,
    assumptions: {
      revenueGrowthPct: 0.085,
      ebitdaMarginPct: 0.3127,
      capitalExpenditurePct: 0.0306,
      taxRatePct: 0.21,
      longTermGrowthRatePct: 0.03,
      costOfEquityPct: 0.0951,
      costOfDebtPct: 0.0364,
      marketRiskPremiumPct: 0.0472,
      riskFreeRatePct: 0.0364,
      beta: 1.244,
      depreciationAndAmortizationPct: 0.0345,
      cashAndShortTermInvestmentsPct: 0.2344,
      receivablesPct: 0.1533,
      inventoriesPct: 0.0155,
      payablesPct: 0.1614,
      ebitPct: 0.2781,
      operatingCashFlowPct: 0.2886,
      sellingGeneralAndAdministrativeExpensesPct: 0.0662
    },
    isMock: true
  };
}
