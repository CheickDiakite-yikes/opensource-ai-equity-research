
import { useState, useEffect } from "react";
import { 
  getUserResearchReports, 
  getUserPricePredictions,
  deleteResearchReport,
  deletePricePrediction,
  saveResearchReport,
  savePricePrediction
} from "@/services/api/userContent";
import { useAuth } from "@/contexts/AuthContext";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { StockPrediction } from "@/types/ai-analysis/predictionTypes";
import { Json } from "@/integrations/supabase/types";

export interface SavedReport {
  id: string;
  symbol: string;
  company_name: string;
  report_data: ResearchReport;
  created_at: string;
  expires_at: string;
  html_content?: string | null;
}

export interface SavedPrediction {
  id: string;
  symbol: string;
  company_name: string;
  prediction_data: StockPrediction;
  created_at: string;
  expires_at: string;
}

export const useSavedReports = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchReports = async () => {
    if (!user) {
      console.log("No user logged in, clearing reports");
      setReports([]);
      setIsLoading(false);
      return;
    }

    console.log("Fetching reports for user:", user.id);
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserResearchReports();
      
      // Enhanced debug logging
      console.log("Raw data from getUserResearchReports:", data);
      
      if (data.length === 0) {
        console.log("No reports found for user");
        setReports([]);
        setIsLoading(false);
        return;
      }
      
      // Convert Json type to ResearchReport type with type assertion
      const convertedReports = data.map(item => {
        console.log(`Processing report ${item.id}:`, {
          symbol: item.symbol,
          company_name: item.company_name,
          html_available: !!item.html_content,
          html_length: item.html_content?.length || 0,
          created_at: item.created_at,
          expires_at: item.expires_at
        });
        
        // Validate report_data
        if (!item.report_data) {
          console.error(`Report ${item.id} has no report_data!`);
        }
        
        return {
          ...item,
          report_data: item.report_data as unknown as ResearchReport,
          html_content: item.html_content || null
        };
      }) as SavedReport[];
      
      // Debug
      console.log(`Fetched ${convertedReports.length} reports`);
      convertedReports.forEach(report => {
        console.log(`Report ${report.id}: Symbol=${report.symbol}, HTML content: ${report.html_content ? `YES (${report.html_content.length} chars)` : 'NO'}`);
      });
      
      setReports(convertedReports);
    } catch (err) {
      console.error("Error fetching saved reports:", err);
      setError("Failed to load saved reports");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    console.log("Deleting report:", reportId);
    const success = await deleteResearchReport(reportId);
    if (success) {
      console.log("Report deleted successfully, updating state");
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
    } else {
      console.error("Failed to delete report");
    }
    return success;
  };

  const saveReport = async (symbol: string, companyName: string, reportData: ResearchReport) => {
    console.log("Saving report for:", symbol, companyName);
    const reportId = await saveResearchReport(symbol, companyName, reportData);
    console.log("Save result - report ID:", reportId);
    
    if (reportId) {
      // Refresh reports list after saving
      console.log("Report saved successfully, refreshing reports list");
      await fetchReports();
    } else {
      console.error("Failed to save report - no ID returned");
    }
    return reportId;
  };

  // Fetch reports when the component mounts or user changes
  useEffect(() => {
    console.log("useSavedReports useEffect - fetching reports");
    fetchReports();
  }, [user]);

  return { reports, isLoading, error, fetchReports, deleteReport, saveReport };
};

export const useSavedPredictions = () => {
  const [predictions, setPredictions] = useState<SavedPrediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPredictions = async () => {
    if (!user) {
      console.log("No user logged in, clearing predictions");
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    console.log("Fetching predictions for user:", user.id);
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserPricePredictions();
      
      console.log("Raw data from getUserPricePredictions:", data);
      
      if (data.length === 0) {
        console.log("No predictions found for user");
        setPredictions([]);
        setIsLoading(false);
        return;
      }
      
      // Convert Json type to StockPrediction type with type assertion
      const convertedPredictions = data.map(item => {
        console.log(`Processing prediction ${item.id}:`, {
          symbol: item.symbol,
          company_name: item.company_name,
          created_at: item.created_at,
          expires_at: item.expires_at
        });
        
        // Validate prediction_data
        if (!item.prediction_data) {
          console.error(`Prediction ${item.id} has no prediction_data!`);
        }
        
        return {
          ...item,
          prediction_data: item.prediction_data as unknown as StockPrediction
        };
      }) as SavedPrediction[];
      
      console.log(`Fetched ${convertedPredictions.length} predictions`);
      setPredictions(convertedPredictions);
    } catch (err) {
      console.error("Error fetching saved predictions:", err);
      setError("Failed to load saved predictions");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrediction = async (predictionId: string) => {
    console.log("Deleting prediction:", predictionId);
    const success = await deletePricePrediction(predictionId);
    if (success) {
      console.log("Prediction deleted successfully, updating state");
      setPredictions(prevPredictions => 
        prevPredictions.filter(prediction => prediction.id !== predictionId)
      );
    } else {
      console.error("Failed to delete prediction");
    }
    return success;
  };

  const savePrediction = async (symbol: string, companyName: string, predictionData: StockPrediction) => {
    console.log("Saving prediction for:", symbol, companyName);
    const predictionId = await savePricePrediction(symbol, companyName, predictionData);
    console.log("Save result - prediction ID:", predictionId);
    
    if (predictionId) {
      // Refresh predictions list after saving
      console.log("Prediction saved successfully, refreshing predictions list");
      fetchPredictions();
    } else {
      console.error("Failed to save prediction - no ID returned");
    }
    return predictionId;
  };

  // Fetch predictions when the component mounts or user changes
  useEffect(() => {
    console.log("useSavedPredictions useEffect - fetching predictions");
    fetchPredictions();
  }, [user]);

  return { 
    predictions, 
    isLoading, 
    error, 
    fetchPredictions, 
    deletePrediction, 
    savePrediction 
  };
};
