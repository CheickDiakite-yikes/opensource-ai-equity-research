
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Handle the request
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    const fmpApiKey = Deno.env.get("FMP_API_KEY");
    
    if (!openaiApiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }
    
    if (!fmpApiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    // Parse request body
    const { symbol, refreshCache = false } = await req.json();
    
    if (!symbol) {
      throw new Error("Symbol is required");
    }
    
    console.log(`Processing DCF assumptions for ${symbol}, refreshCache: ${refreshCache}`);
    
    // Check cache if not forcing refresh
    if (!refreshCache) {
      const cacheResult = await checkCache(symbol);
      if (cacheResult) {
        console.log(`Using cached DCF assumptions for ${symbol}`);
        return new Response(JSON.stringify(cacheResult), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    
    // Fetch company profile and financial data
    const profile = await fetchCompanyProfile(symbol, fmpApiKey);
    const incomeStatements = await fetchIncomeStatements(symbol, fmpApiKey);
    const balanceSheets = await fetchBalanceSheets(symbol, fmpApiKey);
    const cashFlows = await fetchCashFlows(symbol, fmpApiKey);
    const ratios = await fetchFinancialRatios(symbol, fmpApiKey);
    
    // Prepare data for analysis
    const companyData = {
      profile,
      incomeStatements: incomeStatements.slice(0, 3), // Last 3 years
      balanceSheets: balanceSheets.slice(0, 3), // Last 3 years
      cashFlows: cashFlows.slice(0, 3), // Last 3 years
      financialRatios: ratios.slice(0, 3), // Last 3 years
    };
    
    // Generate AI-powered assumptions
    const assumptions = await generateAssumptions(symbol, companyData, openaiApiKey);
    
    // Cache the results
    await cacheResults(symbol, assumptions);
    
    return new Response(JSON.stringify(assumptions), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`Error generating DCF assumptions:`, error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to generate DCF assumptions",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Check if we have cached results for this symbol
async function checkCache(symbol: string) {
  try {
    // This would normally connect to a database, but for simplicity
    // we're just mocking it for now
    // In a real implementation, check if the cached entry exists and is not expired
    return null; // No cache found, returning null
  } catch (error) {
    console.error(`Error checking cache:`, error);
    return null;
  }
}

// Cache the generated assumptions
async function cacheResults(symbol: string, assumptions: any) {
  try {
    // This would normally connect to a database to store the results
    console.log(`Caching DCF assumptions for ${symbol}`);
    // Implementation would go here
  } catch (error) {
    console.error(`Error caching results:`, error);
  }
}

// Fetch company profile from FMP API
async function fetchCompanyProfile(symbol: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch company profile: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    console.error(`Error fetching company profile:`, error);
    throw error;
  }
}

// Fetch income statements from FMP API
async function fetchIncomeStatements(symbol: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/income-statement/${symbol}?limit=5&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch income statements: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching income statements:`, error);
    throw error;
  }
}

// Fetch balance sheets from FMP API
async function fetchBalanceSheets(symbol: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/balance-sheet-statement/${symbol}?limit=5&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch balance sheets: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching balance sheets:`, error);
    throw error;
  }
}

// Fetch cash flow statements from FMP API
async function fetchCashFlows(symbol: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/cash-flow-statement/${symbol}?limit=5&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch cash flows: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching cash flows:`, error);
    throw error;
  }
}

// Fetch financial ratios from FMP API
async function fetchFinancialRatios(symbol: string, apiKey: string) {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/ratios/${symbol}?limit=5&apikey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch financial ratios: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching financial ratios:`, error);
    throw error;
  }
}

// Generate DCF assumptions using OpenAI
async function generateAssumptions(symbol: string, companyData: any, apiKey: string) {
  try {
    console.log(`Generating DCF assumptions with AI for ${symbol}`);
    
    // Calculate some financial metrics to help the AI
    const latestIncome = companyData.incomeStatements[0];
    const previousIncome = companyData.incomeStatements[1];
    
    const latestBalance = companyData.balanceSheets[0];
    const latestCashFlow = companyData.cashFlows[0];
    const latestRatios = companyData.financialRatios[0];
    
    // Calculate growth rates and ratios
    const revenueGrowth = previousIncome ? 
      (latestIncome.revenue - previousIncome.revenue) / previousIncome.revenue : 0.05;
    
    const ebitdaMargin = latestIncome.ebitda / latestIncome.revenue;
    const ebitMargin = latestIncome.ebit / latestIncome.revenue;
    
    // Prepare prompt for OpenAI
    const prompt = `
As a financial analyst, I need you to determine accurate DCF model parameters for ${symbol} (${companyData.profile?.companyName || symbol}).

Based on the following financial data, provide me with precise decimal values (not percentages) for DCF parameters:

Company Profile:
- Industry: ${companyData.profile?.industry || "N/A"}
- Sector: ${companyData.profile?.sector || "N/A"}
- Beta: ${companyData.profile?.beta || "N/A"}
- Market Cap: ${companyData.profile?.mktCap || "N/A"}

Recent Financial Performance:
- Revenue: ${latestIncome?.revenue || "N/A"}
- Revenue Growth Rate: ${(revenueGrowth * 100).toFixed(2)}%
- EBITDA: ${latestIncome?.ebitda || "N/A"} (${(ebitdaMargin * 100).toFixed(2)}% margin)
- EBIT: ${latestIncome?.ebit || "N/A"} (${(ebitMargin * 100).toFixed(2)}% margin)
- Net Income: ${latestIncome?.netIncome || "N/A"}
- Operating Cash Flow: ${latestCashFlow?.operatingCashFlow || "N/A"}
- Capital Expenditure: ${latestCashFlow?.capitalExpenditure || "N/A"}
- Current Tax Rate: ${latestIncome?.incomeTaxExpense / latestIncome?.incomeBeforeTax || "N/A"}

I need you to provide ONLY the following parameters as decimal values (not percentages):

1. revenueGrowthPct: [decimal]
2. ebitdaPct: [decimal]
3. depreciationAndAmortizationPct: [decimal]
4. cashAndShortTermInvestmentsPct: [decimal]
5. receivablesPct: [decimal]
6. inventoriesPct: [decimal]
7. payablesPct: [decimal]
8. ebitPct: [decimal]
9. capitalExpenditurePct: [decimal]
10. operatingCashFlowPct: [decimal]
11. sellingGeneralAndAdministrativeExpensesPct: [decimal]
12. taxRatePct: [decimal]
13. longTermGrowthRatePct: [decimal] (in decimal form, typically 0.02-0.04)
14. costOfEquityPct: [decimal] (in decimal form, typically 0.08-0.12)
15. costOfDebtPct: [decimal] (in decimal form, typically 0.03-0.06)
16. marketRiskPremiumPct: [decimal] (in decimal form, typically 0.04-0.06)
17. riskFreeRatePct: [decimal] (in decimal form, typically 0.03-0.05)
18. beta: [decimal] (typically 0.5-2.0)

Also provide a brief explanation of your reasoning.

Respond ONLY with a JSON object containing these parameters and your explanation.
    `;
    
    // Make request to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "You are a financial expert specialized in DCF valuation models." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }
    
    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }
    
    // Parse the AI response as JSON
    let parsedResponse;
    try {
      // Extract JSON from the response (in case AI adds extra text)
      const jsonMatch = aiResponse.match(/(\{[\s\S]*\})/);
      const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
      parsedResponse = JSON.parse(jsonStr);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      console.log("AI response:", aiResponse);
      
      // Fallback to default values if parsing fails
      parsedResponse = getDefaultAssumptions(symbol, companyData);
    }
    
    // Validate and normalize parameters
    const assumptions = normalizeParameters(parsedResponse, companyData);
    
    // Create the final response object
    const result = {
      symbol,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      assumptions,
      explanation: parsedResponse.explanation || "Generated based on historical financial data analysis.",
    };
    
    return result;
  } catch (error) {
    console.error(`Error generating assumptions with AI:`, error);
    
    // Return default values if AI generation fails
    return {
      symbol,
      timestamp: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
      assumptions: getDefaultAssumptions(symbol, companyData).parameters,
      explanation: "Generated using default industry parameters due to error in AI analysis.",
    };
  }
}

// Normalize parameters to ensure they are within reasonable ranges
function normalizeParameters(aiResponse: any, companyData: any) {
  // Extract the parameters from the AI response
  const params = aiResponse.parameters || aiResponse;
  
  // Default beta from company data if available
  const defaultBeta = companyData.profile?.beta || 1.2;
  
  // Normalize and validate each parameter
  return {
    revenueGrowthPct: clamp(params.revenueGrowthPct, 0.02, 0.3),
    ebitdaMarginPct: clamp(params.ebitdaPct, 0.05, 0.5),
    capitalExpenditurePct: clamp(params.capitalExpenditurePct, 0.01, 0.2),
    taxRatePct: clamp(params.taxRatePct, 0.1, 0.4),
    
    depreciationAndAmortizationPct: clamp(params.depreciationAndAmortizationPct, 0.01, 0.2),
    cashAndShortTermInvestmentsPct: clamp(params.cashAndShortTermInvestmentsPct, 0.05, 0.5),
    receivablesPct: clamp(params.receivablesPct, 0.05, 0.3),
    inventoriesPct: clamp(params.inventoriesPct, 0.01, 0.3),
    payablesPct: clamp(params.payablesPct, 0.05, 0.3),
    ebitPct: clamp(params.ebitPct, 0.05, 0.4),
    operatingCashFlowPct: clamp(params.operatingCashFlowPct, 0.05, 0.4),
    sellingGeneralAndAdministrativeExpensesPct: clamp(params.sellingGeneralAndAdministrativeExpensesPct, 0.05, 0.3),
    
    longTermGrowthRatePct: clamp(params.longTermGrowthRatePct, 0.02, 0.05),
    costOfEquityPct: clamp(params.costOfEquityPct, 0.07, 0.15),
    costOfDebtPct: clamp(params.costOfDebtPct, 0.02, 0.08),
    marketRiskPremiumPct: clamp(params.marketRiskPremiumPct, 0.04, 0.07),
    riskFreeRatePct: clamp(params.riskFreeRatePct, 0.02, 0.05),
    
    beta: params.beta || defaultBeta,
  };
}

// Helper function to clamp values to a range
function clamp(value: number, min: number, max: number): number {
  if (isNaN(value) || value === null || value === undefined) {
    return (min + max) / 2; // Default to the middle of the range
  }
  return Math.max(min, Math.min(max, value));
}

// Get default assumptions if AI generation fails
function getDefaultAssumptions(symbol: string, companyData: any) {
  const profile = companyData.profile || {};
  const beta = profile.beta || 1.2;
  
  // Determine industry/sector-specific defaults based on profile
  const isTech = profile.sector === "Technology" || profile.industry?.includes("Tech");
  const isFinancial = profile.sector === "Financial Services" || profile.industry?.includes("Bank");
  const isHealthcare = profile.sector === "Healthcare" || profile.industry?.includes("Health");
  
  // Adjust growth rates based on sector
  let revenueGrowth = 0.08; // Default
  if (isTech) revenueGrowth = 0.12;
  if (isFinancial) revenueGrowth = 0.05;
  if (isHealthcare) revenueGrowth = 0.09;
  
  return {
    parameters: {
      revenueGrowthPct: revenueGrowth,
      ebitdaMarginPct: 0.25,
      capitalExpenditurePct: 0.03,
      taxRatePct: 0.21,
      
      depreciationAndAmortizationPct: 0.035,
      cashAndShortTermInvestmentsPct: 0.15,
      receivablesPct: 0.12,
      inventoriesPct: 0.08,
      payablesPct: 0.1,
      ebitPct: 0.22,
      operatingCashFlowPct: 0.2,
      sellingGeneralAndAdministrativeExpensesPct: 0.15,
      
      longTermGrowthRatePct: 0.03,
      costOfEquityPct: 0.09,
      costOfDebtPct: 0.04,
      marketRiskPremiumPct: 0.05,
      riskFreeRatePct: 0.035,
      
      beta: beta,
    },
    explanation: "Using industry-standard default assumptions adjusted for the company's sector."
  };
}
