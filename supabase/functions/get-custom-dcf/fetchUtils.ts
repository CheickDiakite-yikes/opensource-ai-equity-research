
/**
 * Fetch with retry functionality
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Attempt ${attempt}: Fetching ${url.replace(/apikey=[^&]+/, 'apikey=***')}`);
      
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
      
      // Check if response is not OK
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error response (${response.status}): ${errorText}`);
        throw new Error(`Failed with status ${response.status}: ${errorText}`);
      }
      
      return response;
    } catch (error) {
      console.error(`Fetch error (attempt ${attempt}/${maxRetries}):`, error);
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
