
/**
 * Validates that prediction values are significantly different from current price
 */
export function validatePrediction(predictionData: any, currentPrice: number): boolean {
  if (!predictionData || !predictionData.predictedPrice) return false;
  
  const oneYearPrice = predictionData.predictedPrice.oneYear;
  if (typeof oneYearPrice !== 'number') return false;
  
  // Check one-year prediction (should be at least 1% different)
  const yearDiff = Math.abs((oneYearPrice - currentPrice) / currentPrice);
  if (yearDiff < 0.01) return false;
  
  // Validate other timeframes
  const timeframes = ['oneMonth', 'threeMonths', 'sixMonths'] as const;
  return timeframes.every(timeframe => {
    const price = predictionData.predictedPrice[timeframe];
    return typeof price === 'number' && Math.abs((price - currentPrice) / currentPrice) >= 0.005;
  });
}
