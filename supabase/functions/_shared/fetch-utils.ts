
/**
 * Fetch with retry functionality
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      if (response.ok || attempt === maxRetries) {
        return response;
      }
      
      lastError = new Error(`Request failed with status ${response.status}`);
      console.warn(`Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Attempt ${attempt}/${maxRetries} failed: ${lastError.message}`);
      
      if (attempt === maxRetries) {
        throw lastError;
      }
    }
    
    // Exponential backoff
    const delay = retryDelay * Math.pow(2, attempt - 1);
    console.log(`Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  throw lastError || new Error("Failed to fetch after multiple attempts");
}
