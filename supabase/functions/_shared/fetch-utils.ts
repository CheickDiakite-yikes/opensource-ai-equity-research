
/**
 * Fetch with retry functionality for better reliability
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching ${url} (attempt ${attempt}/${maxRetries})`);
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
      
      // For 5xx responses, log and retry
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

/**
 * Safely performs a fetch operation with proper error handling
 */
export async function safeFetch<T>(
  url: string, 
  options: RequestInit = {}, 
  errorMessage: string = "Failed to fetch data"
): Promise<T | null> {
  try {
    const response = await fetchWithRetry(url, options);
    return await handleFetchResponse<T>(response, errorMessage);
  } catch (error) {
    console.error(`Safe fetch error: ${errorMessage}`, error);
    return null;
  }
}

/**
 * Batch fetch multiple URLs concurrently with error handling
 */
export async function batchFetch<T>(
  urls: string[], 
  options: RequestInit = {},
  errorMessage: string = "Batch fetch failed"
): Promise<(T | null)[]> {
  try {
    const promises = urls.map(url => safeFetch<T>(url, options));
    return await Promise.all(promises);
  } catch (error) {
    console.error(`Batch fetch error: ${errorMessage}`, error);
    return urls.map(() => null);
  }
}
