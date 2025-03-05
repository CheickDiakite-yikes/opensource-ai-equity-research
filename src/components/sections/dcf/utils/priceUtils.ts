
/**
 * Get current price from financials
 */
export const getCurrentPrice = (financials: any[]): number => {
  if (!financials || financials.length === 0) return 100;
  
  try {
    return financials.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0]?.price || 100;
  } catch (error) {
    console.error("Error getting current price:", error);
    return 100;
  }
};
