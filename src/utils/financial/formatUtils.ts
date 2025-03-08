// Utility functions for formatting and processing financial data

/**
 * Format a number with commas and specified decimal places
 */
export const formatNumber = (num: number | null | undefined, decimals: number = 2): string => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format a currency value
 */
export const formatCurrency = (num: number | null | undefined, currency: string = 'USD'): string => {
  if (num === null || num === undefined) return 'N/A';
  return num.toLocaleString('en-US', {
    style: 'currency',
    currency,
  });
};

/**
 * Format a date
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return dateObj.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format a large number in a readable format (K, M, B, T)
 */
export const formatLargeNumber = (num: number): string => {
  if (isNaN(num) || num === null) return 'N/A';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) {
    return `$${(num / 1e12).toFixed(2)}T`;
  } else if (absNum >= 1e9) {
    return `$${(num / 1e9).toFixed(2)}B`;
  } else if (absNum >= 1e6) {
    return `$${(num / 1e6).toFixed(2)}M`;
  } else if (absNum >= 1e3) {
    return `$${(num / 1e3).toFixed(2)}K`;
  } else {
    return `$${num.toFixed(2)}`;
  }
};

/**
 * Format a percentage value
 */
export const formatPercentage = (value: number): string => {
  if (isNaN(value) || value === null) return 'N/A';
  
  // Convert decimal to percentage (e.g., 0.1234 to 12.34%)
  return `${(value * 100).toFixed(2)}%`;
};

/**
 * Shorten a long text string
 */
export const shortenText = (text: string, maxLength: number): string => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
