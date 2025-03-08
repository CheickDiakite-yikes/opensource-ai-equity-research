import { useState, useEffect, useCallback } from "react";
import { StockProfile, StockQuote } from "@/types";
import { RatingSnapshot, GradeNews } from "@/types/ratings/ratingTypes";
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

  // Load main company data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Use retry mechanism for core data
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
      
      // Show a helpful toast message
      toast({
        title: "Error Loading Data",
        description: `Could not load data for ${symbol}. ${err.message || "Please try again later."}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  // Load document data (SEC filings)
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
        // Fallback empty state for filings
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
      // Document loading errors don't prevent the main view from loading
    } finally {
      setDocumentsLoading(false);
    }
  }, [symbol]);

  // Load ratings data - modified to reset state on new symbol
  const loadRatingsData = useCallback(async () => {
    try {
      // Reset rating data when loading new symbol
      setRatingSnapshot(null);
      setGradeNews([]);
      setRatingsLoading(true);
      
      console.log(`Starting to load ratings data for ${symbol}`);
      
      // Try both endpoints with more detailed logging
      console.log("Attempting to fetch rating snapshot...");
      const snapshotData = await fetchRatingSnapshot(symbol);
      console.log("Rating snapshot result:", snapshotData ? "Success" : "No data");
      
      console.log("Attempting to fetch grade news...");
      const newsData = await fetchGradeNews(symbol, 10);
      console.log("Grade news result:", newsData && newsData.length > 0 ? `Found ${newsData.length} items` : "No data");
      
      // Set the data even if one or both are null/empty
      setRatingSnapshot(snapshotData);
      setGradeNews(newsData || []);
      
      console.log("Completed loading ratings data:", { 
        hasRatingSnapshot: !!snapshotData,
        snapshotDetails: snapshotData ? {
          symbol: snapshotData.symbol,
          rating: snapshotData.rating,
          overallScore: snapshotData.overallScore
        } : null,
        gradeNewsCount: newsData?.length || 0 
      });
    } catch (err) {
      console.error("Error loading ratings data:", err);
      // Rating errors don't prevent the main view from loading
    } finally {
      setRatingsLoading(false);
    }
  }, [symbol]);

  // Refetch all data
  const refetch = useCallback(() => {
    loadData();
    loadDocuments();
    loadRatingsData();
  }, [loadData, loadDocuments, loadRatingsData]);

  useEffect(() => {
    if (symbol) {
      // Reset data when symbol changes
      setRatingSnapshot(null);
      setGradeNews([]);
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
