
import { invokeSupabaseFunction } from "./base";
import { CompanyNews, SocialSentimentResponse, CongressionalTradesResponse } from "@/types/alternative";

/**
 * Fetch company news from Finnhub
 */
export const fetchCompanyNews = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<CompanyNews[]> => {
  try {
    const news = await invokeSupabaseFunction<CompanyNews[]>("get-finnhub-company-news", {
      symbol,
      from,
      to,
    });
    
    return Array.isArray(news) ? news : [];
  } catch (error) {
    console.error("Error fetching company news:", error);
    return [];
  }
};

/**
 * Fetch social sentiment data from Finnhub
 */
export const fetchSocialSentiment = async (
  symbol: string,
  from?: string,
  to?: string
): Promise<SocialSentimentResponse | null> => {
  try {
    return await invokeSupabaseFunction<SocialSentimentResponse>("get-finnhub-social-sentiment", {
      symbol,
      from,
      to,
    });
  } catch (error) {
    console.error("Error fetching social sentiment:", error);
    return null;
  }
};

/**
 * Fetch congressional trading data from Finnhub
 */
export const fetchCongressionalTrading = async (
  symbol: string,
  from: string,
  to: string
): Promise<CongressionalTradesResponse | null> => {
  try {
    return await invokeSupabaseFunction<CongressionalTradesResponse>("get-finnhub-congressional-trading", {
      symbol,
      from,
      to,
    });
  } catch (error) {
    console.error("Error fetching congressional trading data:", error);
    return null;
  }
};
