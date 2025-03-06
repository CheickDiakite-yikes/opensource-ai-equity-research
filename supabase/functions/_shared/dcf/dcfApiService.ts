
import { FMP_API_KEY } from "../constants.ts";
import { formatApiParams, buildApiUrl } from "./parameterUtils.ts";
import { enhanceCustomDCFData, createErrorResponse } from "./responseUtils.ts";

// Determine which endpoint to use based on the DCF type
export const getDCFEndpoint = (type: string, symbol: string, params: Record<string, any> = {}): string => {
  let apiUrl = "";
  
  switch (type) {
    case "standard":
      // Standard DCF endpoint
      apiUrl = `https://financialmodelingprep.com/api/v3/discounted-cash-flow/${symbol}`;
      break;
    case "levered":
      // Levered DCF endpoint
      apiUrl = `https://financialmodelingprep.com/api/v3/levered-discounted-cash-flow/${symbol}`;
      
      // Add optional limit parameter if provided
      if (params?.limit) {
        apiUrl += `?limit=${params.limit}`;
        delete params.limit; // Remove from params as it's already in URL
      }
      break;
    case "custom-levered":
      // Custom Levered DCF endpoint - using the stable endpoint
      apiUrl = `https://financialmodelingprep.com/stable/custom-levered-discounted-cash-flow?symbol=${symbol}`;
      break;
    case "advanced":
    default:
      // Custom DCF Advanced endpoint - using the stable endpoint
      apiUrl = `https://financialmodelingprep.com/stable/custom-discounted-cash-flow?symbol=${symbol}`;
      break;
  }
  
  return apiUrl;
};

// Make API request to FMP endpoints
export const fetchDCFData = async (
  type: string, 
  symbol: string, 
  params: Record<string, any> = {}
): Promise<any> => {
  try {
    // Format parameters for the FMP API
    const formattedParams = formatApiParams(params);
    
    // Get the base API URL
    let apiUrl = getDCFEndpoint(type, symbol, params);
    
    // Add all provided parameters to query string for custom endpoints
    if ((type === "advanced" || type === "custom-levered") && Object.keys(formattedParams).length > 0) {
      apiUrl = buildApiUrl(apiUrl, formattedParams);
    }
    
    // Add the API key
    apiUrl = buildApiUrl(apiUrl, { apikey: FMP_API_KEY });
    
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
      
      throw new Error(`API returned status ${response.status}: ${errorText}`);
    }
    
    // Check content type to ensure it's JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const responseText = await response.text();
      console.error(`FMP API returned non-JSON response: ${responseText.substring(0, 200)}...`);
      
      throw new Error("The API response is not in JSON format");
    }
    
    // Parse the API response
    const data = await response.json();
    console.log(`Received DCF data from FMP API for ${symbol}`, typeof data);
    
    return data;
  } catch (error) {
    throw error;
  }
};

// Try fallback endpoint when standard endpoint fails
export const tryFallbackEndpoint = async (type: string, symbol: string, formattedParams: Record<string, any>): Promise<any> => {
  try {
    // Determine v3 fallback URL
    let fallbackUrl = "";
    if (type === "custom-levered") {
      fallbackUrl = `https://financialmodelingprep.com/api/v3/valuation/discounted-levered-cash-flow/${symbol}?`;
    } else {
      fallbackUrl = `https://financialmodelingprep.com/api/v3/valuation/discounted-cash-flow/${symbol}?`;
    }
    
    // Add all provided parameters to query string
    if (Object.keys(formattedParams).length > 0) {
      Object.entries(formattedParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          fallbackUrl += `&${key}=${value}`;
        }
      });
    }
    
    // Add the API key
    fallbackUrl += `&apikey=${FMP_API_KEY}`;
    
    console.log(`Calling FMP fallback API: ${fallbackUrl.replace(FMP_API_KEY, 'API_KEY_HIDDEN')}`);
    
    // Fetch data from FMP API fallback
    const fallbackResponse = await fetch(fallbackUrl, {
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!fallbackResponse.ok) {
      throw new Error(`Fallback API returned status ${fallbackResponse.status}`);
    }
    
    // Check content type to ensure it's JSON
    const fallbackContentType = fallbackResponse.headers.get('content-type');
    if (!fallbackContentType || !fallbackContentType.includes('application/json')) {
      throw new Error("The fallback API response is not in JSON format");
    }
    
    // Parse the fallback API response
    const fallbackData = await fallbackResponse.json();
    console.log(`Received DCF data from FMP fallback API for ${symbol}`, typeof fallbackData);
    
    return fallbackData;
  } catch (error) {
    console.error("Fallback endpoint failed:", error);
    return null;
  }
};
