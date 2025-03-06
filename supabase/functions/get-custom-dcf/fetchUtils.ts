
/**
 * Fetch with retry functionality and improved error logging
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}/${maxRetries}: Fetching ${url.replace(/apikey=[^&]+/, 'apikey=***')}`);
      
      // Add timeout to fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        console.error(`Request timed out after 30 seconds (attempt ${attempt}/${maxRetries})`);
      }, 30000); // 30 second timeout
      
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
      
      // Log response status and headers
      console.log(`Response status: ${response.status}, Content-Type: ${response.headers.get('content-type')}`);
      
      // Check for non-success status codes and log them
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Could not read error response');
        console.error(`Request failed with status ${response.status}: ${errorText.substring(0, 500)}`);
        
        if (attempt < maxRetries) {
          console.log(`Will retry in ${Math.pow(2, attempt)} seconds...`);
          throw new Error(`HTTP error ${response.status}: ${errorText.substring(0, 100)}`);
        }
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Fetch error (attempt ${attempt}/${maxRetries}): ${errorMessage}`);
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxRetries) {
        // Wait before retrying with exponential backoff
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.log(`Retrying after ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new Error('Failed to fetch after multiple attempts');
}
