
import { useState, useEffect, useCallback } from "react";
import { StockProfile, StockQuote, EarningsCall, SECFiling } from "@/types";
import { 
  fetchStockProfile, 
  fetchStockQuote, 
  fetchEarningsTranscripts, 
  fetchSECFilings,
  generateTranscriptHighlights,
  fetchStockRating,
  withRetry
} from "@/services/api";
import { toast } from "@/components/ui/use-toast";

export const useStockOverviewData = (symbol: string) => {
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [earningsCalls, setEarningsCalls] = useState<EarningsCall[]>([]);
  const [secFilings, setSecFilings] = useState<SECFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState<string | null>(null);

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

  // Load document data (earnings transcripts and SEC filings)
  const loadDocuments = useCallback(async () => {
    try {
      setDocumentsLoading(true);
      
      const [earningsData, filingsData] = await Promise.all([
        fetchEarningsTranscripts(symbol).catch(err => {
          console.warn("Error loading transcripts:", err);
          return [];
        }),
        fetchSECFilings(symbol).catch(err => {
          console.warn("Error loading SEC filings:", err);
          return [];
        })
      ]);
      
      // Process and sort earnings calls by date (newest first)
      if (earningsData && earningsData.length > 0) {
        // Sort by date (newest first)
        const sortedCalls = [...earningsData].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        // Process transcripts to add highlights if needed
        const processedCalls = await Promise.all(
          sortedCalls.slice(0, 3).map(async (call) => {
            if (call.content && !call.highlights?.length) {
              try {
                const highlights = await generateTranscriptHighlights(call.content, {
                  symbol: call.symbol,
                  quarter: call.quarter,
                  year: call.year,
                  date: call.date
                });
                return { ...call, highlights };
              } catch (e) {
                console.error("Error generating highlights:", e);
                return call;
              }
            }
            return call;
          })
        );
        
        setEarningsCalls(processedCalls);
      } else {
        // Empty state - we'll handle this in the UI
        setEarningsCalls([]);
      }
      
      if (filingsData && filingsData.length > 0) {
        // Sort filings by date (newest first)
        const sortedFilings = [...filingsData].sort((a, b) => {
          return new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime();
        });
        setSecFilings(sortedFilings);
      } else {
        // Fallback empty state for filings
        setSecFilings([]);
      }
    } catch (err) {
      console.error("Error loading document data:", err);
      // Document loading errors don't prevent the main view from loading
    } finally {
      setDocumentsLoading(false);
    }
  }, [symbol]);

  // Refetch all data
  const refetch = useCallback(() => {
    loadData();
    loadDocuments();
  }, [loadData, loadDocuments]);

  useEffect(() => {
    if (symbol) {
      loadData();
    }
  }, [symbol, loadData]);

  useEffect(() => {
    if (symbol && profile) {
      loadDocuments();
    }
  }, [symbol, profile, loadDocuments]);

  return {
    profile,
    quote,
    earningsCalls,
    secFilings,
    loading,
    documentsLoading,
    error,
    rating,
    refetch
  };
};
