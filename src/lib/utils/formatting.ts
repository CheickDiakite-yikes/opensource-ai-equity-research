
/**
 * Format a number as a currency value
 */
export function formatCurrency(value: number, currency = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}

/**
 * Format a large number with appropriate suffix (K, M, B, T)
 */
export function formatLargeNumber(value: number): string {
  if (value === 0) return "$0";
  
  if (Math.abs(value) >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (Math.abs(value) >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  }

  return formatCurrency(value);
}

/**
 * Format a number as a multiple (e.g., 2.50x)
 */
export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

/**
 * Format a number as a percentage
 */
export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Format a number in compact notation
 */
export function formatCompactNumber(value: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  });

  return formatter.format(value);
}

/**
 * Truncate text to a specified length
 */
export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * Get a category color based on index
 */
export function getCategoryColor(index: number): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-red-500",
    "bg-orange-500",
  ];

  return colors[index % colors.length];
}
