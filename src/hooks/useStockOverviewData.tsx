
import { useState, useEffect, useCallback } from "react";
import { StockProfile, StockQuote } from "@/types";
import { RatingSnapshot, GradeNews } from "@/types/ratings/ratingTypes";
import { SECFiling } from "@/types/documentTypes";
import { 
  fetchStockProfile, 
  fetchStockQuote, 
  fetchSECFilings,
  fetchStockRating,
  fetchRatingSnapshot,
  fetchGradeNews,
  withRetry
} from "@/services/api";
import { toast } from "@/components/ui/use-toast";

export const useStockOverviewData = (symbol: string) => {
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [secFilings, setSecFilings] = useState<SECFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<string | null>(null);
  const [ratingSnapshot, setRatingSnapshot] = useState<RatingSnapshot | null>(null);
  const [gradeNews, setGradeNews] = useState<GradeNews[]>([]);
  const [ratingsLoading, setRatingsLoading] = useState(true);

  // Reset all data when symbol changes
  useEffect(() => {
    if (symbol) {
      console.log(`Symbol changed to ${symbol}, resetting all data`);
      setProfile(null);
      setQuote(null);
      setSecFilings([]);
      setRating(null);
      setRatingSnapshot(null);
      setGradeNews([]);
      setLoading(true);
      setDocumentsLoading(true);
      setRatingsLoading(true);
      setError(null);
    }
  }, [symbol]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profileData, quoteData, ratingData] = await Promise.all([
        withRetry(() => fetchStockProfile(symbol), { retries: 2 }),
        withRetry(() => fetchStockQuote(symbol), { retries: 2 }),
        fetchStockRating(symbol).catch(err => {
          console.warn("Error fetching rating data:", err);
          return null;
        })
      ]);
      
      if (!profileData || !quoteData) {
        throw new Error(`Could not fetch core data for ${symbol}. Please check if this symbol exists or try again later.`);
      }
      
      setProfile(profileData);
      setQuote(quoteData);
      setRating(ratingData?.rating || null);
    } catch (err: any) {
      console.error("Error loading stock overview data:", err);
      setError(err.message || `Failed to load data for ${symbol}`);
      
      toast({
        title: "Error Loading Data",
        description: `Could not load data for ${symbol}. ${err.message || "Please try again later."}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      
      const filingsData = await fetchSECFilings(symbol).catch(err => {
        console.warn("Error loading SEC filings:", err);
        return [];
      });
      
      if (filingsData && filingsData.length > 0) {
        setSecFilings(filingsData);
      } else {
        setSecFilings([
          {
            symbol,
            type: "No SEC filings data available",
            filingDate: new Date().toISOString().split('T')[0],
            reportDate: new Date().toISOString().split('T')[0],
            cik: "0000000000",
            form: "N/A",
            url: `https://www.sec.gov/edgar/search/#/entityName=${symbol}`,
            filingNumber: "000-00000"
          }
        ]);
      }
    } catch (err) {
      console.error("Error loading document data:", err);
    } finally {
      setDocumentsLoading(false);
    }
  }, [symbol]);

  const loadRatingsData = useCallback(async () => {
    try {
      // Reset ratings data state
      setRatingSnapshot(null);
      setGradeNews([]);
      setRatingsLoading(true);
      
      console.log(`Starting to load ratings data for ${symbol}`);
      
      // Add small delay between API calls to avoid rate limiting
      console.log("Attempting to fetch rating snapshot...");
      const snapshotData = await fetchRatingSnapshot(symbol);
      console.log("Rating snapshot result:", snapshotData ? 
        `Success - ${symbol} rated ${snapshotData.rating} with score ${snapshotData.overallScore}` : 
        "No data");
      
      // Small delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log("Attempting to fetch grade news...");
      const newsData = await fetchGradeNews(symbol, 10);
      console.log("Grade news result:", newsData && newsData.length > 0 ? 
        `Found ${newsData.length} items for ${symbol}` : 
        `No grade news for ${symbol}`);
      
      // Only set the data if it matches the current symbol
      // This prevents stale data from appearing for the wrong company
      if (snapshotData && snapshotData.symbol === symbol) {
        setRatingSnapshot(snapshotData);
      } else {
        console.warn(`Rating snapshot symbol mismatch or no data: ${symbol}`);
        setRatingSnapshot(null);
      }
      
      if (newsData && newsData.length > 0) {
        setGradeNews(newsData);
      } else {
        setGradeNews([]);
      }
      
      console.log("Completed loading ratings data:", { 
        hasRatingSnapshot: !!snapshotData,
        snapshotSymbol: snapshotData?.symbol,
        snapshotDetails: snapshotData ? {
          symbol: snapshotData.symbol,
          rating: snapshotData.rating,
          overallScore: snapshotData.overallScore
        } : null,
        gradeNewsCount: newsData?.length || 0 
      });
    } catch (err) {
      console.error("Error loading ratings data:", err);
    } finally {
      setRatingsLoading(false);
    }
  }, [symbol]);

  const refetch = useCallback(() => {
    loadData();
    loadDocuments();
    loadRatingsData();
  }, [loadData, loadDocuments, loadRatingsData]);

  useEffect(() => {
    if (symbol) {
      loadData();
    }
  }, [symbol, loadData]);

  useEffect(() => {
    if (symbol && profile) {
      loadDocuments();
      loadRatingsData();
    }
  }, [symbol, profile, loadDocuments, loadRatingsData]);

  return {
    profile,
    quote,
    secFilings,
    loading,
    documentsLoading,
    error,
    rating,
    ratingSnapshot,
    gradeNews,
    ratingsLoading,
    refetch
  };
};
