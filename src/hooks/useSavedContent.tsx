
import { useState, useEffect } from "react";
import { 
  getUserResearchReports, 
  getUserPricePredictions,
  deleteResearchReport,
  deletePricePrediction,
  saveResearchReport,
  savePricePrediction
} from "@/services/api/userContentService";
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
  html_content?: string;
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
      setReports([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserResearchReports();
      // Convert Json type to ResearchReport type with type assertion
      setReports(data.map(item => ({
        ...item,
        report_data: item.report_data as unknown as ResearchReport
      })) as SavedReport[]);
    } catch (err) {
      console.error("Error fetching saved reports:", err);
      setError("Failed to load saved reports");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    const success = await deleteResearchReport(reportId);
    if (success) {
      setReports(prevReports => prevReports.filter(report => report.id !== reportId));
    }
    return success;
  };

  const saveReport = async (symbol: string, companyName: string, reportData: ResearchReport) => {
    const reportId = await saveResearchReport(symbol, companyName, reportData);
    if (reportId) {
      // Refresh reports list after saving
      fetchReports();
    }
    return reportId;
  };

  // Fetch reports when the component mounts or user changes
  useEffect(() => {
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
      setPredictions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const data = await getUserPricePredictions();
      // Convert Json type to StockPrediction type with type assertion
      setPredictions(data.map(item => ({
        ...item,
        prediction_data: item.prediction_data as unknown as StockPrediction
      })) as SavedPrediction[]);
    } catch (err) {
      console.error("Error fetching saved predictions:", err);
      setError("Failed to load saved predictions");
    } finally {
      setIsLoading(false);
    }
  };

  const deletePrediction = async (predictionId: string) => {
    const success = await deletePricePrediction(predictionId);
    if (success) {
      setPredictions(prevPredictions => 
        prevPredictions.filter(prediction => prediction.id !== predictionId)
      );
    }
    return success;
  };

  const savePrediction = async (symbol: string, companyName: string, predictionData: StockPrediction) => {
    const predictionId = await savePricePrediction(symbol, companyName, predictionData);
    if (predictionId) {
      // Refresh predictions list after saving
      fetchPredictions();
    }
    return predictionId;
  };

  // Fetch predictions when the component mounts or user changes
  useEffect(() => {
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
