
/**
 * Extract JSON from text response with improved error handling
 */
export function extractJSONFromText(text: string) {
  // First attempt: direct JSON parsing
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("Direct JSON parsing failed, trying alternative methods");
  }
  
  // Second attempt: extract JSON from code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON from code block:", e);
    }
  }
  
  // Third attempt: find anything that looks like a JSON object
  const possibleJson = text.match(/\{[\s\S]*\}/);
  if (possibleJson) {
    try {
      return JSON.parse(possibleJson[0]);
    } catch (e) {
      console.error("Failed to parse possible JSON object:", e);
    }
  }
  
  // Fourth attempt: try to fix common JSON syntax errors
  try {
    // Replace single quotes with double quotes
    const fixedText = text.replace(/'/g, '"')
                          .replace(/\n/g, ' ')
                          .replace(/([{,])\s*(\w+):/g, '$1"$2":');
    return JSON.parse(fixedText);
  } catch (e) {
    console.error("Failed to parse fixed JSON:", e);
  }
  
  throw new Error("Could not extract valid JSON from response");
}

/**
 * Ensure value is a number with better fallback handling
 */
export function ensureNumberValue(value: any, defaultValue: number): number {
  // Handle various invalid input formats
  if (value === null || value === undefined) return defaultValue;
  
  // Convert string numbers
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (!isNaN(parsed)) return parsed;
    return defaultValue;
  }
  
  // Return if already a valid number
  if (typeof value === 'number' && !isNaN(value) && isFinite(value)) {
    return value;
  }
  
  return defaultValue;
}

/**
 * Ensure number is within specified range with more resilient handling
 */
export function ensureNumberInRange(value: any, min: number, max: number): number {
  // First validate it's a proper number
  const num = ensureNumberValue(value, (min + max) / 2);
  
  // Then constrain to range
  return Math.min(Math.max(num, min), max);
}

/**
 * Ensure array has items or return default with better type handling
 */
export function ensureArrayWithItems<T>(array: any, defaultArray: T[]): T[] {
  if (Array.isArray(array) && array.length > 0) {
    return array;
  }
  return defaultArray;
}

/**
 * Process prediction prices with extremely lenient limits
 */
export function processPredictionPrices(prices: any, currentPrice: number): any {
  if (!prices) return null;
  
  // Maximum and minimum allowed multipliers with extremely lenient bounds
  const maxMultiplier = 100.0; // Allow up to 100x increase
  const minMultiplier = 0.001; // Allow up to 99.9% drop
  
  // Process each timeframe
  const timeframes = ['oneMonth', 'threeMonths', 'sixMonths', 'oneYear'];
  const processedPrices: Record<string, number> = {};
  
  timeframes.forEach(timeframe => {
    let value = prices[timeframe];
    
    // Validate and constrain the price very leniently
    if (typeof value !== 'number' || isNaN(value) || !isFinite(value) || value <= 0) {
      // Generate reasonable default based on timeframe
      const defaults = {
        oneMonth: 1.01, // 1% change
        threeMonths: 1.03, // 3% change
        sixMonths: 1.05, // 5% change
        oneYear: 1.10 // 10% change
      };
      const multiplier = defaults[timeframe as keyof typeof defaults];
      value = currentPrice * multiplier;
      console.log(`Using default price for ${timeframe}: ${value}`);
    } else {
      // Very wide bounds
      const maxPrice = currentPrice * maxMultiplier;
      const minPrice = currentPrice * minMultiplier;
      
      // If outside bounds, log but don't constrain for testing
      if (value > maxPrice || value < minPrice) {
        console.log(`Price for ${timeframe} (${value}) outside recommended bounds: [${minPrice}, ${maxPrice}]`);
        // We don't constrain the value during testing to see actual values
      }
    }
    
    // Store processed value with 2 decimal places
    processedPrices[timeframe] = parseFloat(value.toFixed(2));
  });
  
  return processedPrices;
}
