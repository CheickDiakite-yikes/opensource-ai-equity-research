
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ResearchReport } from "@/types";

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
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}

// Generate complete HTML report from ResearchReport object
export function generateReportHTMLFromReport(report: ResearchReport): string {
  // Create report content
  let content = `
    <h1>${report.companyName} (${report.symbol}) - Equity Research Report</h1>
    <div class="date">Date: ${report.date}</div>
    <div class="recommendation">Recommendation: ${report.recommendation}</div>
    <div class="price-target">Target Price: $${report.targetPrice}</div>
    
    <div class="summary">
      <h2>Executive Summary</h2>
      <p>${report.summary || 'No summary available.'}</p>
    </div>
  `;
  
  // Add rating details if available
  if (report.ratingDetails) {
    content += `
      <div class="section">
        <h2>Rating Details</h2>
        <ul>
          <li><strong>Overall Rating:</strong> ${report.ratingDetails.overallRating}</li>
          <li><strong>Financial Strength:</strong> ${report.ratingDetails.financialStrength}</li>
          <li><strong>Growth Outlook:</strong> ${report.ratingDetails.growthOutlook}</li>
          <li><strong>Valuation:</strong> ${report.ratingDetails.valuationAttractiveness}</li>
          <li><strong>Competitive Position:</strong> ${report.ratingDetails.competitivePosition}</li>
        </ul>
      </div>
    `;
  }
  
  // Add scenario analysis if available
  if (report.scenarioAnalysis) {
    content += `
      <div class="section">
        <h2>Scenario Analysis</h2>
        <h3>Bull Case</h3>
        <p><strong>Price Target:</strong> ${report.scenarioAnalysis.bullCase.price}</p>
        <p>${report.scenarioAnalysis.bullCase.description}</p>
        
        <h3>Base Case</h3>
        <p><strong>Price Target:</strong> ${report.scenarioAnalysis.baseCase.price}</p>
        <p>${report.scenarioAnalysis.baseCase.description}</p>
        
        <h3>Bear Case</h3>
        <p><strong>Price Target:</strong> ${report.scenarioAnalysis.bearCase.price}</p>
        <p>${report.scenarioAnalysis.bearCase.description}</p>
      </div>
    `;
  }
  
  // Add all sections
  for (const section of report.sections) {
    content += `
      <div class="section">
        <h2>${section.title}</h2>
        <p>${section.content}</p>
      </div>
    `;
  }
  
  // Add disclaimer
  content += `
    <div class="section">
      <h2>Disclaimer</h2>
      <p>This report is for informational purposes only and does not constitute financial advice. The analysis provided is based on available data at the time of writing and is subject to change. Always conduct your own research before making investment decisions.</p>
    </div>
  `;
  
  return generateReportHTML(report.companyName, content);
}
