
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { API_BASE_URLS, FMP_API_KEY } from "../_shared/constants.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Cache duration constants
const CACHE_DURATION = {
  SHORT: 60 * 60, // 1 hour
  MEDIUM: 24 * 60 * 60, // 1 day
  LONG: 7 * 24 * 60 * 60, // 1 week
};

// Cache headers based on DCF type
function getCacheHeaders(type = 'standard') {
  const cacheDuration = type === 'standard' ? CACHE_DURATION.MEDIUM : CACHE_DURATION.SHORT;
  return {
    'Cache-Control': `public, max-age=${cacheDuration}`,
    'Surrogate-Control': `max-age=${cacheDuration}`,
  };
}

// Build the DCF API URL
function buildDcfApiUrl(symbol: string, type = 'advanced', params: Record<string, string> = {}) {
  if (!symbol || symbol.trim() === "") {
    throw new Error("Symbol is required to build the DCF API URL");
  }
  
  const upperSymbol = symbol.toUpperCase().trim();
  let apiUrl = "";
  
  console.log(`Building DCF API URL for symbol: ${upperSymbol}, type: ${type}`);
  
  // Determine which FMP endpoint to use based on DCF type
  switch (type) {
    case "standard":
      apiUrl = `${API_BASE_URLS.FMP}/v3/discounted-cash-flow/${upperSymbol}`;
      break;
    case "levered":
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_levered_discounted_cash_flow?symbol=${upperSymbol}`;
      break;
    case "custom-levered":
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_levered_discounted_cash_flow?symbol=${upperSymbol}&type=levered`;
      break;
    case "advanced":
    default:
      apiUrl = `${API_BASE_URLS.FMP}/v4/advanced_discounted_cash_flow?symbol=${upperSymbol}`;
      break;
  }
  
  // Add custom parameters for advanced endpoints
  if ((type === "advanced" || type === "levered" || type === "custom-levered") && params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && key !== 'symbol' && key !== 'type') {
        apiUrl += `&${key}=${encodeURIComponent(value)}`;
      }
    });
  }
  
  // Add the API key
  apiUrl += (apiUrl.includes('?') ? '&' : '?') + `apikey=${FMP_API_KEY}`;
  
  console.log(`Built DCF API URL for ${type} calculation:`, apiUrl.replace(/apikey=[^&]+/, 'apikey=***'));
  
  return apiUrl;
}

// Improved fetch with retry functionality
async function fetchWithRetry(url: string, options: RequestInit = {}, maxRetries = 3) {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`DCF API Request Attempt ${attempt}/${maxRetries}`);
      console.log(`URL: ${url.replace(/apikey=[^&]+/, 'apikey=***')}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const mergedOptions: RequestInit = {
        ...options,
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache',
          ...(options.headers || {})
        }
      };
      
      const response = await fetch(url, mergedOptions);
      clearTimeout(timeoutId);
      
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DCF API Error (${response.status}):`, errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error(`DCF API Fetch error (attempt ${attempt}/${maxRetries}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.log(`Retrying after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch DCF data after multiple attempts');
}

// Create more realistic mock data based on actual META financials
function createRealCompanyMockData(symbol: string) {
  console.log(`Creating realistic mock data for symbol: ${symbol}`);
  
  const baseData = {
    symbol: symbol,
    date: new Date().toISOString().split('T')[0],
    stockPrice: 466.83,
    dcf: 357.74,
    equityValuePerShare: 357.74,
    wacc: 0.097,
    longTermGrowthRate: 0.04,
    taxRate: 0.1175,
    mockData: true, // Added mockData flag
    revenuePercentage: 11.13,
    capitalExpenditurePercentage: 3.49,
    ebitdaPercentage: 30.0,
    operatingCashFlowPercentage: 28.0
  };

  // Create realistic mock data
  return [{
    ...baseData,
    revenue: 154500000000,
    ebit: 71380000000,
    ebitda: 86880000000,
    freeCashFlow: 43250000000,
    operatingCashFlow: 80520000000,
    capitalExpenditure: -37260000000,
    enterpriseValue: 940300000000,
    netDebt: 5170000000,
    equityValue: 935140000000,
    dilutedSharesOutstanding: 2610000000,
    terminalValue: 1210000000000,
    beta: 1.277894,
    costofDebt: 0.0244,
    riskFreeRate: 0.0427,
    marketRiskPremium: 0.0472,
    costOfEquity: 0.103
  }];
}

serve(async (req) => {
  console.log("DCF API Request received:", req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling CORS preflight request");
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request URL and get parameters
    const url = new URL(req.url);
    const symbol = url.searchParams.get('symbol');
    
    console.log("DCF request parameters:", Object.fromEntries(url.searchParams.entries()));
    
    // Check if symbol is provided
    if (!symbol || symbol.trim() === "") {
      console.error("DCF Request Parameter Error: Symbol is missing or empty");
      return new Response(
        JSON.stringify({
          error: "Symbol is required",
          details: "Please provide a valid stock symbol (ticker)"
        }),
        { 
          status: 400, 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    }
    
    const type = url.searchParams.get('type') || 'advanced';
    
    // Parse additional parameters from the request
    const params: Record<string, string> = {};
    for (const [key, value] of url.searchParams.entries()) {
      if (key !== 'symbol' && key !== 'type') {
        params[key] = value;
      }
    }
    
    console.log(`Processing DCF request for ${symbol}, type: ${type}, params:`, params);
    
    try {
      // Build the API URL
      const apiUrl = buildDcfApiUrl(symbol, type, params);
      
      // Make the API request with improved error handling
      const response = await fetchWithRetry(apiUrl);
      
      // Parse the API response
      const data = await response.json();
      console.log(`Received DCF data from API:`, typeof data, Array.isArray(data) ? `Array[${data.length}]` : "Object");
      
      // Handle empty responses
      if (Array.isArray(data) && data.length === 0) {
        console.log(`No DCF data found for symbol: ${symbol}, returning realistic mock data`);
        const mockData = createRealCompanyMockData(symbol);
        
        return new Response(
          JSON.stringify(mockData),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'X-Mock-Data': 'true',
              ...getCacheHeaders(type)
            } 
          }
        );
      }
      
      // Format the response based on type
      let processedData = data;
      if (type === 'standard' && !Array.isArray(data)) {
        processedData = [data];
      }
      
      console.log(`Successfully retrieved DCF data for ${symbol}`);
      
      // Return the DCF data with appropriate caching headers
      return new Response(
        JSON.stringify(processedData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            ...getCacheHeaders(type)
          } 
        }
      );
    } catch (fetchError) {
      console.error(`Error fetching from FMP API: ${fetchError}`);
      // Return mock data with error status but using more realistic data
      const mockData = createRealCompanyMockData(symbol);
      mockData[0].error = fetchError instanceof Error ? fetchError.message : String(fetchError);
      
      return new Response(
        JSON.stringify(mockData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            'X-Mock-Data': 'true',
            ...getCacheHeaders(type)
          } 
        }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Uncaught error in DCF endpoint:", errorMessage);
    
    return new Response(
      JSON.stringify({
        error: errorMessage || "An error occurred in the DCF service",
        details: error instanceof Error ? error.stack : "No stack trace available"
      }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
