
/**
 * Fetch with retry functionality for better reliability
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Hide API key in logs
      const logUrl = url.includes('apikey=') 
        ? url.replace(/apikey=[^&]+/, "apikey=API_KEY_HIDDEN") 
        : url;
      
      console.log(`Fetching ${logUrl} (attempt ${attempt}/${maxRetries})`);
      const response = await fetch(url, options);
      
      // Check if response is OK
      if (response.ok) {
        return response;
      }
      
      // For 4xx responses, don't retry as these are client errors
      if (response.status >= 400 && response.status < 500) {
        console.warn(`Request failed with status ${response.status} (not retrying)`);
        return response;
      }
      
      // For 5xx responses, log and retry with exponential backoff
      console.warn(`Request failed with status ${response.status}, retrying...`);
      lastError = new Error(`HTTP error: ${response.status}`);
    } catch (error) {
      console.error(`Fetch error (attempt ${attempt}/${maxRetries}):`, error);
      lastError = error instanceof Error ? error : new Error(String(error));
    }
    
    // Wait before retrying, with exponential backoff
    if (attempt < maxRetries) {
      const delay = retryDelay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple attempts');
}

/**
 * Checks if a response is successful and processes it
 */
export async function handleFetchResponse<T>(response: Response, errorMessage: string = "API request failed"): Promise<T> {
  if (!response.ok) {
    throw new Error(`${errorMessage} (${response.status}): ${await response.text()}`);
  }
  
  return await response.json() as T;
}
