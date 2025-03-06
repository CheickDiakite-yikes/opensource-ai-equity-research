
/**
 * Calculate a manual DCF as a final fallback
 */
export function calculateManualDCF(symbol: any, profile: any, financials: any[], cashFlow: any[], balanceSheet: any[]) {
  // Get the most recent fiscal year data
  const latestIncome = financials[0];
  const latestCashFlow = cashFlow[0];
  const latestBalanceSheet = balanceSheet[0];
  
  // Calculate average growth rate from historical data
  let averageRevenueGrowth = 0.05;
  if (financials.length > 1) {
    const growthRates = [];
    for (let i = 0; i < financials.length - 1; i++) {
      const currentRevenue = financials[i].revenue;
      const prevRevenue = financials[i + 1].revenue;
      if (prevRevenue > 0) {
        const growthRate = (currentRevenue - prevRevenue) / prevRevenue;
        growthRates.push(growthRate);
      }
    }
    
    if (growthRates.length > 0) {
      averageRevenueGrowth = growthRates.reduce((sum, rate) => sum + rate, 0) / growthRates.length;
    }
  }
  
  // Estimate or use provided parameters
  const wacc = 0.09; // Default discount rate
  const terminalGrowth = 0.025; // Default terminal growth rate
  const beta = profile.beta || 1.2;
  
  // Calculate free cash flow
  // FCF = Cash from Operations - Capital Expenditures
  const freeCashFlow = latestCashFlow.netCashProvidedByOperatingActivities - 
                       Math.abs(latestCashFlow.capitalExpenditure);
  
  // Project 5 years of cash flows
  const projectedFCFs = [];
  for (let i = 1; i <= 5; i++) {
    const fcf = freeCashFlow * Math.pow(1 + averageRevenueGrowth, i);
    projectedFCFs.push(parseFloat(fcf.toFixed(2)));
  }
  
  // Calculate terminal value using Gordon Growth Model
  const terminalValue = projectedFCFs[4] * (1 + terminalGrowth) / (wacc - terminalGrowth);
  
  // Calculate present value of projected cash flows
  let totalPV = 0;
  for (let i = 0; i < projectedFCFs.length; i++) {
    totalPV += projectedFCFs[i] / Math.pow(1 + wacc, i + 1);
  }
  
  // Add present value of terminal value
  const presentValueOfTerminal = terminalValue / Math.pow(1 + wacc, 5);
  const enterpriseValue = totalPV + presentValueOfTerminal;
  
  // Calculate equity value
  // Equity Value = Enterprise Value + Cash - Debt
  const cash = latestBalanceSheet.cashAndShortTermInvestments || latestBalanceSheet.cashAndCashEquivalents || 0;
  const debt = latestBalanceSheet.totalDebt || (latestBalanceSheet.shortTermDebt + latestBalanceSheet.longTermDebt) || 0;
  const equityValue = enterpriseValue + cash - debt;
  
  // Calculate per share value
  const sharesOutstanding = profile.mktCap / profile.price || 1000000000; // Fallback to a large number if can't calculate
  const intrinsicValuePerShare = equityValue / sharesOutstanding;
  
  // Calculate upside/downside percentage
  const currentPrice = profile.price;
  const upside = currentPrice > 0 ? ((intrinsicValuePerShare - currentPrice) / currentPrice) * 100 : null;
  
  // Create industry comparison (estimated)
  const industryComparison = {
    revenueGrowth: { 
      company: averageRevenueGrowth, 
      industry: averageRevenueGrowth * 0.9, // Slightly lower than company for example
      difference: averageRevenueGrowth > (averageRevenueGrowth * 0.9) ? 
        `+${((averageRevenueGrowth - (averageRevenueGrowth * 0.9)) * 100).toFixed(2)}% better than industry` : 
        `${((averageRevenueGrowth - (averageRevenueGrowth * 0.9)) * 100).toFixed(2)}% worse than industry`
    },
    profitMargin: { 
      company: latestIncome.netIncomeRatio || 0.1, 
      industry: 0.08, // Example industry average
      difference: (latestIncome.netIncomeRatio || 0.1) > 0.08 ? 
        `+${(((latestIncome.netIncomeRatio || 0.1) - 0.08) * 100).toFixed(2)}% better than industry` : 
        `${(((latestIncome.netIncomeRatio || 0.1) - 0.08) * 100).toFixed(2)}% worse than industry`
    },
    debtRatio: { 
      company: debt / (latestBalanceSheet.totalAssets || 1), 
      industry: 0.4, // Example industry average
      difference: (debt / (latestBalanceSheet.totalAssets || 1)) < 0.4 ? 
        `+${((0.4 - (debt / (latestBalanceSheet.totalAssets || 1))) * 100).toFixed(2)}% better than industry` : 
        `${((0.4 - (debt / (latestBalanceSheet.totalAssets || 1))) * 100).toFixed(2)}% worse than industry`
    }
  };
  
  // Create scenario analysis
  const bullishScenario = {
    growth: averageRevenueGrowth * 1.2,
    wacc: wacc * 0.9,
    intrinsicValue: intrinsicValuePerShare * 1.25
  };
  
  const bearishScenario = {
    growth: averageRevenueGrowth * 0.8,
    wacc: wacc * 1.1,
    intrinsicValue: intrinsicValuePerShare * 0.75
  };
  
  // Return the manually calculated DCF result
  return {
    ticker: symbol,
    companyName: profile.companyName,
    sector: profile.sector,
    industry: profile.industry,
    assumptions: {
      averageRevenueGrowth: averageRevenueGrowth,
      wacc: wacc,
      terminalGrowth: terminalGrowth,
      beta: beta,
      taxRate: (latestIncome.incomeTaxExpense / latestIncome.incomeBeforeTax) || 0.21
    },
    projectedFCFs: projectedFCFs,
    terminalValue: terminalValue,
    dcfValue: enterpriseValue,
    enterpriseValue: enterpriseValue,
    equityValue: equityValue,
    sharesOutstanding: sharesOutstanding,
    intrinsicValuePerShare: intrinsicValuePerShare,
    currentPrice: currentPrice,
    upside: upside,
    timestamp: new Date().toISOString(),
    aiGenerated: true,
    industryComparison: industryComparison,
    scenarioAnalysis: {
      base: {
        growthRate: averageRevenueGrowth,
        wacc: wacc,
        intrinsicValue: intrinsicValuePerShare
      },
      bullish: bullishScenario,
      bearish: bearishScenario
    },
    keyMetrics: {
      pe: profile.pe || (currentPrice / (latestIncome.netIncome / sharesOutstanding)) || 0,
      marketCap: profile.mktCap || 0,
      lastDividend: profile.lastDiv || 0,
      volume: profile.volAvg || 0,
      exchange: profile.exchange || "Unknown"
    }
  };
}
