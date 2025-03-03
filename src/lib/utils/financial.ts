
/**
 * Format a financial table value with appropriate scale
 */
export function formatFinancialTableValue(value: number, scale: 'millions' | 'billions' | 'thousands' = 'millions'): string {
  if (value === 0) return "$0.00";
  
  let scaleFactor = 1000000; // Default to millions
  
  if (scale === 'billions') {
    scaleFactor = 1000000000;
  } else if (scale === 'thousands') {
    scaleFactor = 1000;
  }
  
  // Convert to the specified scale
  const scaledValue = value / scaleFactor;
  
  // Format with 2 decimal places and thousands separators
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(scaledValue);
}

/**
 * Calculate growth rate between two values
 */
export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}
