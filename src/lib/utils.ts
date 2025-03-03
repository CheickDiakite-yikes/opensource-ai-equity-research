
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

// Improved function for financial tables to format in billions/millions with thousands separators
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
        .chart-container {
          margin: 20px 0;
          padding: 15px;
          background-color: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 5px;
        }
        .chart-title {
          font-weight: bold;
          color: #2a4365;
          margin-bottom: 10px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        th, td {
          border: 1px solid #e5e7eb;
          padding: 8px 12px;
          text-align: left;
        }
        th {
          background-color: #f1f5f9;
          font-weight: bold;
        }
        tr:nth-child(even) {
          background-color: #f9fafb;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}

// Process financial data to create chart-ready data objects
export function processFinancialDataForCharts(income: any[], balance: any[], cashflow: any[]): {
  revenueIncome: any[];
  assetsLiabilities: any[];
  profitability: any[];
  cashFlow: any[];
  revenueGrowth: any[];
  epsGrowth: any[];
} {
  // Initialize result object
  const result = {
    revenueIncome: [],
    assetsLiabilities: [],
    profitability: [],
    cashFlow: [],
    revenueGrowth: [],
    epsGrowth: []
  };
  
  // Process income statements for revenue and income data
  if (income && income.length > 0) {
    // Sort by date (descending order)
    const sortedIncome = [...income].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Take the last 5 years (or fewer if not available)
    const recentIncome = sortedIncome.slice(-5).reverse();
    
    // Format for revenue and income chart
    result.revenueIncome = recentIncome.map(item => ({
      year: item.calendarYear || new Date(item.date).getFullYear().toString(),
      revenue: item.revenue,
      netIncome: item.netIncome
    }));
    
    // Calculate growth rates for revenue
    result.revenueGrowth = recentIncome.map((item, index, arr) => {
      if (index === 0) {
        return {
          year: item.calendarYear || new Date(item.date).getFullYear().toString(),
          growth: 0 // No previous year for the first item
        };
      }
      
      const previousRevenue = arr[index - 1].revenue;
      const currentRevenue = item.revenue;
      const growthRate = previousRevenue ? ((currentRevenue - previousRevenue) / Math.abs(previousRevenue)) * 100 : 0;
      
      return {
        year: item.calendarYear || new Date(item.date).getFullYear().toString(),
        growth: growthRate
      };
    }).filter((_, index) => index > 0); // Remove the first item which has no growth
    
    // Calculate growth rates for EPS
    result.epsGrowth = recentIncome.map((item, index, arr) => {
      if (index === 0) {
        return {
          year: item.calendarYear || new Date(item.date).getFullYear().toString(),
          growth: 0 // No previous year for the first item
        };
      }
      
      const previousEPS = arr[index - 1].eps;
      const currentEPS = item.eps;
      const growthRate = previousEPS ? ((currentEPS - previousEPS) / Math.abs(previousEPS)) * 100 : 0;
      
      return {
        year: item.calendarYear || new Date(item.date).getFullYear().toString(),
        growth: growthRate
      };
    }).filter((_, index) => index > 0); // Remove the first item which has no growth
    
    // Format for profitability chart
    result.profitability = recentIncome.map(item => ({
      year: item.calendarYear || new Date(item.date).getFullYear().toString(),
      grossMargin: item.grossProfitRatio,
      operatingMargin: item.operatingIncomeRatio,
      netMargin: item.netIncomeRatio
    }));
  }
  
  // Process balance sheets for assets and liabilities data
  if (balance && balance.length > 0) {
    // Sort by date (descending order)
    const sortedBalance = [...balance].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Take the last 5 years (or fewer if not available)
    const recentBalance = sortedBalance.slice(-5).reverse();
    
    // Format for assets and liabilities chart
    result.assetsLiabilities = recentBalance.map(item => ({
      year: item.calendarYear || new Date(item.date).getFullYear().toString(),
      totalAssets: item.totalAssets,
      totalLiabilities: item.totalLiabilities
    }));
  }
  
  // Process cash flow statements for cash flow data
  if (cashflow && cashflow.length > 0) {
    // Sort by date (descending order)
    const sortedCashflow = [...cashflow].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Take the last 5 years (or fewer if not available)
    const recentCashflow = sortedCashflow.slice(-5).reverse();
    
    // Format for cash flow chart
    result.cashFlow = recentCashflow.map(item => ({
      year: item.calendarYear || new Date(item.date).getFullYear().toString(),
      operatingCashFlow: item.operatingCashFlow,
      freeCashFlow: item.freeCashFlow,
      investmentCashFlow: item.netCashUsedForInvestingActivites || (item.capitalExpenditure * -1) // Estimate if not available
    }));
  }
  
  return result;
}
