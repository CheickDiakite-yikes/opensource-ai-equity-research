
/**
 * Fetch with enhanced retry functionality and logging
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response> {
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
      
      console.log("Sending request with options:", JSON.stringify({
        method: mergedOptions.method || 'GET',
        headers: Object.keys(mergedOptions.headers || {})
      }));
      
      const response = await fetch(url, mergedOptions);
      clearTimeout(timeoutId);
      
      console.log(`Response status: ${response.status}`);
      console.log(`Response headers: ${JSON.stringify(Object.fromEntries(response.headers.entries()))}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`DCF API Error (${response.status}):`, errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }
      
      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        console.error('Invalid content type:', contentType);
        const bodyText = await response.text();
        console.error('Response body (first 200 chars):', bodyText.substring(0, 200));
        throw new Error('API returned non-JSON response');
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
