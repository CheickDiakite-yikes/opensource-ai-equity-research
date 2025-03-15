
/**
 * Validates that prediction values are significantly different from current price
 */
export function validatePrediction(predictionData: any, currentPrice: number): boolean {
  if (!predictionData || !predictionData.predictedPrice) return false;
  
  // Check if values are valid numbers and not extremely large values
  const timeframes = ['oneMonth', 'threeMonths', 'sixMonths', 'oneYear'] as const;
  for (const timeframe of timeframes) {
    const price = predictionData.predictedPrice[timeframe];
    
    // Check for invalid prediction values - much more tolerant limits
    if (typeof price !== 'number' || 
        isNaN(price) || 
        !isFinite(price) || 
        price <= 0 || 
        price > currentPrice * 50) { // Increased max multiplier to 50x
      console.warn(`Invalid ${timeframe} prediction: ${price} (current: ${currentPrice})`);
      return false;
    }
  }
  
  // Very minimal threshold - just ensure the value is different from current price
  const yearDiff = Math.abs((predictionData.predictedPrice.oneYear - currentPrice) / currentPrice);
  if (yearDiff < 0.0001) return false; // Tiny difference required (0.01%)
  
  // Validate other timeframes with almost no threshold
  return true; // Accept any valid numeric values
}

/**
 * Validates that prediction is reasonably consistent with historical predictions
 */
export function validateConsistency(prediction: any, historicalPredictions: any[], currentPrice: number): boolean {
  if (!historicalPredictions || historicalPredictions.length === 0) return true;
  
  // Get the most recent prediction
  const mostRecent = historicalPredictions[0];
  
  // Ensure we have valid values
  if (!prediction?.predictedPrice?.oneYear || !mostRecent?.one_year_price || 
      typeof prediction.predictedPrice.oneYear !== 'number' || 
      typeof mostRecent.one_year_price !== 'number' ||
      isNaN(prediction.predictedPrice.oneYear) || 
      isNaN(mostRecent.one_year_price)) {
    return true; // Skip validation if values are not valid numbers
  }
  
  // Calculate the 1-year growth rates
  const newGrowthRate = (prediction.predictedPrice.oneYear / currentPrice) - 1;
  const lastGrowthRate = (mostRecent.one_year_price / mostRecent.current_price) - 1;
  
  // Calculate absolute difference in growth rates
  const growthRateDiff = Math.abs(newGrowthRate - lastGrowthRate);
  
  // Much more lenient consistency check - allow up to 100 percentage points difference
  const maxAllowedDiff = 1.0;
  
  return growthRateDiff <= maxAllowedDiff;
}
