
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { formatDataForPrediction } from "./dataFormatter.ts";
import { generatePredictionWithOpenAI, enhancePredictionWithAnalystEstimates, enhancePredictionWithRecommendationTrends, enhancePredictionWithEnterpriseValue, enhancePredictionWithEarningsCalendar } from "./predictionService.ts";
import { fetchRecommendationTrends, fetchFinnhubCompanyNews, fetchFinnhubPeers, fetchEarningsCalendar } from "../_shared/finnhub-services.ts";
import { fetchEnterpriseValue, fetchAnalystEstimates } from "../_shared/fmp-services.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { symbol, stockData, financials, news, quickMode } = await req.json();
    
    // Log the received request
    console.log(`Received prediction request for ${symbol} (quick mode: ${quickMode || false})`);
    
    // Check for required parameters
    if (!symbol || !stockData) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Format the data for prediction
    const formattedData = formatDataForPrediction(symbol, stockData, financials, news);
    formattedData.quickMode = quickMode || false;
    
    // Calculate date ranges for API calls
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const threeMonthsAhead = new Date();
    threeMonthsAhead.setMonth(today.getMonth() + 3);
    
    const formatDate = (date: Date) => {
      return date.toISOString().split('T')[0];
    };
    
    // Fetch additional data in parallel
    const [
      recommendationTrends,
      finnhubNews,
      finnhubPeers,
      earningsCalendar,
      enterpriseValue,
      analystEstimates
    ] = await Promise.all([
      fetchRecommendationTrends(symbol),
      fetchFinnhubCompanyNews(symbol, formatDate(oneMonthAgo), formatDate(today)),
      fetchFinnhubPeers(symbol),
      fetchEarningsCalendar(formatDate(today), formatDate(threeMonthsAhead), symbol),
      fetchEnterpriseValue(symbol),
      fetchAnalystEstimates(symbol)
    ]);
    
    // Add additional data to the formatted data
    formattedData.recommendationTrends = recommendationTrends;
    formattedData.finnhubNews = finnhubNews;
    formattedData.finnhubPeers = finnhubPeers;
    formattedData.earningsCalendar = earningsCalendar;
    formattedData.enterpriseValue = enterpriseValue;
    formattedData.analystEstimates = analystEstimates;
    
    // Log that we've fetched the additional data
    console.log(`Fetched additional data for ${symbol} prediction:`);
    console.log(`- Recommendation trends: ${recommendationTrends?.length || 0} items`);
    console.log(`- Finnhub news: ${finnhubNews?.length || 0} items`);
    console.log(`- Finnhub peers: ${finnhubPeers?.length || 0} items`);
    console.log(`- Earnings calendar entries: ${earningsCalendar?.earningsCalendar?.length || 0} items`);
    console.log(`- Enterprise value: ${enterpriseValue?.length || 0} items`);
    console.log(`- Analyst estimates: ${analystEstimates?.length || 0} items`);
    
    // Generate the base prediction
    let prediction = await generatePredictionWithOpenAI(formattedData);
    
    // Enhance prediction with additional data
    prediction = enhancePredictionWithAnalystEstimates(prediction, analystEstimates);
    prediction = enhancePredictionWithRecommendationTrends(prediction, recommendationTrends);
    prediction = enhancePredictionWithEnterpriseValue(prediction, enterpriseValue);
    prediction = enhancePredictionWithEarningsCalendar(prediction, earningsCalendar);
    
    // Return the prediction
    return new Response(
      JSON.stringify(prediction),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error generating prediction:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during prediction" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
