
/**
 * Retry a function with exponential backoff
 */
export async function fetchWithRetry<T>(fetchFn: () => Promise<T>, retries = 2, delayMs = 1000): Promise<T> {
  try {
    return await fetchFn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    console.log(`Retrying... ${retries} attempts left`);
    await new Promise(r => setTimeout(r, delayMs)); // delay before retry
    
    return fetchWithRetry(fetchFn, retries - 1, delayMs * 2); // exponential backoff
  }
}
