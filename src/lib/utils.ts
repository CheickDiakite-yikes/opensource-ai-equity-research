import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number, currency = "USD"): string {
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(value);
}

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

// Improved function for financial tables to format in billions/millions
export function formatFinancialTableValue(value: number, scale: 'millions' | 'billions' | 'thousands' = 'millions'): string {
  if (value === 0) return "$0.00";
  
  let scaleFactor = 1000000; // Default to millions
  let suffix = "M";
  
  if (scale === 'billions') {
    scaleFactor = 1000000000;
    suffix = "B";
  } else if (scale === 'thousands') {
    scaleFactor = 1000;
    suffix = "K";
  }
  
  // Convert to the specified scale
  const scaledValue = value / scaleFactor;
  
  // Format with 2 decimal places and the appropriate suffix
  return `$${scaledValue.toFixed(2)}${suffix}`;
}

// Format ratios and multiples with "x" suffix
export function formatMultiple(value: number): string {
  return `${value.toFixed(2)}x`;
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(2)}%`;
}

export function formatCompactNumber(value: number): string {
  const formatter = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  });

  return formatter.format(value);
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

export function dateToISOString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / Math.abs(previous)) * 100;
}

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

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  wait: number
): (...args: Parameters<F>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<F>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

// Formatting date for display
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

// Generate HTML for reports
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
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #1a365d;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #2a4365;
          margin-top: 30px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e2e8f0;
        }
        .date {
          color: #718096;
          font-style: italic;
          margin-bottom: 20px;
        }
        .recommendation, .price-target {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .summary {
          background-color: #f7fafc;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .section {
          margin: 25px 0;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}
