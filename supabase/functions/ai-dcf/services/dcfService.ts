
import { fetchCompanyProfile } from "./companyService.ts";
import { fetchIncomeStatements, fetchCashFlowStatements, fetchBalanceSheets } from "./financialService.ts";
import { formatDCFResult, formatDCFResultFromRegularDCF, formatDifference } from "../utils/formatters.ts";
import { calculateManualDCF } from "./manualDCFService.ts";
import { fetchWithRetry } from "../../_shared/fetch-utils.ts";

// API key from environment variable
const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

// Base URL for FMP API
const FMP_BASE_URL = "https://financialmodelingprep.com/api";

// Main function to fetch DCF data from FMP
export async function fetchDCFData(symbol: string) {
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
