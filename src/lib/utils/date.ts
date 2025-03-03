
/**
 * Convert a Date object to ISO date string (YYYY-MM-DD)
 */
export function dateToISOString(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Check if a string is a valid date
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Format a date string to a readable format
 */
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
