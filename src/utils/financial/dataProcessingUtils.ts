import { FinancialData } from '../../types/financialDataTypes';

/**
 * Transform financial data to growth rate data for charting
 */
export function transformFinancialsToGrowthData(
  data: FinancialData[], 
  metric: keyof FinancialData
): Array<{year: string, growth: number}> {
  if (!data || data.length < 2) return [];

  // Sort data by date in ascending order (oldest first)
  const sortedData = [...data].sort((a, b) => 
    new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
  );

  const result = [];
  
  // Calculate year-over-year growth for each year except the first
  for (let i = 1; i < sortedData.length; i++) {
    const currentValue = Number(sortedData[i][metric]);
    const previousValue = Number(sortedData[i-1][metric]);
    
    if (previousValue && previousValue !== 0 && !Number.isNaN(currentValue) && !Number.isNaN(previousValue)) {
      const growth = ((currentValue - previousValue) / Math.abs(previousValue)) * 100;
      
      result.push({
        year: sortedData[i].year,
        growth: parseFloat(growth.toFixed(2))
      });
    }
  }

  return result;
}

/**
 * Additional data processing functions can be added here
 */
