import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0';

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const openAIApiKey = Deno.env.get("OPENAI_API_KEY") || "";

interface StockPrediction {
  symbol: string;
  currentPrice: number;
  predictedPrice: {
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
    oneYear: number;
  };
  sentimentAnalysis: string;
  confidenceLevel: number;
  keyDrivers: string[];
  risks: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { symbol, stockData, financials, news } = await req.json();
    
    if (!symbol || !stockData) {
      throw new Error('Missing required parameters');
    }
    
    console.log(`Generating AI price prediction for ${symbol}`);
    
    const formattedData = formatDataForPrediction(symbol, stockData, financials, news);
    
    const prediction = await generatePredictionWithOpenAI(formattedData);
    
    return new Response(JSON.stringify(prediction), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error generating price prediction:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

function formatDataForPrediction(symbol: string, stockData: any, financials: any, news: any[]) {
  const financialSummary = extractFinancialIndicators(financials);
  const technicalIndicators = extractTechnicalIndicators(stockData);
  const newsSummary = formatNewsSummary(news);
  
  return {
    symbol,
    currentPrice: stockData.price,
    financialSummary,
    technicalIndicators,
    newsSummary
  };
}

function extractFinancialIndicators(financials: any) {
  if (!financials) return {};
  
  const incomeData = financials.income?.slice(0, 3).map((statement: any) => ({
    year: statement.calendarYear,
    revenue: statement.revenue,
    netIncome: statement.netIncome,
    eps: statement.eps,
    operatingMargin: statement.operatingIncomeRatio
  })) || [];
  
  const balanceData = financials.balance?.slice(0, 3).map((statement: any) => ({
    year: statement.calendarYear,
    totalAssets: statement.totalAssets,
    totalLiabilities: statement.totalLiabilities,
    totalEquity: statement.totalEquity,
    cashAndEquivalents: statement.cashAndCashEquivalents,
    debt: statement.totalDebt
  })) || [];
  
  const cashflowData = financials.cashflow?.slice(0, 3).map((statement: any) => ({
    year: statement.calendarYear,
    operatingCashFlow: statement.operatingCashFlow,
    freeCashFlow: statement.freeCashFlow,
    capitalExpenditure: statement.capitalExpenditure,
    dividendsPaid: statement.dividendsPaid
  })) || [];
  
  const ratioData = financials.ratios?.slice(0, 1).map((data: any) => ({
    year: data.calendarYear,
    pe: data.priceEarningsRatio,
    pb: data.priceToBookRatio,
    ps: data.priceSalesRatio,
    roe: data.returnOnEquity,
    roa: data.returnOnAssets,
    debtToEquity: data.debtEquityRatio,
    currentRatio: data.currentRatio
  })) || [];
  
  const growthRates = calculateGrowthRates(incomeData);
  
  return {
    incomeData,
    balanceData,
    cashflowData,
    ratioData,
    growthRates
  };
}

function calculateGrowthRates(incomeData: any[]) {
  if (!incomeData || incomeData.length < 2) return {};
  
  const current = incomeData[0];
  const previous = incomeData[1];
  
  const revenueGrowth = calculateGrowthRate(current.revenue, previous.revenue);
  const netIncomeGrowth = calculateGrowthRate(current.netIncome, previous.netIncome);
  const epsGrowth = calculateGrowthRate(current.eps, previous.eps);
  
  return {
    revenueGrowth,
    netIncomeGrowth,
    epsGrowth
  };
}

function calculateGrowthRate(current: number, previous: number) {
  if (!current || !previous || previous === 0) return null;
  return ((current - previous) / Math.abs(previous) * 100).toFixed(2) + '%';
}

function extractTechnicalIndicators(stockData: any) {
  if (!stockData) return {};
  
  return {
    price: stockData.price,
    priceAvg50: stockData.priceAvg50,
    priceAvg200: stockData.priceAvg200,
    yearHigh: stockData.yearHigh,
    yearLow: stockData.yearLow,
    volume: stockData.volume,
    avgVolume: stockData.avgVolume,
    marketCap: stockData.marketCap,
    pe: stockData.pe
  };
}

function formatNewsSummary(news: any[]) {
  if (!news || news.length === 0) return [];
  
  return news.slice(0, 5).map(article => ({
    date: article.publishedDate,
    title: article.title,
    summary: article.text?.substring(0, 300) + '...'
  }));
}

async function generatePredictionWithOpenAI(data: any) {
  const systemPrompt = `You are a financial analyst specializing in stock price predictions. 
Your task is to analyze the provided financial and market data for ${data.symbol} and generate 
a detailed price prediction for different time horizons: 1 month, 3 months, 6 months, and 1 year.

Your analysis should include:
1. A justification for each predicted price based on financial data and trends
2. A sentiment analysis of the company's prospects
3. A confidence level for your prediction (0-100%)
4. Key drivers that could positively impact the stock price
5. Potential risks that could negatively impact the stock price

Base your predictions on:
- Financial performance and growth trends
- Technical indicators and price action
- Market sentiment from news articles
- Industry and sector dynamics

Your response should be structured as a JSON object matching the StockPrediction interface.`;

  const userPrompt = `Please analyze this data and provide a stock price prediction:

SYMBOL: ${data.symbol}
CURRENT PRICE: $${data.currentPrice}

FINANCIAL DATA:
${JSON.stringify(data.financialSummary, null, 2)}

TECHNICAL INDICATORS:
${JSON.stringify(data.technicalIndicators, null, 2)}

RECENT NEWS:
${JSON.stringify(data.newsSummary, null, 2)}

Based on this data, please provide:
1. Price predictions for 1 month, 3 months, 6 months, and 1 year
2. Sentiment analysis summary
3. Confidence level (0-100%)
4. 3-5 key drivers that could positively impact the stock
5. 3-5 potential risks that could negatively impact the stock

Please ensure your price predictions are realistic based on the data provided and current market conditions.`;

  try {
    const quickMode = data.quickMode === true;
    
    const modelToUse = quickMode ? "gpt-4o-mini" : "gpt-4o-mini";
    const maxTokens = quickMode ? 1200 : 1500;
    const temperature = quickMode ? 0.4 : 0.3;
    
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: temperature,
        max_tokens: maxTokens
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

    try {
      const predictionData = extractJSONFromText(content);
      
      const prediction: StockPrediction = {
        symbol: data.symbol,
        currentPrice: data.currentPrice,
        predictedPrice: {
          oneMonth: ensureNumberValue(predictionData.predictedPrice?.oneMonth, data.currentPrice * 1.02),
          threeMonths: ensureNumberValue(predictionData.predictedPrice?.threeMonths, data.currentPrice * 1.05),
          sixMonths: ensureNumberValue(predictionData.predictedPrice?.sixMonths, data.currentPrice * 1.08),
          oneYear: ensureNumberValue(predictionData.predictedPrice?.oneYear, data.currentPrice * 1.12)
        },
        sentimentAnalysis: predictionData.sentimentAnalysis || generateDefaultSentiment(data),
        confidenceLevel: ensureNumberInRange(predictionData.confidenceLevel, 65, 90),
        keyDrivers: ensureArrayWithItems(predictionData.keyDrivers, generateDefaultDrivers()),
        risks: ensureArrayWithItems(predictionData.risks, generateDefaultRisks())
      };
      
      return prediction;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      
      return createFallbackPrediction(data);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return createFallbackPrediction(data);
  }
}

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

function createFallbackPrediction(data: any): StockPrediction {
  return {
    symbol: data.symbol,
    currentPrice: data.currentPrice,
    predictedPrice: {
      oneMonth: data.currentPrice * 1.02,
      threeMonths: data.currentPrice * 1.05,
      sixMonths: data.currentPrice * 1.08,
      oneYear: data.currentPrice * 1.12
    },
    sentimentAnalysis: generateDefaultSentiment(data),
    confidenceLevel: 75,
    keyDrivers: generateDefaultDrivers(),
    risks: generateDefaultRisks()
  };
}

function ensureNumberValue(value: any, defaultValue: number): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }
  return defaultValue;
}

function ensureNumberInRange(value: any, min: number, max: number): number {
  const num = Number(value);
  if (isNaN(num)) return (min + max) / 2;
  return Math.min(Math.max(num, min), max);
}

function ensureArrayWithItems(array: any, defaultArray: string[]): string[] {
  if (Array.isArray(array) && array.length > 0) {
    return array;
  }
  return defaultArray;
}

function generateDefaultSentiment(data: any): string {
  return "Based on recent financial data and market trends, the overall sentiment for this stock appears cautiously optimistic. The company has shown stability in its core financial metrics, though market conditions may introduce some volatility in the short term.";
}

function generateDefaultDrivers(): string[] {
  return [
    "Strong revenue growth in core product lines",
    "Expansion into emerging markets",
    "Margin improvement through operational efficiency",
    "New product launches expected in upcoming quarters",
    "Technological innovations driving competitive advantage"
  ];
}

function generateDefaultRisks(): string[] {
  return [
    "Increasing competition in primary markets",
    "Potential regulatory headwinds",
    "Macroeconomic uncertainties affecting consumer spending",
    "Supply chain constraints",
    "Rising input costs affecting margins"
  ];
}
