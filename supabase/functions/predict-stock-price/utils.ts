
/**
 * Extract JSON from text response
 */
export function extractJSONFromText(text: string) {
  console.log("Attempting to extract JSON from response text...");
  
  // First try direct JSON parsing
  try {
    return JSON.parse(text);
  } catch (e) {
    console.log("Direct JSON parsing failed, trying pattern matching...");
  }
  
  // Try to find JSON inside markdown code blocks
  const jsonCodeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
  const jsonMatch = text.match(jsonCodeBlockRegex);
  if (jsonMatch && jsonMatch[1]) {
    try {
      const jsonText = jsonMatch[1].trim();
      console.log("Found JSON in code block. Attempting to parse:", jsonText.substring(0, 100) + "...");
      return JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse extracted JSON from code block:", e);
    }
  }
  
  // Try to find JSON object pattern
  try {
    const objectRegex = /\{[\s\S]*\}/;
    const possibleJson = text.match(objectRegex);
    if (possibleJson) {
      console.log("Found possible JSON object. Attempting to parse:", possibleJson[0].substring(0, 100) + "...");
      return JSON.parse(possibleJson[0]);
    }
  } catch (e) {
    console.error("Failed to parse possible JSON from object pattern:", e);
  }
  
  // Try to extract structured data manually
  try {
    console.log("Attempting manual extraction of structured data...");
    return manuallyExtractStructuredData(text);
  } catch (e) {
    console.error("Failed to manually extract structured data:", e);
  }
  
  // If all else fails, log the text for debugging
  console.error("Could not extract valid JSON. Raw response:", text.substring(0, 500) + "...");
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

/**
 * Manually extract structured prediction data from text
 * This is a fallback for when JSON parsing fails
 */
function manuallyExtractStructuredData(text: string) {
  console.log("Performing manual extraction of prediction data...");
  
  // Extract price predictions using regex
  const prices = {
    oneMonth: extractNumberFromText(text, /one month:?\s*\$?(\d+\.?\d*)/i) || 
              extractNumberFromText(text, /1 month:?\s*\$?(\d+\.?\d*)/i) || 
              extractNumberFromText(text, /1-month:?\s*\$?(\d+\.?\d*)/i),
    threeMonths: extractNumberFromText(text, /three months?:?\s*\$?(\d+\.?\d*)/i) || 
                 extractNumberFromText(text, /3 months?:?\s*\$?(\d+\.?\d*)/i) || 
                 extractNumberFromText(text, /3-month:?\s*\$?(\d+\.?\d*)/i),
    sixMonths: extractNumberFromText(text, /six months?:?\s*\$?(\d+\.?\d*)/i) || 
               extractNumberFromText(text, /6 months?:?\s*\$?(\d+\.?\d*)/i) || 
               extractNumberFromText(text, /6-month:?\s*\$?(\d+\.?\d*)/i),
    oneYear: extractNumberFromText(text, /one year:?\s*\$?(\d+\.?\d*)/i) || 
             extractNumberFromText(text, /1 year:?\s*\$?(\d+\.?\d*)/i) || 
             extractNumberFromText(text, /1-year:?\s*\$?(\d+\.?\d*)/i)
  };
  
  // Extract sentiment
  let sentimentAnalysis = "";
  const sentimentMatch = text.match(/sentiment(?:\s+analysis)?:?\s*([^.]*\b(bullish|bearish|neutral)\b[^.]*)/i);
  if (sentimentMatch) {
    sentimentAnalysis = sentimentMatch[1].trim();
  }
  
  // Extract confidence level
  let confidenceLevel = 70; // Default confidence
  const confidenceMatch = text.match(/confidence(?:\s+level)?:?\s*(\d+)/i);
  if (confidenceMatch) {
    confidenceLevel = parseInt(confidenceMatch[1]);
  }
  
  // Extract key drivers
  const keyDrivers = extractListItems(text, /key\s+(?:growth\s+)?drivers?:/i);
  
  // Extract risks
  const risks = extractListItems(text, /(?:potential\s+)?risks?:/i);
  
  console.log("Manual extraction results:", { prices, sentimentAnalysis, confidenceLevel });
  
  // Construct structured data object
  return {
    predictedPrice: {
      oneMonth: prices.oneMonth || 0,
      threeMonths: prices.threeMonths || 0,
      sixMonths: prices.sixMonths || 0,
      oneYear: prices.oneYear || 0
    },
    sentimentAnalysis: sentimentAnalysis || "Neutral",
    confidenceLevel: confidenceLevel,
    keyDrivers: keyDrivers.length ? keyDrivers : ["Market conditions", "Industry trends", "Company performance"],
    risks: risks.length ? risks : ["Market volatility", "Economic uncertainty", "Competition"]
  };
}

/**
 * Extract a number from text using regex
 */
function extractNumberFromText(text: string, regex: RegExp): number | null {
  const match = text.match(regex);
  if (match && match[1]) {
    const value = parseFloat(match[1]);
    return isNaN(value) ? null : value;
  }
  return null;
}

/**
 * Extract list items from text
 */
function extractListItems(text: string, headerRegex: RegExp): string[] {
  const items: string[] = [];
  
  // Find the section
  const sectionMatch = text.match(new RegExp(headerRegex.source + '([\\s\\S]*?)(?:\\n\\n|\\n[A-Z]|$)', 'i'));
  if (!sectionMatch) return items;
  
  const sectionText = sectionMatch[1];
  
  // Extract list items (numbered, bulleted, or separated by newlines)
  const listItemRegex = /(?:^|\n)(?:[-*•]|\d+\.)\s*([^\n]+)/g;
  let itemMatch;
  
  while ((itemMatch = listItemRegex.exec(sectionText)) !== null) {
    if (itemMatch[1].trim()) {
      items.push(itemMatch[1].trim());
    }
  }
  
  // If no list items found, try splitting by newlines
  if (items.length === 0) {
    const lines = sectionText.split('\n').map(line => line.trim()).filter(line => line);
    for (const line of lines) {
      if (line.length > 5 && !line.match(/^[A-Z][a-z]+:/)) { // Skip headers
        items.push(line);
      }
    }
  }
  
  // Limit to 5 items
  return items.slice(0, 5);
}
