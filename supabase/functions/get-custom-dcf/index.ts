
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { API_BASE_URLS, FMP_API_KEY } from "../_shared/constants.ts";

// Cache-control headers (per DCF type)
const getCacheHeaders = (type: string) => {
  let maxAge = 3600; // Default 1 hour cache
  
  // Custom DCF types that use user-defined parameters shouldn't be cached as long
  if (type === 'custom-levered' || type === 'advanced') {
    maxAge = 300; // 5 minutes for custom DCF calculations
  }
  
  return {
    'Cache-Control': `public, max-age=${maxAge}`,
    'Vary': 'Origin, Accept-Encoding',
  };
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get the FMP API key from environment variables
    if (!FMP_API_KEY) {
      console.error("FMP_API_KEY not set in environment variables");
      return new Response(
        JSON.stringify({ error: "API key not configured", details: "FMP_API_KEY environment variable is missing" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // If this is a GET request, parse the URL parameters
    let symbol, params, type;
    if (req.method === 'GET') {
      const url = new URL(req.url);
      symbol = url.searchParams.get('symbol');
      type = url.searchParams.get('type') || 'advanced';
      
      // Extract all other parameters for the API
      params = {};
      url.searchParams.forEach((value, key) => {
        if (key !== 'symbol' && key !== 'type') {
          // Convert percentage values to decimals for specific parameters
          if (['longTermGrowthRate', 'costOfEquity', 'costOfDebt', 'marketRiskPremium', 'riskFreeRate'].includes(key)) {
            // If value is provided as a percentage (e.g., 5 for 5%), convert to decimal (0.05)
            if (!isNaN(parseFloat(value)) && parseFloat(value) > 0.2) {
              params[key] = (parseFloat(value) / 100).toString();
            } else {
              params[key] = value;
            }
          } else {
            params[key] = value;
          }
        }
      });
    } else {
      // Parse the request body to get the symbol, params, and dcf type
      const body = await req.json();
      symbol = body.symbol;
      params = body.params || {};
      type = body.type || "advanced";
      
      // Convert percentage values to decimals for specific parameters
      if (params) {
        ['longTermGrowthRate', 'costOfEquity', 'costOfDebt', 'marketRiskPremium', 'riskFreeRate'].forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            // Convert from percentage to decimal if needed
            if (typeof params[key] === 'number' && params[key] > 0.2) {
              params[key] = params[key] / 100;
            }
          }
        });
      }
    }
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Missing required parameter", details: "Symbol is required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Processing DCF request for ${symbol}, type: ${type}`);
    console.log("Parameters:", params);
    
    // Determine which endpoint to use based on the DCF type
    let apiUrl = "";
    
    switch (type) {
      case "standard":
        // Standard DCF endpoint
        apiUrl = `${API_BASE_URLS.FMP}/discounted-cash-flow/${symbol}?apikey=${FMP_API_KEY}`;
        break;
      case "levered":
        // Levered DCF endpoint
        apiUrl = `${API_BASE_URLS.FMP}/levered-discounted-cash-flow/${symbol}?apikey=${FMP_API_KEY}`;
        
        // Add optional limit parameter if provided
        if (params?.limit) {
          apiUrl += `&limit=${params.limit}`;
        }
        break;
      case "custom-levered":
        // Custom Levered DCF endpoint - using the stable endpoint
        apiUrl = `${API_BASE_URLS.FMP_STABLE}/custom-levered-discounted-cash-flow?symbol=${symbol}&apikey=${FMP_API_KEY}`;
        break;
      case "advanced":
      default:
        // Custom DCF Advanced endpoint - using the stable endpoint
        apiUrl = `${API_BASE_URLS.FMP_STABLE}/custom-discounted-cash-flow?symbol=${symbol}&apikey=${FMP_API_KEY}`;
        break;
    }
    
    // Add all provided parameters to query string for custom endpoints
    if ((type === "advanced" || type === "custom-levered") && params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && key !== 'limit') {
          apiUrl += `&${key}=${value}`;
        }
      });
    }
    
    console.log(`Calling FMP API: ${apiUrl.replace(FMP_API_KEY, 'API_KEY_HIDDEN')}`);
    
    // Fetch data from FMP API
    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`FMP API Error (${response.status}): ${errorText}`);
      
      // Generate mock DCF data for fallback
      const mockData = generateMockDCFData(symbol, type);
      
      console.log(`Using mock DCF data for ${symbol} due to API error`);
      
      return new Response(
        JSON.stringify(mockData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            ...getCacheHeaders(type),
            'X-Mock-Data': 'true'
          }
        }
      );
    }
    
    // Check content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error(`FMP API returned non-JSON response: ${responseText.substring(0, 200)}...`);
      
      // Generate mock DCF data for fallback
      const mockData = generateMockDCFData(symbol, type);
      
      console.log(`Using mock DCF data for ${symbol} due to non-JSON response`);
      
      return new Response(
        JSON.stringify(mockData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            ...getCacheHeaders(type),
            'X-Mock-Data': 'true'
          }
        }
      );
    }
    
    // Parse the API response
    const data = await response.json();
    
    // If we got an empty array, use mock data
    if (Array.isArray(data) && data.length === 0) {
      const mockData = generateMockDCFData(symbol, type);
      
      console.log(`Using mock DCF data for ${symbol} due to empty response`);
      
      return new Response(
        JSON.stringify(mockData),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json',
            ...getCacheHeaders(type),
            'X-Mock-Data': 'true'
          }
        }
      );
    }
    
    console.log(`Received DCF data for ${symbol}, type: ${type}`);
    
    // Return the DCF data with appropriate caching headers
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          ...getCacheHeaders(type)
        } 
      }
    );
    
  } catch (error) {
    console.error("Error in get-custom-dcf function:", error);
    
    // Generate mock DCF data for fallback
    const mockData = generateMockDCFData("UNKNOWN", "standard");
    
    return new Response(
      JSON.stringify(mockData),
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

// Function to generate mock DCF data when the API fails
function generateMockDCFData(symbol: string, type: string) {
  const currentYear = new Date().getFullYear();
  const baseRevenue = 1000000000;
  const baseEbit = baseRevenue * 0.25;
  const baseEbitda = baseEbit * 1.2;
  const baseFcf = baseEbit * 0.65;
  const baseSharesOutstanding = 1000000;
  
  // Generate 5 years of projected data
  const mockData = [];
  for (let i = 0; i < 5; i++) {
    const growthFactor = Math.pow(1.08, i); // 8% annual growth
    
    mockData.push({
      year: (currentYear + i).toString(),
      symbol: symbol,
      dcf: 100 + (10 * i), // Increasing DCF value
      price: 100,
      equityValuePerShare: 115 + (5 * i),
      beta: 1.2,
      dilutedSharesOutstanding: baseSharesOutstanding,
      revenue: baseRevenue * growthFactor,
      revenuePercentage: 8.5,
      ebitda: baseEbitda * growthFactor,
      ebitdaPercentage: 30,
      ebit: baseEbit * growthFactor,
      ebitPercentage: 25,
      depreciation: baseEbitda * growthFactor * 0.1,
      capitalExpenditure: baseRevenue * growthFactor * 0.08,
      capitalExpenditurePercentage: 8,
      totalDebt: baseRevenue * 0.3,
      cashAndCashEquivalents: baseRevenue * 0.2,
      totalEquity: baseRevenue * 0.7,
      totalCapital: baseRevenue,
      wacc: 0.095,
      operatingCashFlow: baseFcf * growthFactor * 1.2,
      operatingCashFlowPercentage: 28,
      freeCashFlow: baseFcf * growthFactor,
      taxRate: 0.21,
      costofDebt: 0.04,
      costOfEquity: 0.095,
      riskFreeRate: 0.035,
      marketRiskPremium: 0.05,
      longTermGrowthRate: 0.03
    });
  }
  
  return mockData;
}
