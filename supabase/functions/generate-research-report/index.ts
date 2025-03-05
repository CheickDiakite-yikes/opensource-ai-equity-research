import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';
import { API_BASE_URLS, OPENAI_MODELS, OPENAI_API_KEY } from '../_shared/constants.ts';

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";

// Define types for the response
interface ReportSection {
  title: string;
  content: string;
}

interface RatingDetails {
  overallRating: string;
  financialStrength: string;
  growthOutlook: string;
  valuationAttractiveness: string;
  competitivePosition: string;
  ratingScale?: string;
  ratingJustification?: string;
}

interface ScenarioAnalysis {
  bullCase: { 
    price: string; 
    description: string; 
    probability?: string;
    drivers?: string[];
  };
  baseCase: { 
    price: string; 
    description: string; 
    probability?: string;
    drivers?: string[];
  };
  bearCase: { 
    price: string; 
    description: string; 
    probability?: string;
    drivers?: string[];
  };
}

interface CatalystTimeline {
  shortTerm?: string[];
  mediumTerm?: string[];
  longTerm?: string[];
}

interface GrowthCatalysts {
  positive?: string[];
  negative?: string[];
  timeline?: CatalystTimeline;
}

interface ResearchReport {
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: ReportSection[];
  ratingDetails?: RatingDetails;
  scenarioAnalysis?: ScenarioAnalysis;
  catalysts?: GrowthCatalysts;
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
    
    // Make sure we have sections before returning
    if (!report.sections || report.sections.length === 0) {
      console.warn("No sections returned from OpenAI, adding default sections");
      report.sections = createDefaultSections(formattedData);
    }
    
    // Log the sections we're returning
    console.log(`Returning report with ${report.sections.length} sections: ${report.sections.map(s => s.title).join(', ')}`);
    
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

// Create default sections if OpenAI fails to generate them
function createDefaultSections(data: any): ReportSection[] {
  return [
    {
      title: "Investment Thesis",
      content: `${data.companyName} (${data.symbol}) operates in the ${data.industry || 'technology'} sector. Based on our analysis of the company's financials and market position, we suggest a cautious approach to investing in this stock.`
    },
    {
      title: "Business Overview",
      content: data.description || `${data.companyName} is a company operating in the ${data.sector || 'technology'} sector. The company's business model and operations are focused on its industry segment.`
    },
    {
      title: "Financial Analysis",
      content: `The company's financial health appears to be ${data.financialSummary.netIncomeGrowth?.includes('-') ? 'showing some challenges' : 'stable with growth opportunities'}. Revenue trends and profit margins should be monitored closely.`
    },
    {
      title: "Valuation",
      content: `At the current price of $${data.currentPrice.toFixed(2)}, the stock trades at a P/E ratio of ${data.pe || 'N/A'}.`
    },
    {
      title: "Risk Factors",
      content: "Key risks include competition in the industry, regulatory challenges, and macroeconomic factors that could impact consumer spending."
    }
  ];
}

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

Structure your report with these sections, providing detailed analysis in each:
1. Investment Thesis - Key reasons for the investment recommendation (at least 150 words)
2. Business Overview - Company background, products, markets, and competition (at least 150 words)
3. Financial Analysis - Assessment of financial performance and health (at least 200 words)
4. Valuation - Analysis of current valuation and price target justification (at least 150 words)
5. Risk Factors - Key risks to the investment thesis (at least 150 words)
6. ESG Considerations - Environmental, social, and governance factors (at least 100 words)

Your report must include:
- Clear recommendation (Buy, Hold, or Sell)
- Target price with justification
- Concise executive summary
- Data-driven analysis in each section with specific metrics and figures
- Each section MUST have detailed content; this is extremely important

You MUST follow this output format precisely:
1. Use the exact ResearchReport interface structure required by the app
2. The 'ratingDetails' should include: overallRating, financialStrength, growthOutlook, valuationAttractiveness, competitivePosition, ratingScale, and ratingJustification
3. The 'scenarioAnalysis' must include bullCase, baseCase, and bearCase with: price, description, probability, and drivers fields
4. The 'catalysts' should include positive, negative, and a timeline with shortTerm, mediumTerm, and longTerm arrays
5. The 'sections' array is the most critical part - it must include all required sections with detailed content

Format as a detailed JSON object matching the interface structure.`;

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
4. Detailed analysis in each required section (at least 150-200 words per section)
5. Rating details:
   - overallRating, financialStrength, growthOutlook, valuationAttractiveness, competitivePosition
   - ratingScale (e.g., "1-5 with 5 being highest")
   - ratingJustification
6. Scenario analysis:
   - bullCase, baseCase, bearCase each with:
   - price (target price in each scenario)
   - description (brief explanation of the scenario)
   - probability (likelihood as percentage string)
   - drivers (array of key factors that would drive this scenario)
7. Growth catalysts:
   - positive (array of positive growth drivers)
   - negative (array of risks or negative factors)
   - timeline with shortTerm, mediumTerm, longTerm arrays

Ensure all financial analysis and projections are grounded in the data provided.`;

  try {
    console.log("Sending request to OpenAI for report generation...");
    
    const response = await fetch(API_BASE_URLS.OPENAI + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.DEFAULT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 3500
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

    console.log("Received response from OpenAI, processing...");

    try {
      const reportData = extractJSONFromText(content);
      
      console.log("Extracted JSON from OpenAI response, validating report structure...");
      console.log("Report has sections:", reportData.sections?.length || 0);
      
      const finalReport: ResearchReport = {
        symbol: data.symbol,
        companyName: data.companyName,
        date: new Date().toISOString().split('T')[0],
        recommendation: reportData.recommendation || "Hold",
        targetPrice: reportData.targetPrice || `$${(data.currentPrice * 1.1).toFixed(2)}`,
        summary: reportData.summary || reportData.executive_summary || "",
        sections: reportData.sections && reportData.sections.length > 0 
          ? reportData.sections.map(section => ({
              title: section.title || "Analysis",
              content: section.content || "Content unavailable"
            }))
          : createDefaultSections(data),
        
        ratingDetails: reportData.ratingDetails ? {
          overallRating: reportData.ratingDetails.overallRating || "Neutral",
          financialStrength: reportData.ratingDetails.financialStrength || "Adequate",
          growthOutlook: reportData.ratingDetails.growthOutlook || "Stable",
          valuationAttractiveness: reportData.ratingDetails.valuationAttractiveness || "Fair",
          competitivePosition: reportData.ratingDetails.competitivePosition || "Average",
          ratingScale: reportData.ratingDetails.ratingScale || "1-5 scale (5 is highest)",
          ratingJustification: reportData.ratingDetails.ratingJustification || ""
        } : undefined,
        
        scenarioAnalysis: reportData.scenarioAnalysis ? {
          bullCase: {
            price: reportData.scenarioAnalysis.bullCase?.price || `$${(data.currentPrice * 1.2).toFixed(2)}`,
            description: reportData.scenarioAnalysis.bullCase?.description || "Optimistic scenario",
            probability: reportData.scenarioAnalysis.bullCase?.probability || "25%",
            drivers: reportData.scenarioAnalysis.bullCase?.drivers || []
          },
          baseCase: {
            price: reportData.scenarioAnalysis.baseCase?.price || `$${(data.currentPrice * 1.05).toFixed(2)}`,
            description: reportData.scenarioAnalysis.baseCase?.description || "Most likely scenario",
            probability: reportData.scenarioAnalysis.baseCase?.probability || "50%",
            drivers: reportData.scenarioAnalysis.baseCase?.drivers || []
          },
          bearCase: {
            price: reportData.scenarioAnalysis.bearCase?.price || `$${(data.currentPrice * 0.9).toFixed(2)}`,
            description: reportData.scenarioAnalysis.bearCase?.description || "Pessimistic scenario",
            probability: reportData.scenarioAnalysis.bearCase?.probability || "25%",
            drivers: reportData.scenarioAnalysis.bearCase?.drivers || []
          }
        } : undefined,
        
        catalysts: reportData.catalysts ? {
          positive: reportData.catalysts.positive || [],
          negative: reportData.catalysts.negative || [],
          timeline: reportData.catalysts.timeline ? {
            shortTerm: reportData.catalysts.timeline.shortTerm || [],
            mediumTerm: reportData.catalysts.timeline.mediumTerm || [],
            longTerm: reportData.catalysts.timeline.longTerm || []
          } : undefined
        } : undefined
      };
      
      return finalReport;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      
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
  try {
    return JSON.parse(text);
  } catch (e) {
  }
  
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
    }
  }
  
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
    sections: createDefaultSections(data),
    ratingDetails: {
      overallRating: "Neutral",
      financialStrength: "Adequate",
      growthOutlook: "Stable",
      valuationAttractiveness: "Fair",
      competitivePosition: "Average",
      ratingScale: "1-5 scale (5 is highest)",
      ratingJustification: "This rating is based on a balanced assessment of the company's financial position, market opportunity, and competitive landscape."
    },
    scenarioAnalysis: {
      bullCase: {
        price: `$${(targetPrice * 1.2).toFixed(2)}`,
        description: "In an optimistic scenario, the company exceeds growth expectations.",
        probability: "25%",
        drivers: ["Market expansion", "Margin improvement", "New product success"]
      },
      baseCase: {
        price: `$${targetPrice.toFixed(2)}`,
        description: "Our base case assumes steady growth in line with the sector average.",
        probability: "50%",
        drivers: ["Continued market presence", "Stable margins", "Moderate growth"]
      },
      bearCase: {
        price: `$${(targetPrice * 0.8).toFixed(2)}`,
        description: "In a pessimistic scenario, the company faces increased competition and margin pressure.",
        probability: "25%",
        drivers: ["Competitive pressure", "Margin erosion", "Slowing growth"]
      }
    },
    catalysts: {
      positive: ["Industry growth", "Cost optimization", "Innovation potential"],
      negative: ["Competitive threats", "Regulatory changes", "Economic slowdown"],
      timeline: {
        shortTerm: ["Quarterly earnings", "Product launches"],
        mediumTerm: ["Market expansion", "Margin improvement initiatives"],
        longTerm: ["Industry consolidation", "Long-term strategic goals"]
      }
    }
  };
}

// Determine recommendation based on available data
function determineRecommendation(data: any): string {
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
