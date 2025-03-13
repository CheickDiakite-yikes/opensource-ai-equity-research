
import { useState, useEffect, useCallback } from "react";
import { StockProfile, StockQuote, EarningsCall, SECFiling } from "@/types";
import { OwnershipData } from "@/types/profile/ownershipTypes";
import { 
  fetchStockProfile, 
  fetchStockQuote, 
  fetchEarningsTranscripts, 
  fetchSECFilings,
  generateTranscriptHighlights,
  fetchStockRating,
  fetchFinnhubOwnership,
  withRetry
} from "@/services/api";
import { toast } from "@/components/ui/use-toast";

export const useStockOverviewData = (symbol: string) => {
  const [profile, setProfile] = useState<StockProfile | null>(null);
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [earningsCalls, setEarningsCalls] = useState<EarningsCall[]>([]);
  const [secFilings, setSecFilings] = useState<SECFiling[]>([]);
  const [ownershipData, setOwnershipData] = useState<OwnershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [documentsLoading, setDocumentsLoading] = useState(true);
  const [ownershipLoading, setOwnershipLoading] = useState(true);
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
      
      if (earningsData && earningsData.length > 0) {
        const processedCalls = await Promise.all(
          earningsData.slice(0, 3).map(async (call) => {
            if (call.content && !call.highlights) {
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
        // Fallback data if no real data is available
        setEarningsCalls([
          {
            symbol,
            date: "2023-10-25",
            quarter: "Q3",
            year: "2023",
            content: "",
            url: `https://financialmodelingprep.com/api/v4/earning_call_transcript/${symbol}`,
            highlights: [
              "No transcript data available for this symbol",
              "Check back later for updated information",
              "You can also view other sections for available data"
            ]
          }
        ]);
      }
      
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

  // Load ownership data
  const loadOwnership = useCallback(async () => {
    try {
      setOwnershipLoading(true);
      
      // Request up to 100 ownership records
      const data = await fetchFinnhubOwnership(symbol, 100);
      setOwnershipData(data);
    } catch (err) {
      console.error("Error loading ownership data:", err);
      // Ownership loading errors don't prevent the main view from loading
    } finally {
      setOwnershipLoading(false);
    }
  }, [symbol]);

  // Refetch all data
  const refetch = useCallback(() => {
    loadData();
    loadDocuments();
    loadOwnership();
  }, [loadData, loadDocuments, loadOwnership]);

  useEffect(() => {
    if (symbol) {
      loadData();
    }
  }, [symbol, loadData]);

  useEffect(() => {
    if (symbol && profile) {
      loadDocuments();
      loadOwnership();
    }
  }, [symbol, profile, loadDocuments, loadOwnership]);

  return {
    profile,
    quote,
    earningsCalls,
    secFilings,
    ownershipData,
    loading,
    documentsLoading,
    ownershipLoading,
    error,
    rating,
    refetch
  };
};
