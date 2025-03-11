
// This file is a simple re-export of the modules in the marketData directory
// to maintain backward compatibility
export * from './marketData';

// Fetch market news from Financial Modeling Prep API
export const fetchMarketNews = async (limit = 10) => {
  try {
    console.log(`Fetching market news with limit: ${limit}`);
    const response = await fetch(`https://financialmodelingprep.com/api/v3/stock_news?tickers=AAPL,MSFT,GOOG,AMZN,TSLA&limit=${limit}&apikey=d4pXGs1r5epkkuckDZxOzSiG7DTd7BEg`);
    
    if (!response.ok) {
      console.error(`Failed to fetch market news: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch market news: ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log(`Successfully fetched ${data.length} news items`);
    return data;
  } catch (error) {
    console.error("Error fetching market news:", error);
    return [];
  }
};

export const fetchMarketIndices = async () => {
  // Since we're removing this functionality, return an empty array
  return [];
};
