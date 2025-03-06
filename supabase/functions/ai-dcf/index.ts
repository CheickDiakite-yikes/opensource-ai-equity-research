
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// API key from environment variable
const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

// Base URL for FMP API
const FMP_BASE_URL = "https://financialmodelingprep.com/api";

// Main function to fetch DCF data from FMP
async function fetchDCFData(symbol: string) {
  try {
    console.log(`Fetching DCF data for ${symbol}`);
    
    // Step 1: Fetch company profile to get basic information
    const profileUrl = `${FMP_BASE_URL}/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
    const profileResponse = await fetch(profileUrl);
    const profileData = await profileResponse.json();
    
    if (!profileData || !profileData.length) {
      throw new Error(`No profile data found for ${symbol}`);
    }
    
    const profile = profileData[0];
    const currentPrice = profile.price;
    const companyName = profile.companyName;
    const sector = profile.sector;
    const industry = profile.industry;
    
    // Step 2: Fetch historical financials to analyze growth trends
    const financialsUrl = `${FMP_BASE_URL}/v3/income-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
    const financialsResponse = await fetch(financialsUrl);
    const financialsData = await financialsResponse.json();
    
    if (!financialsData || !financialsData.length) {
      throw new Error(`No financial data found for ${symbol}`);
    }
    
    // Step 3: Calculate average growth rate from historical data
    let averageRevenueGrowth = 0.05; // Default value
    if (financialsData.length > 1) {
      const growthRates = [];
      for (let i = 0; i < financialsData.length - 1; i++) {
        const currentRevenue = financialsData[i].revenue;
        const prevRevenue = financialsData[i + 1].revenue;
        if (prevRevenue > 0) {
          const growthRate = (currentRevenue - prevRevenue) / prevRevenue;
          growthRates.push(growthRate);
        }
      }
      
      if (growthRates.length > 0) {
        averageRevenueGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
      }
    }
    
    // Step 4: Fetch company ratios for WACC and other metrics
    const ratiosUrl = `${FMP_BASE_URL}/v3/ratios/${symbol}?limit=1&apikey=${FMP_API_KEY}`;
    const ratiosResponse = await fetch(ratiosUrl);
    const ratiosData = await ratiosResponse.json();
    
    // Step 5: Get key metrics
    const metricsUrl = `${FMP_BASE_URL}/v3/key-metrics/${symbol}?limit=1&apikey=${FMP_API_KEY}`;
    const metricsResponse = await fetch(metricsUrl);
    const metricsData = await metricsResponse.json();
    
    // Calculate or estimate DCF parameters
    const wacc = 0.09; // Default WACC (this should be calculated based on company data)
    const terminalGrowth = 0.025; // Conservative terminal growth
    const taxRate = financialsData[0].incomeTaxExpense / financialsData[0].incomeBeforeTax;
    
    // Company beta from profile if available
    const beta = profile.beta || 1.2;
    
    // Step 6: Use the custom levered DCF API with calculated parameters
    const dcfUrl = `${FMP_BASE_URL}/v4/advanced_levered_discounted_cash_flow?symbol=${symbol}&type=levered`;
    
    // Add parameters from the documentation
    const dcfParams = new URLSearchParams({
      symbol: symbol,
      revenueGrowth: String(averageRevenueGrowth),
      ebitdaMargin: String(financialsData[0].ebitda / financialsData[0].revenue),
      taxRate: String(taxRate > 0 && taxRate < 1 ? taxRate : 0.21),
      longTermGrowthRate: String(terminalGrowth),
      beta: String(beta),
      costOfEquity: String(0.097), // Estimated
      costofDebt: String(0.035), // Estimated
      riskFreeRate: String(0.036), // Current 10Y Treasury yield
      marketRiskPremium: String(0.047) // Standard equity risk premium
    });
    
    // Construct the final URL
    const finalDcfUrl = `${dcfUrl}&${dcfParams.toString()}&apikey=${FMP_API_KEY}`;
    console.log(`Calling FMP DCF API: ${finalDcfUrl.replace(/apikey=[^&]+/, 'apikey=***')}`);
    
    const dcfResponse = await fetch(finalDcfUrl);
    let dcfData = await dcfResponse.json();
    
    // Step 7: Format the result into our application's expected format
    if (!dcfData || !dcfData.length) {
      throw new Error(`No DCF data returned for ${symbol}`);
    }
    
    const dcfResult = dcfData[0];
    
    // Calculate projected FCFs from the result (yearly for 5 years)
    const projectedFCFs = [];
    for (let i = 1; i <= 5; i++) {
      // Simple projection based on growth rate
      const fcf = dcfResult.freeCashFlow * Math.pow(1 + averageRevenueGrowth, i);
      projectedFCFs.push(parseFloat(fcf.toFixed(2)));
    }
    
    // Calculate upside/downside percentage
    const intrinsicValuePerShare = dcfResult.equityValuePerShare;
    const upside = currentPrice > 0 ? ((intrinsicValuePerShare - currentPrice) / currentPrice) * 100 : null;
    
    // Step 8: Get industry peers for comparison
    const peersUrl = `${FMP_BASE_URL}/v4/stock_peers?symbol=${symbol}&apikey=${FMP_API_KEY}`;
    const peersResponse = await fetch(peersUrl);
    const peersData = await peersResponse.json();
    
    // Step 9: Get industry metrics for comparison if peers exist
    let industryComparison = null;
    if (peersData && peersData.length > 0 && peersData[0].peersList && peersData[0].peersList.length > 0) {
      const peers = peersData[0].peersList.slice(0, 5);
      
      // Calculate industry averages
      const industryMetricsUrl = `${FMP_BASE_URL}/v3/key-metrics/${peers.join(',')}?limit=1&apikey=${FMP_API_KEY}`;
      const industryMetricsResponse = await fetch(industryMetricsUrl);
      const industryMetricsData = await industryMetricsResponse.json();
      
      if (industryMetricsData && industryMetricsData.length > 0) {
        const industryRevenueGrowth = industryMetricsData.reduce((sum, item) => sum + (item.revenueGrowth || 0), 0) / industryMetricsData.length;
        const industryProfitMargin = industryMetricsData.reduce((sum, item) => sum + (item.netProfitMargin || 0), 0) / industryMetricsData.length;
        const industryDebtRatio = industryMetricsData.reduce((sum, item) => sum + (item.debtToAssets || 0), 0) / industryMetricsData.length;
        
        // Compare company metrics to industry averages
        const companyMetrics = metricsData && metricsData.length > 0 ? metricsData[0] : null;
        if (companyMetrics) {
          industryComparison = {
            revenueGrowth: { 
              company: companyMetrics.revenueGrowth || 0, 
              industry: industryRevenueGrowth,
              difference: formatDifference(companyMetrics.revenueGrowth - industryRevenueGrowth)
            },
            profitMargin: { 
              company: companyMetrics.netProfitMargin || 0, 
              industry: industryProfitMargin,
              difference: formatDifference(companyMetrics.netProfitMargin - industryProfitMargin)
            },
            debtRatio: { 
              company: companyMetrics.debtToAssets || 0, 
              industry: industryDebtRatio,
              difference: formatDifference(companyMetrics.debtToAssets - industryDebtRatio)
            }
          };
        }
      }
    }
    
    // Calculate additional metrics for sensitivity analysis
    const bullishScenario = {
      growth: averageRevenueGrowth * 1.2,
      wacc: wacc * 0.9,
      intrinsicValue: intrinsicValuePerShare * 1.25
    };
    
    const bearishScenario = {
      growth: averageRevenueGrowth * 0.8,
      wacc: wacc * 1.1,
      intrinsicValue: intrinsicValuePerShare * 0.75
    };
    
    // Return the comprehensive DCF result
    return {
      ticker: symbol,
      companyName,
      sector,
      industry,
      assumptions: {
        averageRevenueGrowth: averageRevenueGrowth,
        wacc: dcfResult.wacc,
        terminalGrowth: terminalGrowth,
        beta: beta,
        taxRate: taxRate > 0 && taxRate < 1 ? taxRate : 0.21
      },
      projectedFCFs: projectedFCFs,
      terminalValue: dcfResult.terminalValue,
      dcfValue: dcfResult.enterpriseValue,
      enterpriseValue: dcfResult.enterpriseValue,
      equityValue: dcfResult.equityValue,
      sharesOutstanding: dcfResult.dilutedSharesOutstanding,
      intrinsicValuePerShare: intrinsicValuePerShare,
      currentPrice: currentPrice,
      upside: upside,
      timestamp: new Date().toISOString(),
      aiGenerated: true,
      industryComparison,
      scenarioAnalysis: {
        base: {
          growthRate: averageRevenueGrowth,
          wacc: wacc,
          intrinsicValue: intrinsicValuePerShare
        },
        bullish: bullishScenario,
        bearish: bearishScenario
      },
      keyMetrics: {
        pe: profile.pe,
        marketCap: profile.mktCap,
        lastDividend: profile.lastDiv,
        volume: profile.volAvg,
        exchange: profile.exchange
      }
    };
    
  } catch (error) {
    console.error(`Error in AI-DCF calculation for ${symbol}:`, error);
    throw error;
  }
}

// Helper function to format comparison differences
function formatDifference(diff: number): string {
  if (diff > 0) {
    return `+${diff.toFixed(2)}% better than industry`;
  } else if (diff < 0) {
    return `${diff.toFixed(2)}% worse than industry`;
  }
  return "on par with industry";
}

// Edge function handler
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get symbol from request parameters
    const url = new URL(req.url);
    let symbol = url.searchParams.get("symbol");
    
    // If not in query params, try to get from request body
    if (!symbol && req.method === "POST") {
      const body = await req.json();
      symbol = body.symbol;
    }
    
    // Validate required parameters
    if (!symbol) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameter: symbol" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Processing AI-DCF request for symbol: ${symbol}`);
    
    // Fetch DCF data from FMP
    const result = await fetchDCFData(symbol);
    
    // Return the DCF result
    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "max-age=3600" // Cache for 1 hour
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in AI-DCF edge function:", error);
    
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "An unknown error occurred",
        details: error instanceof Error ? error.stack : null
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
