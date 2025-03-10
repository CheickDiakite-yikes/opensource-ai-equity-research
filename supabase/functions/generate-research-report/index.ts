
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { generateResearchReport } from "./reportGenerator.ts";
import { fetchRecommendationTrends, fetchFinnhubCompanyNews, fetchFinnhubPeers, fetchEarningsCalendar } from "../_shared/finnhub-services.ts";
import { fetchEnterpriseValue, fetchAnalystEstimates } from "../_shared/fmp-services.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { reportRequest } = await req.json();
    
    // Log the received request
    console.log(`Received research report request for ${reportRequest.symbol} (type: ${reportRequest.reportType || 'standard'})`);
    
    // Check for required parameters
    if (!reportRequest || !reportRequest.symbol) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    
    // Ensure reportType is normalized to a known value
    if (reportRequest.reportType) {
      // Convert to lowercase and normalize
      const reportType = reportRequest.reportType.toLowerCase();
      if (reportType.includes('financial')) {
        reportRequest.reportType = 'financial';
      } else if (reportType.includes('valuation')) {
        reportRequest.reportType = 'valuation';
      } else {
        reportRequest.reportType = 'comprehensive';
      }
      
      console.log(`Normalized report type: ${reportRequest.reportType}`);
    } else {
      // Set default if missing
      reportRequest.reportType = 'comprehensive';
      console.log('Report type not specified, defaulting to comprehensive');
    }
    
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
      fetchRecommendationTrends(reportRequest.symbol),
      fetchFinnhubCompanyNews(reportRequest.symbol, formatDate(oneMonthAgo), formatDate(today)),
      fetchFinnhubPeers(reportRequest.symbol),
      fetchEarningsCalendar(formatDate(today), formatDate(threeMonthsAhead), reportRequest.symbol),
      fetchEnterpriseValue(reportRequest.symbol),
      fetchAnalystEstimates(reportRequest.symbol)
    ]);
    
    // Add additional data to the report request
    reportRequest.recommendationTrends = recommendationTrends;
    reportRequest.finnhubNews = finnhubNews;
    reportRequest.finnhubPeers = finnhubPeers;
    reportRequest.earningsCalendar = earningsCalendar;
    reportRequest.enterpriseValue = enterpriseValue;
    reportRequest.analystEstimates = analystEstimates;
    
    // Log that we've fetched the additional data
    console.log(`Fetched additional data for ${reportRequest.symbol} research report:`);
    console.log(`- Recommendation trends: ${recommendationTrends?.length || 0} items`);
    console.log(`- Finnhub news: ${finnhubNews?.length || 0} items`);
    console.log(`- Finnhub peers: ${finnhubPeers?.length || 0} items`);
    console.log(`- Earnings calendar entries: ${earningsCalendar?.earningsCalendar?.length || 0} items`);
    console.log(`- Enterprise value: ${enterpriseValue?.length || 0} items`);
    console.log(`- Analyst estimates: ${analystEstimates?.length || 0} items`);
    console.log(`- Report type: ${reportRequest.reportType}`);
    
    // Generate the research report
    const report = await generateResearchReport(reportRequest);
    
    // Return the report
    return new Response(
      JSON.stringify(report),
      { headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    console.error("Error generating research report:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An error occurred during report generation" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
