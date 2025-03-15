
/**
 * Extract JSON from text response
 */
export function extractJSONFromText(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to next attempt
  }
  
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
    }
  }
  
  const possibleJson = text.match(/\{[\s\S]*\}/);
  if (possibleJson) {
    try {
      return JSON.parse(possibleJson[0]);
    } catch (e) {
      console.error("Failed to parse possible JSON:", e);
    }
  }
  
  throw new Error("Could not extract valid JSON from response");
}

/**
 * Ensure value is a number
 */
export function ensureNumberValue(value: any, defaultValue: number): number {
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  return defaultValue;
}

/**
 * Ensure number is within specified range
 */
export function ensureNumberInRange(value: any, min: number, max: number): number {
  // First validate it's a proper number
  const num = Number(value);
  if (isNaN(num) || !isFinite(num)) return (min + max) / 2;
  
  // Then constrain to range
  return Math.min(Math.max(num, min), max);
}

/**
 * Ensure array has items or return default
 */
export function ensureArrayWithItems(array: any, defaultArray: string[]): string[] {
  if (Array.isArray(array) && array.length > 0) {
    return array;
  }
  return defaultArray;
}

/**
 * Safely process prediction values to prevent extreme prices
 */
export function processPredictionPrices(prices: any, currentPrice: number): any {
  if (!prices) return null;
  
  // Maximum allowed multiplier relative to current price
  const maxMultiplier = 3.0; // Max 3x current price
  const minMultiplier = 0.3; // Min 0.3x current price (70% drop)
  
  // Process each timeframe
  const timeframes = ['oneMonth', 'threeMonths', 'sixMonths', 'oneYear'];
  const processedPrices: Record<string, number> = {};
  
  timeframes.forEach(timeframe => {
    let value = prices[timeframe];
    
    // Validate and constrain the price
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value) || value <= 0) {
      // Generate reasonable default based on timeframe
      const defaults = {
        oneMonth: 1.02, // 2% change
        threeMonths: 1.05, // 5% change
        sixMonths: 1.08, // 8% change
        oneYear: 1.15 // 15% change
      };
      const multiplier = defaults[timeframe as keyof typeof defaults];
      value = currentPrice * multiplier;
    } else {
      // Constrain existing value
      const maxPrice = currentPrice * maxMultiplier;
      const minPrice = currentPrice * minMultiplier;
      value = Math.min(Math.max(value, minPrice), maxPrice);
    }
    
    // Store processed value with 2 decimal places
    processedPrices[timeframe] = parseFloat(value.toFixed(2));
  });
  
  return processedPrices;
}
