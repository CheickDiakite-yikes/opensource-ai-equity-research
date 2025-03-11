
// This file is a simple re-export of the modules in the marketData directory
// to maintain backward compatibility
export * from './marketData';

export const fetchMarketNews = async (limit = 10) => {
  try {
    const response = await fetch(`https://financialmodelingprep.com/api/v3/stock_news?tickers=AAPL,MSFT,GOOG,AMZN,TSLA&limit=${limit}&apikey=d4pXGs1r5epkkuckDZxOzSiG7DTd7BEg`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market news: ${response.statusText}`);
    }
    
    const data = await response.json();
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
