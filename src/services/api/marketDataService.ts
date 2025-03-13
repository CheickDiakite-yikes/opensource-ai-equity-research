
// This file is a simple re-export of the modules in the marketData directory
// to maintain backward compatibility
export * from './marketData';

// Let's modify the fetchMarketNews function to ensure it works reliably
export const fetchMarketNews = async (limit = 6) => {
  try {
    // Simulated delay to prevent excessive rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Log for debugging
    console.log("Fetching market news with limit:", limit);
    
    // For now, we'll reuse our FMP API
    const url = `https://financialmodelingprep.com/api/v3/stock_news?limit=${limit}&apikey=d4pXGs1r5epkkuckDZxOzSiG7DTd7BEg`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Market news fetch failed with status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`Received ${data.length} news items`);
    return data;
  } catch (error) {
    console.error("Error in fetchMarketNews:", error);
    // Return empty array instead of throwing to prevent UI disruption
    return [];
  }
};
