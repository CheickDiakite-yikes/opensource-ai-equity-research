
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PredictionHistoryEntry } from "./types";

/**
 * Hook to fetch and manage prediction history for a given stock symbol
 */
export const usePredictionHistory = (symbol: string) => {
  const [history, setHistory] = useState<PredictionHistoryEntry[]>([]);

  /**
   * Fetch prediction history from the database
   */
  const fetchPredictionHistory = async (): Promise<PredictionHistoryEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('stock_prediction_history')
        .select('*')
        .eq('symbol', symbol)
        .order('prediction_date', { ascending: false })
        .limit(5);
        
      if (error) {
        console.error(`Error fetching prediction history for ${symbol}:`, error);
        return [];
      }
      
      // Type cast to ensure compatibility
      const typedData = data?.map(item => ({
        ...item,
        key_drivers: Array.isArray(item.key_drivers) ? item.key_drivers : [],
        risks: Array.isArray(item.risks) ? item.risks : []
      })) as PredictionHistoryEntry[];
      
      setHistory(typedData || []);
      return typedData || [];
    } catch (err) {
      console.error(`Error in fetchPredictionHistory for ${symbol}:`, err);
      return [];
    }
  };

  return {
    history,
    fetchPredictionHistory
  };
};
