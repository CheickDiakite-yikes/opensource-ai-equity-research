import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format } from "date-fns";

/**
 * Combines class names with tailwind-merge for handling conflicting classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format a number as a currency string with improved formatting for large numbers
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  if (amount === null || amount === undefined) return 'N/A';
  
  // For very large numbers, use the large number formatter with currency symbol
  if (Math.abs(amount) >= 1e9) {
    return '$' + (amount / 1e9).toFixed(2) + 'B';
  } else if (Math.abs(amount) >= 1e6) {
    return '$' + (amount / 1e6).toFixed(2) + 'M';
  } else if (Math.abs(amount) >= 1e3) {
    return '$' + (amount / 1e3).toFixed(1) + 'K';
  }
  
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency, 
    maximumFractionDigits: 2 
  }).format(amount);
}

/**
 * Format a large number with abbreviations (K, M, B, T) and improved precision
 */
export function formatLargeNumber(num: number): string {
  if (num === null || num === undefined) return 'N/A';
  
  const absNum = Math.abs(num);
  
  if (absNum >= 1e12) {
    return (num / 1e12).toFixed(2) + 'T';
  } else if (absNum >= 1e9) {
    return (num / 1e9).toFixed(2) + 'B';
  } else if (absNum >= 1e6) {
    return (num / 1e6).toFixed(2) + 'M';
  } else if (absNum >= 1e3) {
    return (num / 1e3).toFixed(1) + 'K';
  } else {
    return num.toLocaleString(undefined, {maximumFractionDigits: 2});
  }
}

/**
 * Format a date
 */
export function formatDate(date: string | Date): string {
  if (!date) return 'N/A';
  return format(new Date(date), 'MMM d, yyyy');
}

/**
 * Calculate percentage change between two numbers
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (!previous) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Format a percentage with sign and decimal places
 * Improved to handle different decimal place requirements
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  if (value === null || value === undefined) return 'N/A';
  
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

/**
 * Style percentage based on value (positive/negative)
 * Enhanced with more style options
 */
export function getPercentStyle(value: number): string {
  if (value > 5) return 'text-green-600 font-medium';
  if (value > 0) return 'text-green-500';
  if (value < -5) return 'text-red-600 font-medium';
  if (value < 0) return 'text-red-500';
  return 'text-gray-500';
}

/**
 * Debounce function for limiting how often a function can be called
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Parse and clean CSV data
 */
export function parseCSV(csvData: string): string[][] {
  return csvData.split('\n')
    .map(row => row.split(',').map(cell => cell.trim()));
}

/**
 * Generate PDF file name for report downloads
 */
export function generateReportFileName(symbol: string): string {
  const date = format(new Date(), 'yyyy-MM-dd');
  return `${symbol}_Equity_Research_Report_${date}.pdf`;
}

/**
 * Calculate compound annual growth rate (CAGR)
 */
export function calculateCAGR(
  beginningValue: number, 
  endingValue: number, 
  numberOfYears: number
): number {
  if (beginningValue <= 0 || numberOfYears <= 0) return 0;
  return Math.pow(endingValue / beginningValue, 1 / numberOfYears) - 1;
}

/**
 * Get the trend direction based on historical values
 */
export function getTrendDirection(values: number[]): "up" | "down" | "neutral" {
  if (values.length < 2) return "neutral";
  
  const sum = values.slice(1).reduce((acc, val, i) => {
    return acc + Math.sign(val - values[i]);
  }, 0);
  
  if (sum > 0) return "up";
  if (sum < 0) return "down";
  return "neutral";
}

/**
 * Generate report HTML content for export (simplified)
 */
export function generateReportHTML(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 20px;
          color: #333;
        }
        .report-header {
          text-align: center;
          margin-bottom: 40px;
        }
        .report-header h1 {
          margin-bottom: 10px;
        }
        .report-section {
          margin-bottom: 30px;
        }
        .report-section h2 {
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
          margin-bottom: 15px;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          font-size: 0.8em;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1>${title}</h1>
        <p>Generated on ${format(new Date(), 'MMMM d, yyyy')}</p>
      </div>
      <div class="report-content">
        ${content}
      </div>
      <div class="footer">
        <p>This report was generated using AI Equity Research. The information contained in this report is for informational purposes only.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Format financial values for better display in charts (in millions/billions)
 * Improved precision and formatting
 */
export function formatChartValue(value: number): string {
  if (value === null || value === undefined) return 'N/A';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e12) {
    return `${sign}$${(absValue / 1e12).toFixed(2)}T`;
  } else if (absValue >= 1e9) {
    return `${sign}$${(absValue / 1e9).toFixed(2)}B`;
  } else if (absValue >= 1e6) {
    return `${sign}$${(absValue / 1e6).toFixed(2)}M`;
  } else if (absValue >= 1e3) {
    return `${sign}$${(absValue / 1e3).toFixed(1)}K`;
  } else {
    return `${sign}$${absValue.toFixed(0)}`;
  }
}

/**
 * Format ratio values with proper decimal places
 */
export function formatRatio(value: number, decimals: number = 2): string {
  if (value === null || value === undefined) return 'N/A';
  return value.toFixed(decimals) + 'x';
}
