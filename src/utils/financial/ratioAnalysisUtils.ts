
import { FinancialData, RatioData } from '../../types/financialDataTypes';

/**
 * Calculate trend direction for a financial metric
 */
export function calculateMetricTrend(data: FinancialData[] | RatioData[], metricKey: string): 'increasing' | 'decreasing' | 'stable' | 'mixed' {
  if (!data || data.length < 2) return 'stable';
  
  // Sort data by date in ascending order
  const sortedData = [...data].sort((a, b) => new Date(a.date || '').getTime() - new Date(b.date || '').getTime());
  
  const values = sortedData.map(item => Number(item[metricKey]));
  
  // Check if values are consistently increasing
  let isIncreasing = true;
  let isDecreasing = true;
  
  for (let i = 1; i < values.length; i++) {
    if (values[i] <= values[i-1]) isIncreasing = false;
    if (values[i] >= values[i-1]) isDecreasing = false;
  }
  
  // Calculate percentage change between first and last value
  const percentChange = ((values[values.length - 1] - values[0]) / Math.abs(values[0])) * 100;
  
  if (isIncreasing) return 'increasing';
  if (isDecreasing) return 'decreasing';
  
  // If not consistently increasing or decreasing, check if the overall change is significant
  if (Math.abs(percentChange) < 5) return 'stable';
  
  return 'mixed';
}

/**
 * Generate a text analysis of a financial ratio compared to industry benchmarks
 */
export function analyzeRatio(ratio: number, ratioName: string, industryAverage: number): string {
  const percentDifference = ((ratio - industryAverage) / industryAverage) * 100;
  
  let analysis = `${ratioName} is `;
  
  if (Math.abs(percentDifference) < 5) {
    analysis += `in line with the industry average of ${industryAverage.toFixed(2)}.`;
  } else if (percentDifference > 0) {
    // For certain ratios like debt ratios, higher is not better
    const isHigherBetter = !['debt-to-equity', 'debt-to-assets', 'debt ratio'].includes(ratioName.toLowerCase());
    
    if (isHigherBetter) {
      analysis += `${percentDifference.toFixed(0)}% higher than the industry average, indicating stronger performance in this metric.`;
    } else {
      analysis += `${percentDifference.toFixed(0)}% higher than the industry average, which may indicate higher financial risk.`;
    }
  } else {
    // For certain ratios like debt ratios, lower is better
    const isLowerBetter = ['debt-to-equity', 'debt-to-assets', 'debt ratio'].includes(ratioName.toLowerCase());
    
    if (isLowerBetter) {
      analysis += `${Math.abs(percentDifference).toFixed(0)}% lower than the industry average, indicating more conservative financial policy.`;
    } else {
      analysis += `${Math.abs(percentDifference).toFixed(0)}% lower than the industry average, suggesting potential room for improvement.`;
    }
  }
  
  return analysis;
}

/**
 * Calculate and analyze capital structure
 */
export function analyzeCapitalStructure(totalAssets: number, totalLiabilities: number, totalEquity: number): string {
  const debtToAssets = totalLiabilities / totalAssets;
  const equityToAssets = totalEquity / totalAssets;
  
  let analysis = "The company's capital structure consists of ";
  
  if (debtToAssets > 0.7) {
    analysis += `a high proportion of debt financing (${(debtToAssets * 100).toFixed(1)}% of assets), which may indicate elevated financial risk but could enhance returns to equity holders if deployed effectively.`;
  } else if (debtToAssets > 0.4) {
    analysis += `a balanced mix of debt (${(debtToAssets * 100).toFixed(1)}% of assets) and equity (${(equityToAssets * 100).toFixed(1)}% of assets), suggesting a moderate approach to financial leverage.`;
  } else {
    analysis += `a conservative financing approach with ${(debtToAssets * 100).toFixed(1)}% debt to assets, which reduces financial risk but may limit returns on equity.`;
  }
  
  return analysis;
}

/**
 * Calculate and analyze cash conversion cycle
 */
export function analyzeCashConversionCycle(dso: number, dio: number, dpo: number): string {
  const ccc = dso + dio - dpo;
  
  let analysis = `The cash conversion cycle of ${ccc.toFixed(0)} days `;
  
  if (ccc > 90) {
    analysis += "is relatively long, suggesting potential inefficiencies in working capital management that may tie up cash unnecessarily.";
  } else if (ccc > 45) {
    analysis += "is moderate and in line with typical industry standards for working capital efficiency.";
  } else if (ccc > 0) {
    analysis += "is relatively short, indicating efficient working capital management that minimizes cash tied up in operations.";
  } else {
    analysis += "is negative, which is exceptional and indicates the company effectively uses supplier financing to fund its operations.";
  }
  
  return analysis;
}

/**
 * Export these functions as part of the financial utils
 */
export default {
  calculateMetricTrend,
  analyzeRatio,
  analyzeCapitalStructure,
  analyzeCashConversionCycle
};
