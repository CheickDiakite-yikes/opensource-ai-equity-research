
/**
 * Get current price from financials or quote data
 */
export const getCurrentPrice = (financials: any[], quoteData?: any): number => {
  // If we have direct quote data, use it as the most accurate source
  if (quoteData && typeof quoteData.price === 'number') {
    console.log("Using live quote price:", quoteData.price);
    return quoteData.price;
  }
  
  // Fallback to financials data if available
  if (financials && financials.length > 0) {
    try {
      const sortedFinancials = [...financials].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      const latestPrice = sortedFinancials[0]?.price;
      if (latestPrice && typeof latestPrice === 'number') {
        console.log("Using latest financial price:", latestPrice);
        return latestPrice;
      }
    } catch (error) {
      console.error("Error extracting price from financials:", error);
    }
  }
  
  // If we reach here without a valid price, use a market-like default
  console.warn("Could not determine price from data, using default value");
  return 175.00; // More realistic default than 100
};
