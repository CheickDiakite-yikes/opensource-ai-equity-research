
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Sample market data to use for calculations if not provided
const DEFAULT_MARKET_DATA = {
  price: 232.8,
  dilutedSharesOutstanding: 15408095000,
  totalDebt: 106629000000,
  totalEquity: 3587004516000,
  netDebt: 76686000000,
  currentRevenue: 383285000000
};

/**
 * Edge function to calculate custom DCF based on user parameters
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { symbol, params } = await req.json();
    
    console.log(`Calculating custom DCF for ${symbol} with params:`, params);
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Validate and extract parameters with defaults
    const dcfParams = {
      // Growth parameters
      revenueGrowthPct: params.revenueGrowthPct || 0.1094,
      ebitdaPct: params.ebitdaPct || 0.3127,
      ebitPct: params.ebitPct || 0.2781,
      taxRate: params.taxRate || 0.2409,
      
      // Capital and investment params
      capitalExpenditurePct: params.capitalExpenditurePct || 0.0306,
      depreciationAndAmortizationPct: params.depreciationAndAmortizationPct || 0.0345,
      
      // Working capital params
      cashAndShortTermInvestmentsPct: params.cashAndShortTermInvestmentsPct || 0.2344,
      receivablesPct: params.receivablesPct || 0.1533,
      inventoriesPct: params.inventoriesPct || 0.0155,
      payablesPct: params.payablesPct || 0.1614,
      
      // Cash flow params
      operatingCashFlowPct: params.operatingCashFlowPct || 0.2886,
      sellingGeneralAndAdministrativeExpensesPct: params.sellingGeneralAndAdministrativeExpensesPct || 0.0662,
      
      // Cost of capital params (in decimal form, so 4% = 0.04)
      longTermGrowthRate: params.longTermGrowthRate || 0.04,
      costOfEquity: params.costOfEquity || 0.0951,
      costOfDebt: params.costOfDebt || 0.0364,
      riskFreeRate: params.riskFreeRate || 0.0364,
      marketRiskPremium: params.marketRiskPremium || 0.0472,
      beta: params.beta || 1.244
    };
    
    // Get any additional market data if available
    const marketData = {
      ...DEFAULT_MARKET_DATA,
      ...(params.marketData || {})
    };
    
    // Calculate DCF model
    const dcfResults = calculateCustomDCF(symbol, dcfParams, marketData);
    
    console.log(`DCF calculation complete, returning ${dcfResults.length} years of projections`);
    
    return new Response(
      JSON.stringify(dcfResults),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error calculating custom DCF:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

/**
 * Calculate DCF model based on input parameters
 */
function calculateCustomDCF(symbol: string, params: any, marketData: any) {
  const result = [];
  const PROJECTION_YEARS = 7; // Current year + 6 future years
  
  // Historical years (2-3 years back) for reference
  const historicalYears = 2;
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - historicalYears;
  const price = marketData.price;
  
  // Base financial data 
  const baseRevenue = marketData.currentRevenue;  
  const dilutedSharesOutstanding = marketData.dilutedSharesOutstanding;
  const totalDebt = marketData.totalDebt;
  const totalEquity = marketData.totalEquity;
  const totalCapital = totalDebt + totalEquity;
  const netDebt = marketData.netDebt;
  
  // Calculate weightings
  const debtWeighting = (totalDebt / totalCapital) * 100;
  const equityWeighting = (totalEquity / totalCapital) * 100;
  
  // Calculate after-tax cost of debt
  const afterTaxCostOfDebt = params.costOfDebt * (1 - params.taxRate);
  
  // Calculate WACC
  const wacc = (params.costOfEquity * (equityWeighting / 100)) + 
               (afterTaxCostOfDebt * (debtWeighting / 100));
  
  // Project financials for each year
  for (let i = 0; i < PROJECTION_YEARS; i++) {
    const year = (startYear + i).toString();
    const isHistorical = i < historicalYears;
    const isCurrentYear = year === currentYear.toString();
    
    // Growth rates vary based on historical/future
    const revenueGrowthRate = isHistorical ? (Math.random() * 0.1) - 0.05 : params.revenueGrowthPct;
    
    // Calculate financial metrics for the current year
    const previousYearRevenue = i === 0 ? baseRevenue / (1 + revenueGrowthRate) : result[i - 1].revenue;
    const revenue = isHistorical ? 
      previousYearRevenue * (1 + revenueGrowthRate) : 
      previousYearRevenue * (1 + params.revenueGrowthPct);
    
    // Calculate EBIT and EBITDA
    const ebit = revenue * params.ebitPct;
    const ebitda = revenue * params.ebitdaPct;
    
    // Capital expenditure (negative for cash outflow)
    const capitalExpenditure = -1 * revenue * params.capitalExpenditurePct;
    
    // Operating cash flow
    const operatingCashFlow = revenue * params.operatingCashFlowPct;
    
    // Free cash flow
    const freeCashFlow = operatingCashFlow + capitalExpenditure;
    
    // For terminal year (last projection year)
    if (i === PROJECTION_YEARS - 1) {
      // Terminal value calculation (Gordon Growth Model)
      const freeCashFlowT1 = freeCashFlow * (1 + params.longTermGrowthRate);
      const terminalValue = freeCashFlowT1 / (wacc - params.longTermGrowthRate);
      
      // Present value calculations
      const discountFactor = Math.pow(1 + wacc, PROJECTION_YEARS - historicalYears);
      const presentTerminalValue = terminalValue / discountFactor;
      
      // Calculate sum of present values of prior years' free cash flows
      let sumPvLfcf = 0;
      for (let j = historicalYears; j < PROJECTION_YEARS - 1; j++) {
        const yearsSincePresent = j - historicalYears + 1;
        const pvFcf = result[j].freeCashFlow / Math.pow(1 + wacc, yearsSincePresent);
        sumPvLfcf += pvFcf;
      }
      
      // Add PV of current year's FCF
      const pvCurrentFcf = freeCashFlow / discountFactor;
      
      // Enterprise value 
      const enterpriseValue = presentTerminalValue + sumPvLfcf + pvCurrentFcf;
      
      // Equity value
      const equityValue = enterpriseValue - netDebt;
      
      // Per share value
      const equityValuePerShare = equityValue / dilutedSharesOutstanding;
      
      // Create the DCF result object for this year
      result.push({
        year,
        symbol,
        revenue,
        revenuePercentage: revenueGrowthRate * 100,
        ebitda,
        ebitdaPercentage: params.ebitdaPct * 100,
        ebit,
        ebitPercentage: params.ebitPct * 100,
        capitalExpenditure: Math.abs(capitalExpenditure), // Convert to positive for display
        capitalExpenditurePercentage: params.capitalExpenditurePct * 100,
        price,
        beta: params.beta,
        dilutedSharesOutstanding,
        costofDebt: params.costOfDebt * 100, // Convert decimal to percentage
        taxRate: params.taxRate * 100, // Convert decimal to percentage
        afterTaxCostOfDebt: afterTaxCostOfDebt * 100, // Convert decimal to percentage
        riskFreeRate: params.riskFreeRate * 100, // Convert decimal to percentage
        marketRiskPremium: params.marketRiskPremium * 100, // Convert decimal to percentage
        costOfEquity: params.costOfEquity * 100, // Convert decimal to percentage
        totalDebt,
        totalEquity,
        totalCapital,
        debtWeighting,
        equityWeighting,
        wacc: wacc * 100, // Convert decimal to percentage
        operatingCashFlow,
        pvLfcf: pvCurrentFcf,
        sumPvLfcf,
        longTermGrowthRate: params.longTermGrowthRate * 100, // Convert decimal to percentage
        freeCashFlow,
        freeCashFlowT1,
        terminalValue,
        presentTerminalValue,
        enterpriseValue,
        netDebt,
        equityValue,
        equityValuePerShare,
        operatingCashFlowPercentage: params.operatingCashFlowPct * 100 // Convert decimal to percentage
      });
    } else {
      // For non-terminal years, calculate simpler metrics
      result.push({
        year,
        symbol,
        revenue,
        revenuePercentage: revenueGrowthRate * 100,
        ebitda,
        ebitdaPercentage: params.ebitdaPct * 100,
        ebit,
        ebitPercentage: params.ebitPct * 100,
        capitalExpenditure: Math.abs(capitalExpenditure), // Convert to positive for display
        capitalExpenditurePercentage: params.capitalExpenditurePct * 100,
        price,
        beta: params.beta,
        dilutedSharesOutstanding,
        costofDebt: params.costOfDebt * 100, // Convert decimal to percentage
        taxRate: params.taxRate * 100, // Convert decimal to percentage
        afterTaxCostOfDebt: afterTaxCostOfDebt * 100, // Convert decimal to percentage
        riskFreeRate: params.riskFreeRate * 100, // Convert decimal to percentage
        marketRiskPremium: params.marketRiskPremium * 100, // Convert decimal to percentage
        costOfEquity: params.costOfEquity * 100, // Convert decimal to percentage
        totalDebt,
        totalEquity,
        totalCapital,
        debtWeighting,
        equityWeighting,
        wacc: wacc * 100, // Convert decimal to percentage
        operatingCashFlow,
        freeCashFlow,
        operatingCashFlowPercentage: params.operatingCashFlowPct * 100 // Convert decimal to percentage
      });
    }
  }
  
  return result.reverse(); // Latest year first
}
