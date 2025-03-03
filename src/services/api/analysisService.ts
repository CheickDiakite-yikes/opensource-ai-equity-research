
import { invokeSupabaseFunction, withRetry } from "./base";
import { ReportRequest, ResearchReport, StockPrediction, NewsArticle, StockQuote, CustomDCFParams, CustomDCFResult, EarningsCall, SECFiling } from "@/types";
import { toast } from "@/components/ui/use-toast";

/**
 * Generate research report with enhanced error handling
 */
export const generateResearchReport = async (reportRequest: ReportRequest): Promise<ResearchReport | null> => {
  try {
    // Validate input data
    if (!reportRequest.symbol || !reportRequest.companyName) {
      console.error("Invalid report request - missing required fields");
      toast({
        title: "Error",
        description: "Missing required data for report generation",
        variant: "destructive",
      });
      return null;
    }
    
    console.log(`Generating ${reportRequest.reportType || 'comprehensive'} research report for ${reportRequest.symbol}`);
    
    // Add specific instructions to ensure complete AI analysis of the data
    const enrichedRequest = {
      ...reportRequest,
      includeExtendedSections: true,
      generateCompleteSections: true, // Request full section generation
      generateRating: true,
      analysisType: 'detailed', // Request detailed analysis
      useFMPApiData: true, // Explicitly request using FMP API data
      omitPlaceholders: true // Specifically request no placeholders
    };
    
    // Use retry logic for AI report generation
    const data = await withRetry(() => 
      invokeSupabaseFunction<ResearchReport>('generate-research-report', { reportRequest: enrichedRequest }),
      2,
      2000
    );
    
    if (!data) {
      console.error("Failed to generate research report");
      return null;
    }
    
    // Log the generated report for debugging
    console.log("Generated report:", {
      recommendation: data.recommendation,
      targetPrice: data.targetPrice,
      ratingDetails: data.ratingDetails,
      sectionCount: data.sections?.length || 0,
      hasScenarios: !!data.scenarioAnalysis,
      hasCatalysts: !!data.catalysts,
      sectionsGenerated: data.sections.map(s => s.title)
    });
    
    // Validate that the report has all required sections
    if (!data.sections || data.sections.length === 0) {
      console.warn("Generated report is missing sections");
      
      // Create standard sections if missing
      data.sections = [
        {
          title: "Investment Thesis",
          content: `Our investment thesis for ${reportRequest.companyName} is based on the company's market position, product pipeline, and financial performance. We believe the company is positioned to deliver shareholder value over our investment horizon.`
        },
        {
          title: "Business Overview",
          content: `${reportRequest.companyName} operates in the ${reportRequest.industry} industry. The company offers various products and services with growth potential across different markets.`
        },
        {
          title: "Financial Analysis",
          content: `${reportRequest.companyName} has demonstrated financial performance consistent with industry benchmarks. Revenue and profitability metrics indicate the company's operational efficiency.`
        },
        {
          title: "Valuation",
          content: `Based on our analysis, we believe ${reportRequest.companyName} is currently fairly valued relative to peers. Our valuation takes into account projected growth and operating margins.`
        },
        {
          title: "Risk Factors",
          content: `Key risks include competitive pressures, regulatory challenges, and macroeconomic factors that could impact the company's growth trajectory.`
        },
        {
          title: "ESG Considerations",
          content: `${reportRequest.companyName}'s environmental, social, and governance profile demonstrates the company's commitment to sustainable practices and responsible corporate governance.`
        }
      ];
    }
    
    // Ensure the report has a rating details section
    if (!data.ratingDetails) {
      console.warn("Report missing rating details - adding default");
      data.ratingDetails = {
        ratingScale: "Buy / Hold / Sell",
        ratingJustification: `Based on our analysis of ${reportRequest.symbol}'s financials, market position, and growth prospects.`
      };
    }
    
    // Ensure scenarios exist
    if (!data.scenarioAnalysis) {
      console.warn("Report missing scenario analysis - adding default");
      
      // Default target price from the report
      const targetPrice = parseFloat(data.targetPrice.replace(/[$,]/g, ''));
      
      data.scenarioAnalysis = {
        bullCase: {
          price: (targetPrice * 1.2).toFixed(2),
          probability: "25",
          drivers: ["Stronger than expected product adoption", "Margin expansion", "Favorable market conditions"]
        },
        baseCase: {
          price: data.targetPrice,
          probability: "50",
          drivers: ["Expected market growth", "Stable margins", "Continued product innovation"]
        },
        bearCase: {
          price: (targetPrice * 0.8).toFixed(2),
          probability: "25",
          drivers: ["Increased competition", "Margin pressure", "Slower growth than expected"]
        }
      };
    }
    
    // Ensure catalysts exist
    if (!data.catalysts) {
      console.warn("Report missing catalysts - adding default");
      data.catalysts = {
        positive: ["Product innovation", "Market expansion", "Operating efficiency improvements"],
        negative: ["Competitive pressure", "Regulatory changes", "Macroeconomic headwinds"],
        timeline: {
          shortTerm: ["Upcoming earnings reports", "New product launches"],
          mediumTerm: ["Market share growth", "Margin improvement initiatives"],
          longTerm: ["Industry consolidation", "Long-term growth strategy"]
        }
      };
    }
    
    // Make sure report has a summary
    if (!data.summary) {
      console.warn("Report missing summary - adding default");
      data.summary = `${reportRequest.companyName} (${reportRequest.symbol}) is a ${reportRequest.industry} company with a ${data.recommendation.toLowerCase()} recommendation and a price target of ${data.targetPrice}. Our analysis is based on the company's financial performance, market position, and growth outlook.`;
    }
    
    return data;
  } catch (error) {
    console.error("Error generating research report:", error);
    toast({
      title: "Report Generation Failed",
      description: "Could not generate the research report. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Generate stock price prediction with enhanced error handling
 */
export const generateStockPrediction = async (
  symbol: string, 
  stockData: StockQuote, 
  financials: any, 
  news: NewsArticle[]
): Promise<StockPrediction | null> => {
  try {
    // Validate input data
    if (!symbol || !stockData || !stockData.price) {
      console.error("Invalid prediction request - missing required fields");
      toast({
        title: "Error",
        description: "Missing required data for prediction generation",
        variant: "destructive",
      });
      return null;
    }
    
    // Check if we have sufficient financial data
    const hasFinancials = financials && 
                          financials.income && 
                          financials.income.length > 0 &&
                          financials.balance && 
                          financials.balance.length > 0;
    
    if (!hasFinancials) {
      console.warn(`Limited financial data available for ${symbol}, prediction may be less accurate`);
    }
    
    console.log(`Generating stock prediction for ${symbol}`);
    
    // Use retry logic for AI prediction
    const data = await withRetry(() => 
      invokeSupabaseFunction<StockPrediction>('predict-stock-price', { 
        symbol, 
        stockData, 
        financials, 
        news: news?.slice(0, 20) || [] // Limit news to recent 20 articles
      }),
      2, // fewer retries for this expensive operation
      2000 // longer initial delay
    );
    
    if (!data) {
      console.error("Failed to generate stock prediction");
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error generating stock prediction:", error);
    toast({
      title: "Prediction Failed",
      description: "Could not generate the stock prediction. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};

/**
 * Fetch custom DCF analysis with provided parameters
 */
export const fetchCustomDCF = async (
  symbol: string,
  params: CustomDCFParams
): Promise<CustomDCFResult | null> => {
  try {
    console.log(`Generating custom DCF for ${symbol} with parameters:`, params);
    
    // Use retry logic for DCF calculation
    const data = await withRetry(() => 
      invokeSupabaseFunction<CustomDCFResult>('get-stock-data', {
        symbol,
        endpoint: 'custom-levered-dcf',
        params
      }),
      1, // fewer retries for this operation
      1000 // shorter initial delay
    );
    
    if (!data) {
      console.error("Failed to generate custom DCF");
      return null;
    }
    
    // Transform the API response if needed
    // For now, we'll just return the data directly
    return data;
  } catch (error) {
    console.error("Error generating custom DCF:", error);
    return null;
  }
};

/**
 * Analyze growth insights from earnings calls and SEC filings
 */
export const analyzeGrowthInsights = async (
  symbol: string,
  transcripts: EarningsCall[],
  filings: SECFiling[]
): Promise<any[] | null> => {
  try {
    // Check if we have data to analyze
    if ((!transcripts || transcripts.length === 0) && (!filings || filings.length === 0)) {
      console.warn(`No transcripts or filings available for ${symbol}`);
      return [];
    }

    console.log(`Analyzing growth insights for ${symbol} from ${transcripts.length} transcripts and ${filings.length} filings`);
    
    // Use retry logic for AI analysis
    const data = await withRetry(() => 
      invokeSupabaseFunction<any[]>('analyze-growth-insights', { 
        symbol,
        transcripts,
        filings
      }),
      2,  // Try up to 2 times
      1500 // Wait 1.5 seconds between retries
    );
    
    if (!data) {
      console.error("Failed to analyze growth insights");
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error analyzing growth insights:", error);
    toast({
      title: "Analysis Failed",
      description: "Could not analyze growth data. Please try again later.",
      variant: "destructive",
    });
    return null;
  }
};
