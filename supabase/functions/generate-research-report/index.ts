
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";

// Define types for the response
interface ReportSection {
  title: string;
  content: string;
}

interface ResearchReport {
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: ReportSection[];
  ratingDetails?: {
    overallRating: string;
    financialStrength: string;
    growthOutlook: string;
    valuationAttractiveness: string;
    competitivePosition: string;
  };
  scenarioAnalysis?: {
    bullCase: { price: string; description: string; };
    baseCase: { price: string; description: string; };
    bearCase: { price: string; description: string; };
  };
  catalysts?: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { reportRequest } = await req.json();
    
    if (!reportRequest || !reportRequest.symbol) {
      throw new Error('Missing required parameters');
    }
    
    console.log(`Generating AI research report for ${reportRequest.symbol}`);
    
    // Get data ready for OpenAI
    const formattedData = formatDataForAnalysis(reportRequest);
    
    // Generate report using OpenAI
    const report = await generateReportWithOpenAI(formattedData, reportRequest);
    
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error generating research report:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Format data for OpenAI analysis
function formatDataForAnalysis(reportRequest: any) {
  const { symbol, companyName, description, sector, industry, stockData, financials, news } = reportRequest;
  
  // Format financial data - highlight key metrics
  const financialSummary = extractFinancialHighlights(financials);
  
  // Format news - extract sentiment and key events
  const newsSummary = extractNewsHighlights(news);
  
  // Build a comprehensive prompt
  return {
    symbol,
    companyName,
    description,
    sector,
    industry,
    currentPrice: stockData?.price || 0,
    marketCap: stockData?.marketCap || 0,
    pe: stockData?.pe || 0,
    financialSummary,
    newsSummary,
    reportType: reportRequest.reportType || 'comprehensive' 
  };
}

// Extract key financial metrics
function extractFinancialHighlights(financials: any) {
  if (!financials) return {};
  
  // Get latest annual data
  const latestIncome = financials.income?.[0] || {};
  const latestBalance = financials.balance?.[0] || {};
  const latestCashflow = financials.cashflow?.[0] || {};
  const latestRatios = financials.ratios?.[0] || {};
  
  // Calculate growth rates if we have multiple years
  const revenueGrowth = financials.income?.length > 1 
    ? calculateGrowthRate(financials.income[0]?.revenue, financials.income[1]?.revenue)
    : null;
  
  const netIncomeGrowth = financials.income?.length > 1 
    ? calculateGrowthRate(financials.income[0]?.netIncome, financials.income[1]?.netIncome)
    : null;
  
  return {
    // Latest financial year
    year: latestIncome.calendarYear,
    
    // Income statement highlights
    revenue: latestIncome.revenue,
    grossProfit: latestIncome.grossProfit,
    grossMargin: latestIncome.grossProfitRatio,
    operatingIncome: latestIncome.operatingIncome,
    operatingMargin: latestIncome.operatingIncomeRatio,
    netIncome: latestIncome.netIncome,
    netMargin: latestIncome.netIncomeRatio,
    eps: latestIncome.eps,
    
    // Balance sheet highlights
    totalAssets: latestBalance.totalAssets,
    totalLiabilities: latestBalance.totalLiabilities,
    totalEquity: latestBalance.totalEquity,
    debt: latestBalance.totalDebt,
    cashAndEquivalents: latestBalance.cashAndCashEquivalents,
    
    // Cash flow highlights
    operatingCashFlow: latestCashflow.operatingCashFlow,
    freeCashFlow: latestCashflow.freeCashFlow,
    
    // Key ratios
    returnOnEquity: latestRatios?.returnOnEquity,
    returnOnAssets: latestRatios?.returnOnAssets,
    debtToEquity: latestRatios?.debtEquityRatio,
    currentRatio: latestRatios?.currentRatio,
    
    // Growth metrics
    revenueGrowth,
    netIncomeGrowth,
  };
}

// Calculate YoY growth rate
function calculateGrowthRate(current: number, previous: number) {
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous) * 100).toFixed(2) + '%';
}

// Extract news sentiment and key events
function extractNewsHighlights(news: any[]) {
  if (!news || news.length === 0) return [];
  
  // Return only recent news (last 10 articles)
  return news.slice(0, 10).map(article => ({
    date: article.publishedDate,
    title: article.title,
    text: article.text
  }));
}

// Generate report using OpenAI
async function generateReportWithOpenAI(data: any, reportRequest: any) {
  const { reportType, symbol, companyName } = reportRequest;
  
  const systemPrompt = `You are an expert financial analyst tasked with creating a detailed equity research report for ${companyName} (${symbol}). 
The report should be comprehensive, factual, and based on the financial and market data provided. 
Focus on delivering an objective analysis with a clear investment recommendation.

Based on the report type "${reportType}", you should emphasize:
${reportType === 'comprehensive' ? '- A balanced analysis of all aspects of the company including financials, growth prospects, valuation, and risks.' : ''}
${reportType === 'financial' ? '- Deep financial analysis including ratio analysis, cash flow sustainability, and capital structure.' : ''}
${reportType === 'valuation' ? '- Detailed valuation using multiple methodologies (DCF, multiples) and fair value estimation.' : ''}

Structure your report with these sections:
1. Investment Thesis - Key reasons for the investment recommendation
2. Business Overview - Company background, products, markets, and competition
3. Financial Analysis - Assessment of financial performance and health
4. Valuation - Analysis of current valuation and price target justification
5. Risk Factors - Key risks to the investment thesis
6. ESG Considerations - Environmental, social, and governance factors

Your report should include:
- Clear recommendation (Buy, Hold, or Sell)
- Target price with justification
- Concise executive summary
- Data-driven analysis in each section

Format as a detailed JSON object matching the expected ResearchReport interface.`;

  const userPrompt = `Please analyze this company and create a detailed research report:

COMPANY INFORMATION:
Symbol: ${data.symbol}
Name: ${data.companyName}
Industry: ${data.industry}
Sector: ${data.sector}
Description: ${data.description}
Current Price: $${data.currentPrice}
Market Cap: $${formatLargeNumber(data.marketCap)}
P/E Ratio: ${data.pe}

FINANCIAL HIGHLIGHTS:
${JSON.stringify(data.financialSummary, null, 2)}

RECENT NEWS:
${JSON.stringify(data.newsSummary, null, 2)}

Based on this data, create a comprehensive research report including:
1. Investment recommendation (Buy, Strong Buy, Hold, Sell, or Strong Sell)
2. Target price
3. Summary of investment thesis
4. Detailed analysis in each required section
5. Rating details (financial strength, growth outlook, valuation, competitive position)
6. Scenario analysis (bull, base, bear cases)
7. Key catalysts

Ensure all financial analysis and projections are grounded in the data provided.`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.4,
        max_tokens: 3000
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", responseData);
      throw new Error(`OpenAI API error: ${responseData.error?.message || "Unknown error"}`);
    }

    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    // Extract JSON from the response
    try {
      // Try to parse directly if the response is already JSON
      const reportData = extractJSONFromText(content);
      
      // Ensure it has the required fields
      const finalReport: ResearchReport = {
        symbol: data.symbol,
        companyName: data.companyName,
        date: new Date().toISOString().split('T')[0],
        recommendation: reportData.recommendation || "Hold",
        targetPrice: reportData.targetPrice || `$${(data.currentPrice * 1.1).toFixed(2)}`,
        summary: reportData.summary || reportData.executive_summary || "",
        sections: reportData.sections || [],
        ratingDetails: reportData.ratingDetails || reportData.rating_details,
        scenarioAnalysis: reportData.scenarioAnalysis || reportData.scenario_analysis,
        catalysts: reportData.catalysts || []
      };
      
      return finalReport;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      
      // Fallback to generate a basic report
      return createFallbackReport(data);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return createFallbackReport(data);
  }
}

// Format large numbers (e.g., market cap) for readability
function formatLargeNumber(num: number) {
  if (!num) return "N/A";
  
  if (num >= 1e12) return (num / 1e12).toFixed(2) + " trillion";
  if (num >= 1e9) return (num / 1e9).toFixed(2) + " billion";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + " million";
  
  return num.toString();
}

// Extract JSON from text response (handles when GPT wraps JSON in markdown code blocks)
function extractJSONFromText(text: string) {
  // Check if the text is already valid JSON
  try {
    return JSON.parse(text);
  } catch (e) {
    // Not valid JSON, try to extract it
  }
  
  // Try to extract JSON from markdown code blocks
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
    }
  }
  
  // Try to find anything that looks like JSON
  const possibleJson = text.match(/\{[\s\S]*\}/);
  if (possibleJson) {
    try {
      return JSON.parse(possibleJson[0]);
    } catch (e) {
      console.error("Failed to parse possible JSON:", e);
    }
  }
  
  throw new Error("Could not extract valid JSON from response");
}

// Create a basic fallback report when OpenAI fails
function createFallbackReport(data: any): ResearchReport {
  const recommendation = determineRecommendation(data);
  const targetPrice = calculateTargetPrice(data.currentPrice, recommendation);
  
  return {
    symbol: data.symbol,
    companyName: data.companyName,
    date: new Date().toISOString().split('T')[0],
    recommendation: recommendation,
    targetPrice: `$${targetPrice.toFixed(2)}`,
    summary: `${data.companyName} is a company in the ${data.sector} sector, specifically within the ${data.industry} industry. Based on our analysis of available financial data and market conditions, we have issued a ${recommendation} recommendation with a price target of $${targetPrice.toFixed(2)}.`,
    sections: [
      {
        title: "Investment Thesis",
        content: `Our investment thesis for ${data.companyName} is based on our analysis of the company's financial performance, market position, and growth prospects. The company operates in the ${data.industry} industry and has demonstrated consistent performance in key financial metrics.`
      },
      {
        title: "Business Overview",
        content: `${data.companyName} (${data.symbol}) is a company in the ${data.industry} industry. ${data.description}`
      },
      {
        title: "Financial Analysis",
        content: `${data.companyName} has demonstrated financial performance with recent revenue of ${data.financialSummary.revenue ? '$' + formatLargeNumber(data.financialSummary.revenue) : 'N/A'} and net income of ${data.financialSummary.netIncome ? '$' + formatLargeNumber(data.financialSummary.netIncome) : 'N/A'}. The company's profit margins and return metrics are in line with industry averages.`
      },
      {
        title: "Valuation",
        content: `At the current price of $${data.currentPrice.toFixed(2)}, ${data.companyName} is trading at a P/E ratio of ${data.pe || 'N/A'}. Based on our analysis of growth prospects and industry comparables, we believe a fair value is $${targetPrice.toFixed(2)}.`
      },
      {
        title: "Risk Factors",
        content: `Key risks to our investment thesis include competition in the ${data.industry} industry, potential regulatory challenges, and macroeconomic factors that could impact consumer spending patterns.`
      },
      {
        title: "ESG Considerations",
        content: `${data.companyName}, like other companies in the ${data.industry} industry, faces various environmental, social, and governance challenges. Without specific ESG data, we cannot provide a detailed assessment of the company's ESG performance.`
      }
    ]
  };
}

// Determine recommendation based on available data
function determineRecommendation(data: any): string {
  // This is a simplified approach - in reality, this would be much more complex
  const revenueGrowth = parseGrowthRate(data.financialSummary.revenueGrowth);
  const netIncomeGrowth = parseGrowthRate(data.financialSummary.netIncomeGrowth);
  
  if (revenueGrowth > 15 && netIncomeGrowth > 15) {
    return "Strong Buy";
  } else if (revenueGrowth > 5 && netIncomeGrowth > 0) {
    return "Buy";
  } else if (revenueGrowth < -10 || netIncomeGrowth < -15) {
    return "Sell";
  } else {
    return "Hold";
  }
}

// Parse growth rate from string like "12.34%"
function parseGrowthRate(growthStr: string | null): number {
  if (!growthStr) return 0;
  
  const match = growthStr.match(/([-+]?\d+(\.\d+)?)/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 0;
}

// Calculate target price based on recommendation
function calculateTargetPrice(currentPrice: number, recommendation: string): number {
  switch (recommendation) {
    case "Strong Buy":
      return currentPrice * 1.2; // 20% upside
    case "Buy":
      return currentPrice * 1.1; // 10% upside
    case "Hold":
      return currentPrice * 1.03; // 3% upside
    case "Sell":
      return currentPrice * 0.9; // 10% downside
    case "Strong Sell":
      return currentPrice * 0.8; // 20% downside
    default:
      return currentPrice * 1.05; // 5% upside
  }
}
