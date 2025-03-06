
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Configuration and environment variables
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
const FMP_API_KEY = Deno.env.get("FMP_API_KEY") || "";

// Types and interfaces
interface IncomeStatement {
  date: string;
  revenue: number;
  netIncome: number;
  [key: string]: any; // Additional fields from FMP
}

interface AiAssumptions {
  averageRevenueGrowth: number; // e.g., 0.05 for 5%
  wacc: number;                // e.g., 0.10 for 10%
  terminalGrowth: number;      // e.g., 0.02 for 2%
}

interface DcfResult {
  projectedFCFs: number[];
  terminalValue: number;
  dcfValue: number;
  enterpriseValue: number;
  equityValue: number;
  sharesOutstanding: number;
  intrinsicValuePerShare: number;
  currentPrice: number | null;
  upside: number | null;
}

interface AutoDCFResult extends DcfResult {
  ticker: string;
  assumptions: AiAssumptions;
  timestamp: string;
  aiGenerated: boolean;
}

/**
 * Fetch historical financial data from FMP
 */
async function getFinancialData(ticker: string): Promise<IncomeStatement[]> {
  const upperTicker = ticker.toUpperCase().trim();
  console.log(`Fetching financial data for ${upperTicker}`);
  
  const incomeStmtUrl = `https://financialmodelingprep.com/api/v3/income-statement/${upperTicker}?limit=5&apikey=${FMP_API_KEY}`;

  const response = await fetch(incomeStmtUrl);
  if (!response.ok) {
    console.error(`FMP API error (${response.status}): ${await response.text()}`);
    throw new Error(`Failed to fetch data from FMP for ${upperTicker}`);
  }

  const incomeStatements: IncomeStatement[] = await response.json();
  if (!incomeStatements || !incomeStatements.length) {
    throw new Error(`No income statement data returned from FMP for ${upperTicker}.`);
  }

  console.log(`Retrieved ${incomeStatements.length} income statements for ${upperTicker}`);
  return incomeStatements; // Array of income statements (most recent first)
}

/**
 * Get current price data for the ticker
 */
async function getCurrentPrice(ticker: string): Promise<number | null> {
  const upperTicker = ticker.toUpperCase().trim();
  try {
    const quoteUrl = `https://financialmodelingprep.com/api/v3/quote/${upperTicker}?apikey=${FMP_API_KEY}`;
    
    const response = await fetch(quoteUrl);
    if (!response.ok) {
      console.warn(`Could not fetch current price for ${upperTicker}`);
      return null;
    }
    
    const quoteData = await response.json();
    if (Array.isArray(quoteData) && quoteData.length > 0) {
      return quoteData[0].price || null;
    }
    return null;
  } catch (error) {
    console.warn(`Error fetching price for ${upperTicker}:`, error);
    return null;
  }
}

/**
 * Get shares outstanding for the ticker
 */
async function getSharesOutstanding(ticker: string): Promise<number> {
  const upperTicker = ticker.toUpperCase().trim();
  try {
    const profileUrl = `https://financialmodelingprep.com/api/v3/profile/${upperTicker}?apikey=${FMP_API_KEY}`;
    
    const response = await fetch(profileUrl);
    if (!response.ok) {
      console.warn(`Could not fetch profile for ${upperTicker}`);
      return 1; // Default value if we can't get real data
    }
    
    const profileData = await response.json();
    if (Array.isArray(profileData) && profileData.length > 0) {
      return profileData[0].mktCap / profileData[0].price || 1;
    }
    return 1;
  } catch (error) {
    console.warn(`Error fetching profile for ${upperTicker}:`, error);
    return 1;
  }
}

/**
 * Get enterprise value and net debt
 */
async function getEnterpriseValue(ticker: string): Promise<{enterpriseValue: number, netDebt: number}> {
  const upperTicker = ticker.toUpperCase().trim();
  try {
    const evUrl = `https://financialmodelingprep.com/api/v3/enterprise-values/${upperTicker}?limit=1&apikey=${FMP_API_KEY}`;
    
    const response = await fetch(evUrl);
    if (!response.ok) {
      console.warn(`Could not fetch enterprise value for ${upperTicker}`);
      return { enterpriseValue: 0, netDebt: 0 };
    }
    
    const evData = await response.json();
    if (Array.isArray(evData) && evData.length > 0) {
      return { 
        enterpriseValue: evData[0].enterpriseValue || 0,
        netDebt: (evData[0].netDebt || 0)
      };
    }
    return { enterpriseValue: 0, netDebt: 0 };
  } catch (error) {
    console.warn(`Error fetching enterprise value for ${upperTicker}:`, error);
    return { enterpriseValue: 0, netDebt: 0 };
  }
}

/**
 * Generate DCF assumptions using OpenAI
 */
async function getAiAssumptions(incomeStatements: IncomeStatement[], ticker: string): Promise<AiAssumptions> {
  try {
    console.log(`Generating AI assumptions for ${ticker}`);
    
    // Build a simplified prompt with the historical revenues
    const revenueData = incomeStatements.map((stmt) => ({
      date: stmt.date,
      revenue: stmt.revenue,
      netIncome: stmt.netIncome
    }));

    const prompt = `
      I have the following historical financial data for ${ticker}:
      ${JSON.stringify(revenueData, null, 2)}

      Please provide reasonable DCF assumptions for:
      1. averageRevenueGrowth (annual percentage as decimal, e.g., 0.05 for 5%)
      2. wacc (weighted average cost of capital as decimal, e.g., 0.10 for 10%)
      3. terminalGrowth (long-term growth rate as decimal, e.g., 0.02 for 2%)

      Return your answer in valid JSON only, with the following keys:
      {
        "averageRevenueGrowth": <number>,
        "wacc": <number>,
        "terminalGrowth": <number>
      }
    `;

    // Call OpenAI's API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${await response.text()}`);
    }

    const apiResponse = await response.json();
    const content = apiResponse.choices?.[0]?.message?.content?.trim() || "";
    
    console.log(`AI response for ${ticker}:`, content);
    
    let parsed: Partial<AiAssumptions>;

    try {
      parsed = JSON.parse(content);
    } catch (err) {
      console.warn(`Failed to parse AI response as JSON for ${ticker}. Falling back to defaults.`);
      // Fallback assumptions
      parsed = {
        averageRevenueGrowth: 0.05,
        wacc: 0.1,
        terminalGrowth: 0.02,
      };
    }

    // Validate or clamp values
    const averageRevenueGrowth = clamp(parsed.averageRevenueGrowth ?? 0.05, 0, 0.30);
    const wacc = clamp(parsed.wacc ?? 0.1, 0.05, 0.20);
    const terminalGrowth = clamp(parsed.terminalGrowth ?? 0.02, 0, 0.04);

    return { averageRevenueGrowth, wacc, terminalGrowth };
  } catch (error) {
    console.error(`Error generating AI assumptions for ${ticker}:`, error);
    // Return default assumptions
    return {
      averageRevenueGrowth: 0.05,
      wacc: 0.1,
      terminalGrowth: 0.02,
    };
  }
}

/**
 * Helper function to clamp a number between min and max.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Calculate historical FCF from income statement
 */
function calculateHistoricalFCF(incomeStatement: IncomeStatement): number {
  const netIncome = incomeStatement.netIncome || 0;
  // For a more accurate FCF, we would account for:
  // + Depreciation & Amortization
  // - Capital Expenditures
  // - Changes in Working Capital
  // This is a simplified approximation:
  return netIncome * 0.85; // 85% of net income as free cash flow
}

/**
 * Project FCF and calculate a 5-year DCF
 */
function calculateDCF(
  assumptions: AiAssumptions, 
  recentFCF: number,
  netDebt: number,
  sharesOutstanding: number,
  currentPrice: number | null
): DcfResult {
  const { averageRevenueGrowth, wacc, terminalGrowth } = assumptions;
  const projectionYears = 5;
  const projectedFCFs: number[] = [];

  let currentFCF = recentFCF;
  for (let t = 1; t <= projectionYears; t++) {
    currentFCF *= (1 + averageRevenueGrowth);
    projectedFCFs.push(currentFCF);
  }

  // Terminal Value (Gordon Growth)
  const lastYearFCF = projectedFCFs[projectionYears - 1];
  const terminalValue = (lastYearFCF * (1 + terminalGrowth)) / (wacc - terminalGrowth);

  // Discount each projected FCF + terminal value
  let dcfValue = 0;
  for (let t = 1; t <= projectionYears; t++) {
    const discountFactor = Math.pow(1 + wacc, t);
    dcfValue += projectedFCFs[t - 1] / discountFactor;

    if (t === projectionYears) {
      // Add terminal value discounted back
      dcfValue += terminalValue / discountFactor;
    }
  }

  // Enterprise Value = PV of FCFs + PV of Terminal Value
  const enterpriseValue = dcfValue;
  
  // Equity Value = Enterprise Value - Net Debt
  const equityValue = enterpriseValue - netDebt;
  
  // Intrinsic Value per Share
  const intrinsicValuePerShare = equityValue / sharesOutstanding;
  
  // Calculate upside if current price is available
  const upside = currentPrice ? ((intrinsicValuePerShare / currentPrice) - 1) * 100 : null;

  return {
    projectedFCFs,
    terminalValue,
    dcfValue,
    enterpriseValue,
    equityValue,
    sharesOutstanding,
    intrinsicValuePerShare,
    currentPrice,
    upside
  };
}

/**
 * Main DCF orchestrator
 */
async function autoDCF(ticker: string): Promise<AutoDCFResult> {
  if (!ticker || typeof ticker !== 'string' || ticker.trim() === '') {
    throw new Error("A valid ticker symbol is required");
  }
  
  const upperTicker = ticker.toUpperCase().trim();
  console.log(`Starting DCF calculation for ${upperTicker}`);
  
  try {
    // Step 1: Fetch historical financial data
    const incomeStatements = await getFinancialData(upperTicker);
    
    // Step 2: Get current price and shares outstanding in parallel
    const [currentPrice, { enterpriseValue, netDebt }, sharesOutstandingValue] = await Promise.all([
      getCurrentPrice(upperTicker),
      getEnterpriseValue(upperTicker),
      getSharesOutstanding(upperTicker)
    ]);
    
    // Step 3: Generate assumptions with AI
    const aiAssumptions = await getAiAssumptions(incomeStatements, upperTicker);
    
    // Step 4: Use the most recent statement to get base FCF
    const mostRecentStmt = incomeStatements[0];
    const recentFCF = calculateHistoricalFCF(mostRecentStmt);
    
    // Step 5: Calculate DCF
    const dcfResults = calculateDCF(
      aiAssumptions, 
      recentFCF, 
      netDebt,
      sharesOutstandingValue,
      currentPrice
    );
    
    // Step 6: Prepare and return the full result
    const result: AutoDCFResult = {
      ticker: upperTicker,
      assumptions: aiAssumptions,
      timestamp: new Date().toISOString(),
      aiGenerated: true,
      ...dcfResults
    };
    
    console.log(`Successfully calculated DCF for ${upperTicker}`);
    return result;
  } catch (error) {
    console.error(`Error in autoDCF for ${upperTicker}:`, error);
    throw error;
  }
}

/**
 * Supabase Edge Function handler
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get ticker from URL or request body
    const url = new URL(req.url);
    let ticker = url.searchParams.get("symbol") || url.searchParams.get("ticker");
    
    // If not in URL params, try to get from request body
    if (!ticker && req.method === "POST") {
      try {
        const body = await req.json();
        ticker = body.symbol || body.ticker;
      } catch (error) {
        console.error("Error parsing request body:", error);
      }
    }
    
    // Validate ticker
    if (!ticker) {
      console.error("No ticker symbol provided in request");
      return new Response(
        JSON.stringify({ 
          error: "No ticker symbol provided",
          details: "Please provide a valid 'symbol' or 'ticker' parameter"
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    console.log(`Received DCF request for symbol: ${ticker}`);
    
    // Calculate DCF
    const result = await autoDCF(ticker);
    
    // Return the result
    return new Response(
      JSON.stringify(result),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in AI-DCF function:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : "No details available"
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
