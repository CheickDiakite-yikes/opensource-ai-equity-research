
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Define types for the response
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
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { symbol, stockData, financials, news } = await req.json();
    
    if (!symbol || !stockData) {
      throw new Error('Missing required parameters');
    }
    
    console.log(`Generating price prediction for ${symbol}`);
    
    // In a real scenario, here we would call an AI model or other analysis service
    // For now, we'll generate a realistic-looking mock prediction
    const prediction: StockPrediction = {
      symbol,
      currentPrice: stockData.price || 100,
      predictedPrice: generatePredictedPrices(stockData.price || 100),
      sentimentAnalysis: generateSentimentAnalysis(news),
      confidenceLevel: Math.floor(Math.random() * 30) + 65, // 65-95%
      keyDrivers: generateKeyDrivers(),
      risks: generateRisks()
    };
    
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

// Helper functions to generate prediction content
function generatePredictedPrices(currentPrice: number) {
  // Generate predictions that generally trend upward but with realistic variation
  const oneMonthChange = (Math.random() * 0.15) - 0.05; // -5% to +10%
  const threeMonthsChange = (Math.random() * 0.25) - 0.05; // -5% to +20%
  const sixMonthsChange = (Math.random() * 0.35) - 0.05; // -5% to +30%
  const oneYearChange = (Math.random() * 0.45) - 0.05; // -5% to +40%
  
  return {
    oneMonth: +(currentPrice * (1 + oneMonthChange)).toFixed(2),
    threeMonths: +(currentPrice * (1 + threeMonthsChange)).toFixed(2),
    sixMonths: +(currentPrice * (1 + sixMonthsChange)).toFixed(2),
    oneYear: +(currentPrice * (1 + oneYearChange)).toFixed(2)
  };
}

function generateSentimentAnalysis(news: any[] = []) {
  const sentiments = [
    "Based on recent news and market trends, the overall sentiment for this stock is positive. Major announcements regarding product innovations and strategic partnerships have been well-received by the market.",
    "Market sentiment is cautiously optimistic with a mix of positive financial results offset by some industry-wide challenges. The company's recent strategic initiatives may provide tailwinds in the coming quarters.",
    "Sentiment analysis of recent news and social media indicates neutral to slightly positive perception. While the company has made progress on key initiatives, market participants remain cautious about macroeconomic factors.",
    "Our analysis shows a bullish sentiment shift over the past quarter, driven by stronger-than-expected earnings and positive analyst revisions. Institutional ownership has also increased, suggesting growing confidence.",
    "The sentiment surrounding this stock remains mixed. While fundamental indicators suggest solid performance, market narratives and technical indicators show potential headwinds in the short term."
  ];
  
  return sentiments[Math.floor(Math.random() * sentiments.length)];
}

function generateKeyDrivers() {
  const allDrivers = [
    "Strong revenue growth in core product lines",
    "Expansion into emerging markets",
    "Margin improvement through operational efficiency",
    "New product launches expected in upcoming quarters",
    "Strategic acquisitions enhancing market position",
    "Industry consolidation creating favorable pricing environment",
    "Technological innovations driving competitive advantage",
    "Cost-cutting initiatives showing positive results",
    "Increasing demand in key market segments",
    "Favorable regulatory changes",
    "Strong digital transformation momentum",
    "Growing recurring revenue streams"
  ];
  
  // Randomly select 4-6 drivers
  const numDrivers = Math.floor(Math.random() * 3) + 4;
  const shuffled = [...allDrivers].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numDrivers);
}

function generateRisks() {
  const allRisks = [
    "Increasing competition in primary markets",
    "Potential regulatory headwinds",
    "Rising input costs affecting margins",
    "Macroeconomic uncertainties affecting consumer spending",
    "Currency exchange rate volatility",
    "Technological disruption from emerging competitors",
    "Supply chain constraints",
    "Geopolitical tensions affecting global operations",
    "Cybersecurity threats to digital infrastructure",
    "Changing consumer preferences",
    "Intellectual property challenges",
    "Labor market pressures and talent retention"
  ];
  
  // Randomly select 3-5 risks
  const numRisks = Math.floor(Math.random() * 3) + 3;
  const shuffled = [...allRisks].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numRisks);
}
