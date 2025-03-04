
/**
 * Format large numbers to a more readable format (e.g., 1,000,000 to $1M)
 */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
}

/**
 * Format percentage values
 */
export function formatPercentage(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return `${value.toFixed(2)}%`;
}

/**
 * Format number with commas for thousands separator
 */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return 'N/A';
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

/**
 * Format date from financial statements
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateString || 'N/A';
  }
}

/**
 * Get a suggested color based on performance
 */
export function getPerformanceColor(value: number, isPercentage: boolean = true): string {
  // For percentages (growth rates, ratios expressed as percentages)
  if (isPercentage) {
    if (value >= 25) return '#22c55e'; // green-500
    if (value >= 10) return '#4ade80'; // green-400
    if (value >= 0) return '#86efac'; // green-300
    if (value >= -10) return '#fca5a5'; // red-300
    if (value >= -25) return '#f87171'; // red-400
    return '#ef4444'; // red-500
  } 
  // For ratios and non-percentage values
  else {
    if (value >= 3) return '#22c55e'; // green-500
    if (value >= 2) return '#4ade80'; // green-400
    if (value >= 1) return '#86efac'; // green-300
    if (value >= 0.5) return '#fca5a5'; // red-300
    if (value >= 0.25) return '#f87171'; // red-400
    return '#ef4444'; // red-500
  }
}

/**
 * Determine the growth trend direction and strength
 */
export function determineGrowthTrend(cagr: number): 'strong-positive' | 'positive' | 'neutral' | 'negative' | 'strong-negative' {
  if (cagr >= 25) return 'strong-positive';
  if (cagr >= 10) return 'positive';
  if (cagr >= -5) return 'neutral';
  if (cagr >= -15) return 'negative';
  return 'strong-negative';
}
