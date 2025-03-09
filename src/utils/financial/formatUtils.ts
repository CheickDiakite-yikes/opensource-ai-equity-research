/**
 * Format percentage with 2 decimals
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return (value * 100).toFixed(2) + "%";
};

/**
 * Format currency with 2 decimals
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Format number with thousand separators
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) {
    return "N/A";
  }
  return value.toLocaleString();
};

/**
 * Format a large number with appropriate suffix (K, M, B, T)
 */
export const formatLargeNumber = (num: number): string => {
  if (num === null || num === undefined || isNaN(num)) return 'N/A';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1_000_000_000_000) {
    return (num / 1_000_000_000_000).toFixed(2) + 'T';
  } else if (absNum >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2) + 'B';
  } else if (absNum >= 1_000_000) {
    return (num / 1_000_000).toFixed(2) + 'M';
  } else if (absNum >= 1_000) {
    return (num / 1_000).toFixed(2) + 'K';
  } else {
    return num.toFixed(2);
  }
};

/**
 * Format a date string to a more readable format
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (e) {
    return dateString;
  }
};
