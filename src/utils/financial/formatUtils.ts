
/**
 * Format currency values
 */
export const formatCurrency = (value: number, options?: { 
  currency?: string, 
  minimumFractionDigits?: number,
  maximumFractionDigits?: number,
  compact?: boolean 
}): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0.00';
  }
  
  // Default options
  const currency = options?.currency || 'USD';
  const minimumFractionDigits = options?.minimumFractionDigits ?? 2;
  const maximumFractionDigits = options?.maximumFractionDigits ?? 2;
  
  // Format based on magnitude
  if (options?.compact === true || Math.abs(value) >= 1000000) {
    return formatLargeNumber(value, {
      style: 'currency',
      currency
    });
  }
  
  // Regular currency formatting
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(value);
};

/**
 * Format large numbers with K, M, B, T suffixes
 */
export const formatLargeNumber = (value: number, options?: Intl.NumberFormatOptions): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '$0';
  }
  
  // Default formatting options
  const formatOptions: Intl.NumberFormatOptions = {
    style: options?.style || 'decimal',
    minimumFractionDigits: options?.minimumFractionDigits || 1,
    maximumFractionDigits: options?.maximumFractionDigits || 1,
    ...options
  };
  
  // Determine the appropriate suffix and divisor
  let suffix = '';
  let divisor = 1;
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1e12) {
    // Trillions
    suffix = 'T';
    divisor = 1e12;
  } else if (absValue >= 1e9) {
    // Billions
    suffix = 'B';
    divisor = 1e9;
  } else if (absValue >= 1e6) {
    // Millions
    suffix = 'M';
    divisor = 1e6;
  } else if (absValue >= 1e3) {
    // Thousands
    suffix = 'K';
    divisor = 1e3;
  }
  
  // Format the number
  const formattedValue = new Intl.NumberFormat('en-US', formatOptions).format(value / divisor);
  
  return formattedValue + suffix;
};

/**
 * Format percentage values
 */
export const formatPercentage = (value: number, minimumFractionDigits = 1, maximumFractionDigits = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0%';
  }
  
  // Ensure value is displayed as percentage (multiply by 100 if it's in decimal form)
  const displayValue = value > 1 ? value : value * 100;
  
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
    // Need to divide by 100 since we're using percent style which automatically multiplies by 100
    // and we might have already converted the value above if it was a decimal
  }).format(displayValue / 100);
};

/**
 * Format number with commas
 */
export const formatNumber = (value: number): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US').format(value);
};
