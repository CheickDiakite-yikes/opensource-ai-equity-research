
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ComparablesResponse } from "@/types/comparables";
import { generateComparablesAnalysis } from "@/lib/api/openai";
import { fetchCompanyPeers } from "@/services/api/marketDataService";
import { fetchStockProfile } from "@/services/api/profileService";

export function useComparableCompanies(symbol: string) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ComparablesResponse | null>(null);

  useEffect(() => {
    if (!symbol) {
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch company profile to get sector and industry
        const profile = await fetchStockProfile(symbol);
        
        // Fetch peer companies
        const peersData = await fetchCompanyPeers(symbol);
        // peersData is directly an array of string tickers, not an object with peers property
        const peers = Array.isArray(peersData) ? peersData : [];
        
        // Generate comparables analysis
        const comparablesData = await generateComparablesAnalysis({
          symbol,
          sector: profile?.sector,
          industry: profile?.industry,
          peers: peers.slice(0, 5) // Use top 5 peers
        });
        
        setData(comparablesData);
      } catch (err) {
        console.error("Error fetching comparable companies:", err);
        setError("Failed to fetch comparable companies data");
        toast.error("Failed to load comparable companies analysis");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  return { isLoading, error, data };
}
