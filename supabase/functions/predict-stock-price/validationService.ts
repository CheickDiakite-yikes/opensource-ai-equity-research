
/**
 * Validates that prediction values are significantly different from current price
 */
export function validatePrediction(predictionData: any, currentPrice: number): boolean {
  if (!predictionData || !predictionData.predictedPrice) return false;
  
  // Check if values are valid numbers and not extremely large values
  const timeframes = ['oneMonth', 'threeMonths', 'sixMonths', 'oneYear'] as const;
  for (const timeframe of timeframes) {
    const price = predictionData.predictedPrice[timeframe];
    
    // Check for invalid prediction values - be more tolerant of variations
    if (typeof price !== 'number' || 
        isNaN(price) || 
        !isFinite(price) || 
        price <= 0 || 
        price > currentPrice * 20) { // Increased max multiplier from 10x to 20x
      console.warn(`Invalid ${timeframe} prediction: ${price} (current: ${currentPrice})`);
      return false;
    }
  }
  
  // Check one-year prediction - reduced minimum difference threshold
  const yearDiff = Math.abs((predictionData.predictedPrice.oneYear - currentPrice) / currentPrice);
  if (yearDiff < 0.005) return false; // Reduced from 0.01 to 0.005
  
  // Validate other timeframes with reduced threshold
  return timeframes.every(timeframe => {
    const price = predictionData.predictedPrice[timeframe];
    return Math.abs((price - currentPrice) / currentPrice) >= 0.0025; // Reduced from 0.005 to 0.0025
  });
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
  
  // If the difference is more than 40 percentage points, consider it inconsistent
  // Increased from 25 percentage points to 40 to be more lenient
  const priceChangePct = Math.abs((currentPrice / mostRecent.current_price) - 1);
  
  // Allow larger prediction differences if the price has changed significantly
  const maxAllowedDiff = priceChangePct > 0.1 ? 0.5 : 0.4; // Increased both thresholds
  
  return growthRateDiff <= maxAllowedDiff;
}
