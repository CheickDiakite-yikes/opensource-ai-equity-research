
// Re-export everything from the individual modules
export * from './newsService';
export * from './indicesService'; 
export * from './stockDataService';

// Company logo fetching function
export const fetchCompanyLogo = async (ticker: string): Promise<string | null> => {
  if (!ticker) return null;
  
  try {
    console.log(`Fetching logo for ${ticker}`);
    
    // Try to fetch from the Supabase function that has access to FMP API
    const response = await fetch('/api/get-company-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch company logo: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data && data.logoUrl) {
      return data.logoUrl;
    }
    
    // Fallback to using a standard pattern for company logos if available
    // Format: https://financialmodelingprep.com/image-stock/{TICKER}.png
    // or https://companieslogo.com/img/orig/{TICKER}-{EXCHANGE}.png
    // Both options don't require API keys for images
    
    // Try FMP first as it has more logos
    return `https://financialmodelingprep.com/image-stock/${ticker}.png`;
  } catch (error) {
    console.error("Error fetching company logo:", error);
    return null;
  }
};
