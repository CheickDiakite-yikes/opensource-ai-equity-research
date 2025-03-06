
/**
 * Fetch with retry functionality
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  initialBackoff: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}: Fetching ${url.replace(/apikey=[^&]+/, 'apikey=***')}`);
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
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
      
      // Log response status
      console.log(`Response status: ${response.status}`);
      
      if (!response.ok) {
        console.error(`Error response (${response.status}): ${response.statusText}`);
        
        // Try to get more detailed error information
        try {
          const errorBody = await response.text();
          console.error(`Error body: ${errorBody.substring(0, 500)}${errorBody.length > 500 ? '...' : ''}`);
        } catch (e) {
          console.error(`Could not parse error response: ${e}`);
        }
        
        if (attempt < maxRetries) {
          throw new Error(`HTTP error: ${response.status} ${response.statusText}`);
        }
      }
      
      // Check content type to ensure we received JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn(`Received non-JSON response (${contentType})`);
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Fetch error (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        // Wait before retrying with exponential backoff
        const delay = initialBackoff * Math.pow(2, attempt - 1);
        console.log(`Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple attempts');
}
