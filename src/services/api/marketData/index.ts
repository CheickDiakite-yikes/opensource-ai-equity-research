// Re-export everything from the individual modules
export * from './newsService';
export * from './indicesService'; 
export * from './stockDataService';

// Company logo fetching function
export const fetchCompanyLogo = async (ticker: string): Promise<string | null> => {
  if (!ticker) return null;
  
  try {
    console.log(`Fetching logo for ${ticker}`);
    
    // Clean up ticker format - remove exchange prefix if present
    const cleanTicker = ticker.includes(':') 
      ? ticker.split(':')[1].trim() 
      : ticker.trim();
    
    // Try to fetch from the Supabase function that has access to FMP API
    const response = await fetch('/api/get-company-logo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ticker: cleanTicker })
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch company logo: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data && data.logoUrl) {
      return data.logoUrl;
    }
    
    // Try multiple fallback sources for company logos
    
    // Option 1: FMP direct image pattern
    const fmpImageUrl = `https://financialmodelingprep.com/image-stock/${cleanTicker}.png`;
    
    // Option 2: Companies Logo service
    const companiesLogoUrl = `https://companieslogo.com/img/orig/${cleanTicker}.png`;
    
    // Try to preload the FMP image to see if it exists
    const imgPromise = new Promise<string>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(fmpImageUrl);
      img.onerror = () => reject(new Error('Image failed to load'));
      img.src = fmpImageUrl;
    });
    
    try {
      // If FMP image loads successfully, use it
      return await imgPromise;
    } catch {
      // Otherwise return the companies logo URL as a fallback
      // We don't check if this works, we'll let the component handle fallback
      return companiesLogoUrl;
    }
  } catch (error) {
    console.error("Error fetching company logo:", error);
    return null;
  }
};
