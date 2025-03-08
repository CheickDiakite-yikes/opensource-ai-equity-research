
import { useState, useEffect, useCallback } from "react";
import { StockProfile, StockQuote, SECFiling } from "@/types";
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

  // Load ratings data
  const loadRatingsData = useCallback(async () => {
    try {
      setRatingsLoading(true);
      
      const [snapshotData, newsData] = await Promise.all([
        fetchRatingSnapshot(symbol).catch(err => {
          console.warn("Error loading rating snapshot:", err);
          return null;
        }),
        fetchGradeNews(symbol, 5).catch(err => {
          console.warn("Error loading grade news:", err);
          return [];
        })
      ]);
      
      setRatingSnapshot(snapshotData);
      setGradeNews(newsData);
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
