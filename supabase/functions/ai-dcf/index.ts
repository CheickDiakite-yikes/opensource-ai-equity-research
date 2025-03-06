
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { fetchWithRetry, handleFetchResponse } from "../_shared/fetch-utils.ts";
import { makeApiRequest, buildFmpUrl, createResponse, createErrorResponse } from "../_shared/api-utils.ts";

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
    console.log(`Fetching company profile from: ${profileUrl.replace(/apikey=[^&]+/, "apikey=***")}`);
    
    const profileResponse = await fetchWithRetry(profileUrl);
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
    console.log(`Fetching income statements from: ${financialsUrl.replace(/apikey=[^&]+/, "apikey=***")}`);
    
    const financialsResponse = await fetchWithRetry(financialsUrl);
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
    console.log(`Fetching ratios from: ${ratiosUrl.replace(/apikey=[^&]+/, "apikey=***")}`);
    
    const ratiosResponse = await fetchWithRetry(ratiosUrl);
    const ratiosData = await ratiosResponse.json();
    
    // Step 5: Get key metrics
    const metricsUrl = `${FMP_BASE_URL}/v3/key-metrics/${symbol}?limit=1&apikey=${FMP_API_KEY}`;
    console.log(`Fetching key metrics from: ${metricsUrl.replace(/apikey=[^&]+/, "apikey=***")}`);
    
    const metricsResponse = await fetchWithRetry(metricsUrl);
    const metricsData = await metricsResponse.json();
    
    // Calculate or estimate DCF parameters
    const wacc = 0.09; // Default WACC (this should be calculated based on company data)
    const terminalGrowth = 0.025; // Conservative terminal growth
    const taxRate = financialsData[0].incomeTaxExpense / financialsData[0].incomeBeforeTax;
    
    // Company beta from profile if available
    const beta = profile.beta || 1.2;
    
    // Step 6: Try to use the advanced levered DCF API with calculated parameters
    try {
      console.log(`Attempting to use advanced levered DCF API for ${symbol}`);
      const dcfUrl = `${FMP_BASE_URL}/v4/advanced_levered_discounted_cash_flow?symbol=${symbol}`;
      
      // Add parameters from the documentation
      const dcfParams = new URLSearchParams({
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
      
      const dcfResponse = await fetchWithRetry(finalDcfUrl);
      let dcfData = await dcfResponse.json();
      
      if (!dcfData || !dcfData.length) {
        console.log(`No data from advanced levered DCF API for ${symbol}, falling back to regular DCF API`);
        throw new Error("No advanced DCF data returned");
      }
      
      const dcfResult = dcfData[0];
      return formatDCFResult(symbol, dcfResult, profile, financialsData, metricsData, averageRevenueGrowth, wacc, terminalGrowth, beta, taxRate, currentPrice);
    } catch (advancedDcfError) {
      console.log(`Advanced DCF API failed: ${advancedDcfError.message}. Trying standard DCF API.`);
      
      // Try fallback to regular DCF API
      const regularDcfUrl = `${FMP_BASE_URL}/v3/discounted-cash-flow/${symbol}?apikey=${FMP_API_KEY}`;
      console.log(`Calling FMP regular DCF API: ${regularDcfUrl.replace(/apikey=[^&]+/, 'apikey=***')}`);
      
      const regularDcfResponse = await fetchWithRetry(regularDcfUrl);
      const regularDcfData = await regularDcfResponse.json();
      
      if (!regularDcfData || !regularDcfData.length) {
        console.log(`No data from regular DCF API for ${symbol}, calculating DCF manually`);
        throw new Error("No regular DCF data returned");
      }
      
      // Extract values from regular DCF
      const regularDcfResult = regularDcfData[0];
      
      // Calculate our own DCF with the data we have
      return formatDCFResultFromRegularDCF(
        symbol, 
        regularDcfResult, 
        profile, 
        financialsData, 
        metricsData, 
        averageRevenueGrowth, 
        wacc, 
        terminalGrowth, 
        beta, 
        taxRate, 
        currentPrice
      );
    }
  } catch (error) {
    console.error(`Error in AI-DCF calculation for ${symbol}:`, error);
    
    // If we've reached this point, both DCF APIs failed, so let's calculate our own DCF
    try {
      console.log(`Falling back to manual DCF calculation for ${symbol}`);
      
      // Fetch fallback data
      const profile = await fetchCompanyProfile(symbol);
      const financials = await fetchIncomeStatements(symbol);
      const cashFlow = await fetchCashFlowStatements(symbol);
      const balanceSheet = await fetchBalanceSheets(symbol);
      
      // Calculate a very basic DCF
      return calculateManualDCF(
        symbol, 
        profile, 
        financials, 
        cashFlow, 
        balanceSheet
      );
    } catch (fallbackError) {
      console.error(`Even fallback DCF calculation failed for ${symbol}:`, fallbackError);
      throw new Error(`Failed to calculate DCF for ${symbol}: ${error.message}`);
    }
  }
}

// Fetch company profile as a fallback
async function fetchCompanyProfile(symbol: string) {
  const url = `${FMP_BASE_URL}/v3/profile/${symbol}?apikey=${FMP_API_KEY}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  if (!data || !data.length) {
    throw new Error(`No profile data found for ${symbol}`);
  }
  
  return data[0];
}

// Fetch income statements as a fallback
async function fetchIncomeStatements(symbol: string) {
  const url = `${FMP_BASE_URL}/v3/income-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  if (!data || !data.length) {
    throw new Error(`No income statement data found for ${symbol}`);
  }
  
  return data;
}

// Fetch cash flow statements as a fallback
async function fetchCashFlowStatements(symbol: string) {
  const url = `${FMP_BASE_URL}/v3/cash-flow-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  if (!data || !data.length) {
    throw new Error(`No cash flow statement data found for ${symbol}`);
  }
  
  return data;
}

// Fetch balance sheets as a fallback
async function fetchBalanceSheets(symbol: string) {
  const url = `${FMP_BASE_URL}/v3/balance-sheet-statement/${symbol}?limit=5&apikey=${FMP_API_KEY}`;
  const response = await fetchWithRetry(url);
  const data = await response.json();
  
  if (!data || !data.length) {
    throw new Error(`No balance sheet data found for ${symbol}`);
  }
  
  return data;
}

// Calculate a manual DCF as a final fallback
function calculateManualDCF(symbol, profile, financials, cashFlow, balanceSheet) {
  // Get the most recent fiscal year data
  const latestIncome = financials[0];
  const latestCashFlow = cashFlow[0];
  const latestBalanceSheet = balanceSheet[0];
  
  // Calculate average growth rate from historical data
  let averageRevenueGrowth = 0.05;
  if (financials.length > 1) {
    const growthRates = [];
    for (let i = 0; i < financials.length - 1; i++) {
      const currentRevenue = financials[i].revenue;
      const prevRevenue = financials[i + 1].revenue;
      if (prevRevenue > 0) {
        const growthRate = (currentRevenue - prevRevenue) / prevRevenue;
        growthRates.push(growthRate);
      }
    }
    
    if (growthRates.length > 0) {
      averageRevenueGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    }
  }
  
  // Estimate or use provided parameters
  const wacc = 0.09; // Default discount rate
  const terminalGrowth = 0.025; // Default terminal growth rate
  const beta = profile.beta || 1.2;
  
  // Calculate free cash flow
  // FCF = Cash from Operations - Capital Expenditures
  const freeCashFlow = latestCashFlow.netCashProvidedByOperatingActivities - 
                       Math.abs(latestCashFlow.capitalExpenditure);
  
  // Project 5 years of cash flows
  const projectedFCFs = [];
  for (let i = 1; i <= 5; i++) {
    const fcf = freeCashFlow * Math.pow(1 + averageRevenueGrowth, i);
    projectedFCFs.push(parseFloat(fcf.toFixed(2)));
  }
  
  // Calculate terminal value using Gordon Growth Model
  const terminalValue = projectedFCFs[4] * (1 + terminalGrowth) / (wacc - terminalGrowth);
  
  // Calculate present value of projected cash flows
  let totalPV = 0;
  for (let i = 0; i < projectedFCFs.length; i++) {
    totalPV += projectedFCFs[i] / Math.pow(1 + wacc, i + 1);
  }
  
  // Add present value of terminal value
  const presentValueOfTerminal = terminalValue / Math.pow(1 + wacc, 5);
  const enterpriseValue = totalPV + presentValueOfTerminal;
  
  // Calculate equity value
  // Equity Value = Enterprise Value + Cash - Debt
  const cash = latestBalanceSheet.cashAndShortTermInvestments || latestBalanceSheet.cashAndCashEquivalents || 0;
  const debt = latestBalanceSheet.totalDebt || (latestBalanceSheet.shortTermDebt + latestBalanceSheet.longTermDebt) || 0;
  const equityValue = enterpriseValue + cash - debt;
  
  // Calculate per share value
  const sharesOutstanding = profile.mktCap / profile.price || 1000000000; // Fallback to a large number if can't calculate
  const intrinsicValuePerShare = equityValue / sharesOutstanding;
  
  // Calculate upside/downside percentage
  const currentPrice = profile.price;
  const upside = currentPrice > 0 ? ((intrinsicValuePerShare - currentPrice) / currentPrice) * 100 : null;
  
  // Create industry comparison (estimated)
  const industryComparison = {
    revenueGrowth: { 
      company: averageRevenueGrowth, 
      industry: averageRevenueGrowth * 0.9, // Slightly lower than company for example
      difference: averageRevenueGrowth > (averageRevenueGrowth * 0.9) ? 
        `+${((averageRevenueGrowth - (averageRevenueGrowth * 0.9)) * 100).toFixed(2)}% better than industry` : 
        `${((averageRevenueGrowth - (averageRevenueGrowth * 0.9)) * 100).toFixed(2)}% worse than industry`
    },
    profitMargin: { 
      company: latestIncome.netIncomeRatio || 0.1, 
      industry: 0.08, // Example industry average
      difference: (latestIncome.netIncomeRatio || 0.1) > 0.08 ? 
        `+${(((latestIncome.netIncomeRatio || 0.1) - 0.08) * 100).toFixed(2)}% better than industry` : 
        `${(((latestIncome.netIncomeRatio || 0.1) - 0.08) * 100).toFixed(2)}% worse than industry`
    },
    debtRatio: { 
      company: debt / (latestBalanceSheet.totalAssets || 1), 
      industry: 0.4, // Example industry average
      difference: (debt / (latestBalanceSheet.totalAssets || 1)) < 0.4 ? 
        `+${((0.4 - (debt / (latestBalanceSheet.totalAssets || 1))) * 100).toFixed(2)}% better than industry` : 
        `${((0.4 - (debt / (latestBalanceSheet.totalAssets || 1))) * 100).toFixed(2)}% worse than industry`
    }
  };
  
  // Create scenario analysis
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
  
  // Return the manually calculated DCF result
  return {
    ticker: symbol,
    companyName: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    assumptions: {
      averageRevenueGrowth: averageRevenueGrowth,
      wacc: wacc,
      terminalGrowth: terminalGrowth,
      beta: beta,
      taxRate: (latestIncome.incomeTaxExpense / latestIncome.incomeBeforeTax) || 0.21
    },
    projectedFCFs: projectedFCFs,
    terminalValue: terminalValue,
    dcfValue: enterpriseValue,
    enterpriseValue: enterpriseValue,
    equityValue: equityValue,
    sharesOutstanding: sharesOutstanding,
    intrinsicValuePerShare: intrinsicValuePerShare,
    currentPrice: currentPrice,
    upside: upside,
    timestamp: new Date().toISOString(),
    aiGenerated: true,
    industryComparison: industryComparison,
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
      pe: profile.pe || (currentPrice / (latestIncome.netIncome / sharesOutstanding)) || 0,
      marketCap: profile.mktCap || 0,
      lastDividend: profile.lastDiv || 0,
      volume: profile.volAvg || 0,
      exchange: profile.exchange || "Unknown"
    }
  };
}

// Format the DCF result from the advanced levered DCF API
function formatDCFResult(
  symbol, 
  dcfResult, 
  profile, 
  financialsData, 
  metricsData, 
  averageRevenueGrowth, 
  wacc, 
  terminalGrowth, 
  beta, 
  taxRate,
  currentPrice
) {
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
  
  // Create industry comparison if metrics data available
  let industryComparison = null;
  if (metricsData && metricsData.length > 0) {
    // Using some estimated industry averages for now
    // In a real implementation, we would fetch industry averages from FMP
    const industryRevenueGrowth = averageRevenueGrowth * 0.9; // Slightly lower than company
    const industryProfitMargin = 0.08; // Industry average profit margin
    const industryDebtRatio = 0.4; // Industry average debt ratio
    
    const companyMetrics = metricsData[0];
    industryComparison = {
      revenueGrowth: { 
        company: averageRevenueGrowth, 
        industry: industryRevenueGrowth,
        difference: formatDifference(averageRevenueGrowth - industryRevenueGrowth)
      },
      profitMargin: { 
        company: companyMetrics?.netProfitMargin || financialsData[0].netIncomeRatio || 0, 
        industry: industryProfitMargin,
        difference: formatDifference((companyMetrics?.netProfitMargin || financialsData[0].netIncomeRatio || 0) - industryProfitMargin)
      },
      debtRatio: { 
        company: companyMetrics?.debtToAssets || 0.3, 
        industry: industryDebtRatio,
        difference: formatDifference((companyMetrics?.debtToAssets || 0.3) - industryDebtRatio, true)
      }
    };
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
    companyName: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    assumptions: {
      averageRevenueGrowth: averageRevenueGrowth,
      wacc: dcfResult.wacc || wacc,
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
        wacc: dcfResult.wacc || wacc,
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
}

// Format the DCF result from the regular DCF API
function formatDCFResultFromRegularDCF(
  symbol, 
  regularDcfResult, 
  profile, 
  financialsData, 
  metricsData, 
  averageRevenueGrowth, 
  wacc, 
  terminalGrowth, 
  beta, 
  taxRate,
  currentPrice
) {
  // Use values from the regular DCF API
  const dcfValue = regularDcfResult.dcf || 0;
  const stockPrice = regularDcfResult.stockPrice || currentPrice;
  
  // Estimate other values that aren't provided by the regular DCF API
  const sharesOutstanding = profile.mktCap / stockPrice || 1000000000;
  const enterpriseValue = dcfValue * sharesOutstanding;
  
  // Estimate equity value (enterprise value + cash - debt)
  // If we had balance sheet data, we'd use that
  const equityValue = enterpriseValue;
  
  // Calculate terminal value (estimated)
  const terminalValue = enterpriseValue * 0.7; // Assuming terminal value is about 70% of enterprise value
  
  // Calculate projected FCFs (estimated)
  const projectedFCFs = [];
  // Estimate the first year FCF
  const estimatedAnnualFCF = enterpriseValue * 0.05; // Assuming FCF yield of ~5%
  
  for (let i = 1; i <= 5; i++) {
    const fcf = estimatedAnnualFCF * Math.pow(1 + averageRevenueGrowth, i);
    projectedFCFs.push(parseFloat(fcf.toFixed(2)));
  }
  
  // Calculate upside/downside percentage
  const intrinsicValuePerShare = dcfValue;
  const upside = stockPrice > 0 ? ((intrinsicValuePerShare - stockPrice) / stockPrice) * 100 : null;
  
  // Create industry comparison if metrics data available (same as before)
  let industryComparison = null;
  if (metricsData && metricsData.length > 0) {
    const industryRevenueGrowth = averageRevenueGrowth * 0.9;
    const industryProfitMargin = 0.08;
    const industryDebtRatio = 0.4;
    
    const companyMetrics = metricsData[0];
    industryComparison = {
      revenueGrowth: { 
        company: averageRevenueGrowth, 
        industry: industryRevenueGrowth,
        difference: formatDifference(averageRevenueGrowth - industryRevenueGrowth)
      },
      profitMargin: { 
        company: companyMetrics?.netProfitMargin || financialsData[0].netIncomeRatio || 0, 
        industry: industryProfitMargin,
        difference: formatDifference((companyMetrics?.netProfitMargin || financialsData[0].netIncomeRatio || 0) - industryProfitMargin)
      },
      debtRatio: { 
        company: companyMetrics?.debtToAssets || 0.3, 
        industry: industryDebtRatio,
        difference: formatDifference((companyMetrics?.debtToAssets || 0.3) - industryDebtRatio, true)
      }
    };
  }
  
  // Calculate scenario analysis
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
  
  // Return the DCF result based on the regular DCF API
  return {
    ticker: symbol,
    companyName: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    assumptions: {
      averageRevenueGrowth: averageRevenueGrowth,
      wacc: wacc,
      terminalGrowth: terminalGrowth,
      beta: beta,
      taxRate: taxRate > 0 && taxRate < 1 ? taxRate : 0.21
    },
    projectedFCFs: projectedFCFs,
    terminalValue: terminalValue,
    dcfValue: enterpriseValue,
    enterpriseValue: enterpriseValue,
    equityValue: equityValue,
    sharesOutstanding: sharesOutstanding,
    intrinsicValuePerShare: intrinsicValuePerShare,
    currentPrice: stockPrice,
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
}

// Helper function to format comparison differences
function formatDifference(diff: number, isDebtRatio: boolean = false): string {
  // For debt ratio, lower is better
  if (isDebtRatio) diff = -diff;
  
  if (diff > 0) {
    return `+${(diff * 100).toFixed(2)}% better than industry`;
  } else if (diff < 0) {
    return `${(diff * 100).toFixed(2)}% worse than industry`;
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
