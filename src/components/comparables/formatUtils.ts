
/**
 * Utility functions for formatting financial data
 */

/**
 * Format a number as currency
 */
export function formatCurrency(value: number): string {
  return value < 1000 
    ? `$${value.toFixed(2)}`
    : `$${value.toFixed(0)}`;
}

/**
 * Format a number with appropriate suffix (K, M, B)
 */
export function formatNumber(value: number): string {
  if (value === 0) return "$0";
  
  if (Math.abs(value) >= 1e9) {
    return `$${(value / 1e9).toFixed(1)}B`;
  } else if (Math.abs(value) >= 1e6) {
    return `$${(value / 1e6).toFixed(1)}M`;
  } else if (Math.abs(value) >= 1e3) {
    return `$${(value / 1e3).toFixed(1)}K`;
  } else {
    return `$${value.toFixed(1)}`;
  }
}

/**
 * Format a ratio with 1 decimal place and x suffix
 */
export function formatRatio(value: number): string {
  return `${value.toFixed(1)}x`;
}
