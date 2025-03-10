
import { invokeSupabaseFunction, withRetry } from "../base";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { NewsArticle } from "@/types/news/newsTypes";
import { StockQuote } from "@/types/profile/companyTypes";

/**
 * Generate an AI research report for a company
 */
export const generateResearchReport = async (reportRequest: any): Promise<ResearchReport> => {
  try {
    console.log(`Generating AI research report for ${reportRequest.symbol} (type: ${reportRequest.reportType || 'standard'})`);
    
    // Enhanced retry mechanism for better reliability with complex reports
    const data = await withRetry(async () => {
      return await invokeSupabaseFunction<ResearchReport>('generate-research-report', {
        reportRequest
      });
    }, { retries: 3, retryDelay: 2500 }); // Increased retries and delay for more complex report generation
    
    if (!data) {
      console.error("No data returned from research report API");
      throw new Error("Failed to generate research report");
    }
    
    // Enhanced validation for more comprehensive reports
    if (!data.symbol || !data.companyName || !data.date) {
      console.error("Research report response is missing required fields:", data);
      throw new Error("Invalid research report format received");
    }
    
    // Verify sections array exists and is properly formatted
    if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
      console.warn("No sections in research report, adding placeholder");
      data.sections = [{
        title: "Investment Thesis",
        content: "Report sections are being generated. Please refresh or try regenerating the report if this message persists."
      }];
    }
    
    // Enhanced quality check for comprehensive sections
    const shortSections = data.sections.filter(section => section.content.length < 300);
    if (shortSections.length > 0) {
      console.warn(`Report contains ${shortSections.length} sections that may need enhancement:`, 
        shortSections.map(s => s.title).join(', '));
    }
    
    // Ensure each section has detailed content
    data.sections = data.sections.map(section => {
      if (!section.title || !section.content) {
        return {
          title: section.title || "Analysis Section",
          content: section.content || "Content is being generated. Please refresh or try regenerating the report if this message persists."
        };
      }
      return section;
    });
    
    // Ensure reports have a recommendation and target price
    if (!data.recommendation) {
      data.recommendation = "Neutral";
    }
    
    if (!data.targetPrice) {
      if (reportRequest.stockData?.price) {
        // Default to current price if no target provided
        data.targetPrice = `$${reportRequest.stockData.price.toFixed(2)}`;
      } else {
        data.targetPrice = "N/A";
      }
    }
    
    console.log(`AI research report generated for ${reportRequest.symbol} with ${data.sections?.length || 0} sections`);
    return data;
  } catch (error: any) {
    console.error("Error generating research report:", error);
    throw error;
  }
};

/**
 * Generate AI stock price prediction
 */
export const generateStockPrediction = async (
  symbol: string,
  quote: StockQuote,
  financials: any,
  news: NewsArticle[],
  quickMode: boolean = false
): Promise<StockPrediction> => {
  try {
    console.log(`Generating AI stock prediction for ${symbol}${quickMode ? ' (quick mode)' : ''}`);
    
    const data = await withRetry(async () => {
      return await invokeSupabaseFunction<StockPrediction>('predict-stock-price', {
        symbol,
        stockData: quote,
        financials,
        news,
        quickMode // Pass the quick mode flag to the edge function
      });
    }, { retries: 2, retryDelay: 1500 }); // Increased retries for better reliability
    
    if (!data) {
      console.error("No data returned from stock prediction API");
      throw new Error("Failed to generate stock prediction");
    }
    
    // Enhanced validation for predictions
    if (!data.predictedPrice || !data.keyDrivers || !data.risks) {
      console.warn("Prediction data may be incomplete:", {
        hasPredictedPrice: !!data.predictedPrice,
        hasKeyDrivers: !!data.keyDrivers,
        hasRisks: !!data.risks
      });
    }
    
    console.log(`AI stock prediction generated for ${symbol}`);
    return data;
  } catch (error: any) {
    console.error("Error generating stock prediction:", error);
    throw error;
  }
};
