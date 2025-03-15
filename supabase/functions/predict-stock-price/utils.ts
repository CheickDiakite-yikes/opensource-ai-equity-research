
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
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
}

/**
 * Ensure number is within specified range
 */
export function ensureNumberInRange(value: any, min: number, max: number): number {
  const num = Number(value);
  if (isNaN(num)) return (min + max) / 2;
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
