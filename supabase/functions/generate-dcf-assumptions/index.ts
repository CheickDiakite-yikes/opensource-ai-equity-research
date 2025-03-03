import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Environment variables
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') || '';
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || '';
const FMP_API_KEY = Deno.env.get('FMP_API_KEY') || '';

// Create a Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

interface CompanyProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  sector: string;
  industry: string;
  description: string;
  // ... other properties
}

interface GrowthData {
  symbol: string;
  period: string;
  revenueGrowth: number;
  grossProfitGrowth: number;
  ebitgrowth: number;
  operatingIncomeGrowth: number;
  netIncomeGrowth: number;
  operatingCashFlowGrowth: number;
  // ... other properties
}

interface AIDCFSuggestion {
  symbol: string;
  timestamp: string;
  expiresAt: string;
  assumptions: {
    revenueGrowthPct: number;
    ebitdaMarginPct: number;
    capitalExpenditurePct: number;
    taxRatePct: number;
    depreciationAndAmortizationPct: number;
    cashAndShortTermInvestmentsPct: number;
    receivablesPct: number;
    inventoriesPct: number;
    payablesPct: number;
    ebitPct: number;
    operatingCashFlowPct: number;
    sellingGeneralAndAdministrativeExpensesPct: number;
    longTermGrowthRatePct: number;
    costOfEquityPct: number;
    costOfDebtPct: number;
    marketRiskPremiumPct: number;
    riskFreeRatePct: number;
    beta: number;
  };
  explanation: string;
  industryComparison?: {
    revenueGrowth: { company: number; industry: number; difference: string };
    profitMargin: { company: number; industry: number; difference: string };
    debtRatio: { company: number; industry: number; difference: string };
  };
}

async function fetchCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  try {
    const url = `https://financialmodelingprep.com/api/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
    console.log(`Fetching company profile for ${symbol}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0) {
      return data[0] as CompanyProfile;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error);
    return null;
  }
}

async function fetchFinancialGrowth(symbol: string): Promise<GrowthData | null> {
  try {
    const url = `https://financialmodelingprep.com/api/v3/financial-growth/${symbol}?period=annual&limit=1&apikey=${FMP_API_KEY}`;
    console.log(`Fetching financial growth for ${symbol}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0) {
      return data[0] as GrowthData;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching financial growth for ${symbol}:`, error);
    return null;
  }
}

async function fetchKeyRatios(symbol: string): Promise<any | null> {
  try {
    const url = `https://financialmodelingprep.com/api/v3/ratios/${symbol}?period=annual&limit=1&apikey=${FMP_API_KEY}`;
    console.log(`Fetching key ratios for ${symbol}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && Array.isArray(data) && data.length > 0) {
      return data[0];
    }
    return null;
  } catch (error) {
    console.error(`Error fetching key ratios for ${symbol}:`, error);
    return null;
  }
}

async function fetchIndustryMetrics(industry: string): Promise<any | null> {
  try {
    const url = `https://financialmodelingprep.com/api/v4/industry/ratios?industry=${encodeURIComponent(industry)}&apikey=${FMP_API_KEY}`;
    console.log(`Fetching industry metrics for ${industry}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data) {
      return data;
    }
    return null;
  } catch (error) {
    console.error(`Error fetching industry metrics for ${industry}:`, error);
    return null;
  }
}

async function generateDCFAssumptions(
  profile: CompanyProfile,
  growthData: GrowthData,
  keyRatios: any,
  industryMetrics: any
): Promise<AIDCFSuggestion> {
  console.log(`Generating AI DCF assumptions for ${profile.symbol}`);
  
  try {
    // Prepare context data for the AI
    const analysisData = {
      profile: {
        symbol: profile.symbol,
        name: profile.companyName,
        industry: profile.industry,
        sector: profile.sector,
        beta: profile.beta,
        description: profile.description?.substring(0, 500) || "",
      },
      financialGrowth: {
        revenueGrowth: growthData.revenueGrowth,
        ebitGrowth: growthData.ebitgrowth,
        operatingIncomeGrowth: growthData.operatingIncomeGrowth,
        netIncomeGrowth: growthData.netIncomeGrowth,
        operatingCashFlowGrowth: growthData.operatingCashFlowGrowth,
      },
      keyRatios: {
        ebitdaMargin: keyRatios.ebitdaMargin,
        ebitMargin: keyRatios.ebitMargin,
        netProfitMargin: keyRatios.netProfitMargin,
        taxRate: keyRatios.effectiveTaxRate,
        debtToAssets: keyRatios.debtRatio,
        debtToEquity: keyRatios.debtEquityRatio,
        returnOnEquity: keyRatios.returnOnEquity,
        returnOnAssets: keyRatios.returnOnAssets,
      },
      industryAverages: industryMetrics || {
        revenueGrowth: 0.05,  // Default if not available
        ebitdaMargin: 0.25,
        taxRate: 0.25,
      }
    };
    
    // Build the AI prompt
    const systemPrompt = `You are a financial analyst expert specialized in Discounted Cash Flow (DCF) modeling. Your task is to analyze company data and provide accurate DCF input parameters based on historical financial data, growth trends, and industry metrics.`;
    
    const userPrompt = `Please analyze the following company data for ${profile.symbol} (${profile.companyName}) and provide DCF input parameters:
    
Company Profile:
- Symbol: ${profile.symbol}
- Name: ${profile.companyName}
- Industry: ${profile.industry}
- Sector: ${profile.sector}
- Beta: ${profile.beta}
- Description: ${profile.description?.substring(0, 500) || "N/A"}

Financial Growth Metrics:
- Revenue Growth: ${(growthData.revenueGrowth * 100).toFixed(2)}%
- EBIT Growth: ${(growthData.ebitgrowth * 100).toFixed(2)}%
- Operating Income Growth: ${(growthData.operatingIncomeGrowth * 100).toFixed(2)}%
- Net Income Growth: ${(growthData.netIncomeGrowth * 100).toFixed(2)}%
- Operating Cash Flow Growth: ${(growthData.operatingCashFlowGrowth * 100).toFixed(2)}%

Key Financial Ratios:
- EBITDA Margin: ${(keyRatios.ebitdaMargin * 100).toFixed(2)}%
- EBIT Margin: ${(keyRatios.ebitMargin * 100).toFixed(2)}%
- Net Profit Margin: ${(keyRatios.netProfitMargin * 100).toFixed(2)}%
- Effective Tax Rate: ${(keyRatios.effectiveTaxRate * 100).toFixed(2)}%
- Debt Ratio: ${(keyRatios.debtRatio * 100).toFixed(2)}%
- Debt to Equity Ratio: ${keyRatios.debtEquityRatio.toFixed(2)}
- Return on Equity: ${(keyRatios.returnOnEquity * 100).toFixed(2)}%
- Return on Assets: ${(keyRatios.returnOnAssets * 100).toFixed(2)}%

Based on this data, provide the following DCF input parameters:

1. Revenue Growth Percentage (for first 5 years)
2. EBITDA Margin Percentage
3. Capital Expenditure Percentage (of revenue)
4. Tax Rate Percentage
5. Depreciation and Amortization Percentage (of revenue)
6. Cash & Short-Term Investments Percentage (of revenue)
7. Receivables Percentage (of revenue)
8. Inventories Percentage (of revenue)
9. Payables Percentage (of revenue)
10. EBIT Percentage (of revenue)
11. Operating Cash Flow Percentage (of revenue)
12. SG&A Expenses Percentage (of revenue)
13. Long-Term Growth Rate Percentage (terminal value)
14. Cost of Equity Percentage
15. Cost of Debt Percentage
16. Market Risk Premium Percentage
17. Risk-Free Rate Percentage
18. Beta value

Provide your response as a JSON object with parameter values (not in percentage format, use decimal e.g., 0.0525 for 5.25%) and a brief explanation of your reasoning. Also include a comparison with industry averages where relevant.`;

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2,
        max_tokens: 2000,
      }),
    });
    
    const aiResponse = await response.json();
    
    // Parse AI response
    if (!aiResponse.choices || !aiResponse.choices[0]?.message?.content) {
      throw new Error("Invalid AI response");
    }
    
    const aiContent = aiResponse.choices[0].message.content;
    console.log("AI Response received:", aiContent.substring(0, 200) + "...");
    
    // Extract the JSON from the response (it might be surrounded by markdown code blocks)
    let jsonStr = aiContent;
    if (jsonStr.includes('```json')) {
      jsonStr = jsonStr.split('```json')[1].split('```')[0].trim();
    } else if (jsonStr.includes('```')) {
      jsonStr = jsonStr.split('```')[1].split('```')[0].trim();
    }
    
    let aiParams;
    try {
      aiParams = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response as JSON", e);
      console.log("AI content:", aiContent);
      
      // Fallback to regex extraction if JSON parsing fails
      aiParams = {
        revenueGrowthPct: parseFloat((growthData.revenueGrowth || 0.05).toFixed(4)),
        ebitdaMarginPct: parseFloat((keyRatios.ebitdaMargin || 0.25).toFixed(4)),
        capitalExpenditurePct: 0.03,
        taxRatePct: parseFloat((keyRatios.effectiveTaxRate || 0.25).toFixed(4)),
        depreciationAndAmortizationPct: 0.035,
        cashAndShortTermInvestmentsPct: 0.20,
        receivablesPct: 0.15,
        inventoriesPct: 0.10,
        payablesPct: 0.15,
        ebitPct: parseFloat((keyRatios.ebitMargin || 0.20).toFixed(4)),
        operatingCashFlowPct: parseFloat((growthData.operatingCashFlowGrowth || 0.20).toFixed(4)),
        sellingGeneralAndAdministrativeExpensesPct: 0.10,
        longTermGrowthRatePct: 0.03,
        costOfEquityPct: 0.09,
        costOfDebtPct: 0.04,
        marketRiskPremiumPct: 0.05,
        riskFreeRatePct: 0.04,
        beta: profile.beta || 1.0
      };
    }
    
    // Create the final return object
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 12); // Expire in 12 hours
    
    const suggestion: AIDCFSuggestion = {
      symbol: profile.symbol,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      assumptions: {
        revenueGrowthPct: aiParams.revenueGrowthPct || parseFloat(growthData.revenueGrowth.toFixed(4)),
        ebitdaMarginPct: aiParams.ebitdaMarginPct || parseFloat(keyRatios.ebitdaMargin.toFixed(4)),
        capitalExpenditurePct: aiParams.capitalExpenditurePct || 0.03,
        taxRatePct: aiParams.taxRatePct || parseFloat(keyRatios.effectiveTaxRate.toFixed(4)),
        depreciationAndAmortizationPct: aiParams.depreciationAndAmortizationPct || 0.035,
        cashAndShortTermInvestmentsPct: aiParams.cashAndShortTermInvestmentsPct || 0.20,
        receivablesPct: aiParams.receivablesPct || 0.15,
        inventoriesPct: aiParams.inventoriesPct || 0.10,
        payablesPct: aiParams.payablesPct || 0.15,
        ebitPct: aiParams.ebitPct || parseFloat(keyRatios.ebitMargin.toFixed(4)),
        operatingCashFlowPct: aiParams.operatingCashFlowPct || parseFloat((growthData.operatingCashFlowGrowth || 0.20).toFixed(4)),
        sellingGeneralAndAdministrativeExpensesPct: aiParams.sellingGeneralAndAdministrativeExpensesPct || 0.10,
        longTermGrowthRatePct: aiParams.longTermGrowthRatePct || 0.03,
        costOfEquityPct: aiParams.costOfEquityPct || 0.09,
        costOfDebtPct: aiParams.costOfDebtPct || 0.04,
        marketRiskPremiumPct: aiParams.marketRiskPremiumPct || 0.05,
        riskFreeRatePct: aiParams.riskFreeRatePct || 0.04,
        beta: aiParams.beta || profile.beta || 1.0
      },
      explanation: aiParams.explanation || `DCF assumptions generated based on financial data for ${profile.companyName} (${profile.symbol}). Revenue growth of ${(aiParams.revenueGrowthPct * 100).toFixed(2)}% based on historical growth of ${(growthData.revenueGrowth * 100).toFixed(2)}%.`
    };
    
    // Add industry comparison if available
    if (industryMetrics) {
      suggestion.industryComparison = {
        revenueGrowth: { 
          company: suggestion.assumptions.revenueGrowthPct * 100, 
          industry: (industryMetrics.revenueGrowth || 5) * 100,
          difference: suggestion.assumptions.revenueGrowthPct > (industryMetrics.revenueGrowth || 0.05) ? "higher" : "lower"
        },
        profitMargin: { 
          company: suggestion.assumptions.ebitdaMarginPct * 100, 
          industry: (industryMetrics.ebitdaMargin || 25) * 100,
          difference: suggestion.assumptions.ebitdaMarginPct > (industryMetrics.ebitdaMargin || 0.25) ? "higher" : "lower"
        },
        debtRatio: { 
          company: keyRatios.debtRatio * 100, 
          industry: (industryMetrics.debtRatio || 30) * 100,
          difference: keyRatios.debtRatio > (industryMetrics.debtRatio || 0.3) ? "higher" : "lower"
        }
      };
    }
    
    return suggestion;
  } catch (error) {
    console.error(`Error generating DCF assumptions for ${profile.symbol}:`, error);
    
    // Provide fallback values if AI fails
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 12); // Expire in 12 hours
    
    return {
      symbol: profile.symbol,
      timestamp: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      assumptions: {
        revenueGrowthPct: parseFloat((growthData.revenueGrowth || 0.05).toFixed(4)),
        ebitdaMarginPct: parseFloat((keyRatios.ebitdaMargin || 0.25).toFixed(4)),
        capitalExpenditurePct: 0.03,
        taxRatePct: parseFloat((keyRatios.effectiveTaxRate || 0.25).toFixed(4)),
        depreciationAndAmortizationPct: 0.035,
        cashAndShortTermInvestmentsPct: 0.20,
        receivablesPct: 0.15,
        inventoriesPct: 0.10,
        payablesPct: 0.15,
        ebitPct: parseFloat((keyRatios.ebitMargin || 0.20).toFixed(4)),
        operatingCashFlowPct: parseFloat((growthData.operatingCashFlowGrowth || 0.20).toFixed(4)),
        sellingGeneralAndAdministrativeExpensesPct: 0.10,
        longTermGrowthRatePct: 0.03,
        costOfEquityPct: 0.09,
        costOfDebtPct: 0.04,
        marketRiskPremiumPct: 0.05,
        riskFreeRatePct: 0.04,
        beta: profile.beta || 1.0
      },
      explanation: `Fallback DCF assumptions generated using historical data for ${profile.companyName} (${profile.symbol}). AI analysis failed, so these are estimates based on financial metrics.`
    };
  }
}

// Main function to handle requests
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const { symbol, refreshCache = false } = await req.json();
    
    if (!symbol) {
      return new Response(JSON.stringify({ error: 'Symbol parameter is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Processing DCF assumption request for ${symbol}, refreshCache=${refreshCache}`);
    
    // Check if we have a cached version of this analysis
    if (!refreshCache) {
      // Look for cached data in Supabase
      const { data: cachedData, error: cacheError } = await supabase
        .from('api_cache')
        .select('data, expires_at')
        .eq('cache_key', `dcf_assumptions_${symbol}`)
        .single();
      
      if (!cacheError && cachedData && cachedData.expires_at) {
        const expiresAt = new Date(cachedData.expires_at);
        if (expiresAt > new Date()) {
          console.log(`Using cached DCF assumptions for ${symbol}, expires at ${expiresAt.toISOString()}`);
          return new Response(JSON.stringify(cachedData.data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } else {
          console.log(`Cached DCF assumptions for ${symbol} expired at ${expiresAt.toISOString()}`);
        }
      }
    }
    
    // Fetch company data from FMP API
    const [profile, growthData, keyRatios] = await Promise.all([
      fetchCompanyProfile(symbol),
      fetchFinancialGrowth(symbol),
      fetchKeyRatios(symbol)
    ]);
    
    if (!profile || !growthData || !keyRatios) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch necessary company data',
        profile: !!profile,
        growthData: !!growthData,
        keyRatios: !!keyRatios
      }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Optionally fetch industry metrics (if available)
    let industryMetrics = null;
    if (profile.industry) {
      industryMetrics = await fetchIndustryMetrics(profile.industry);
    }
    
    // Generate DCF assumptions using AI
    const dcfSuggestion = await generateDCFAssumptions(profile, growthData, keyRatios, industryMetrics);
    
    // Cache the result in Supabase
    const { error: insertError } = await supabase
      .from('api_cache')
      .upsert({
        cache_key: `dcf_assumptions_${symbol}`,
        data: dcfSuggestion,
        expires_at: dcfSuggestion.expiresAt,
        created_at: new Date().toISOString()
      });
    
    if (insertError) {
      console.error(`Error caching DCF assumptions for ${symbol}:`, insertError);
    } else {
      console.log(`Cached DCF assumptions for ${symbol} until ${dcfSuggestion.expiresAt}`);
    }
    
    // Return the suggestion
    return new Response(JSON.stringify(dcfSuggestion), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in generate-dcf-assumptions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
