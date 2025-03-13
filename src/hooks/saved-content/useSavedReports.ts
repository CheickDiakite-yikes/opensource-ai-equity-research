
import { useState, useEffect, useCallback } from "react";
import { 
  getUserResearchReports, 
  deleteResearchReport,
  saveResearchReport 
} from "@/services/api/userContent";
import { testConnection, getDiagnosticInfo } from "@/services/api/userContent/baseService";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { useSavedContentBase } from "./useSavedContentBase";
import { toast } from "sonner";

export interface SavedReport {
  id: string;
  symbol: string;
  company_name: string;
  report_data: ResearchReport;
  created_at: string;
  expires_at: string;
  html_content?: string | null;
}

export const useSavedReports = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { user, isLoading, setIsLoading, error, setError, checkUserLoggedIn } = useSavedContentBase();

  const clearErrors = useCallback(() => {
    setError(null);
    setLastError(null);
    setDebugInfo(null);
  }, [setError]);

  const fetchReports = async () => {
    if (!checkUserLoggedIn()) {
      setReports([]);
      return;
    }

    console.log("Fetching reports for user:", user.id);
    setIsLoading(true);
    clearErrors();
    
    try {
      // Get diagnostic info to help with debugging
      const diagnostics = await getDiagnosticInfo();
      setDebugInfo(diagnostics);
      
      if (!diagnostics.connected) {
        setError("Database connection error");
        setLastError(diagnostics.lastError || "Could not connect to database");
        setReports([]);
        setIsLoading(false);
        return;
      }
      
      if (diagnostics.authStatus !== 'authenticated') {
        setError("Authentication error");
        setLastError("User is not authenticated");
        setReports([]);
        setIsLoading(false);
        return;
      }
      
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
          return {
            ...item,
            report_data: {
              symbol: item.symbol,
              companyName: item.company_name,
              sections: [],
              recommendation: "Unknown"
            } as ResearchReport,
            html_content: item.html_content || null
          };
        }
        
        return {
          ...item,
          report_data: item.report_data as unknown as ResearchReport,
          html_content: item.html_content || null
        };
      }) as SavedReport[];
      
      // Debug
      console.log(`Fetched ${convertedReports.length} reports`);
      setReports(convertedReports);
    } catch (err) {
      console.error("Error fetching saved reports:", err);
      setError("Failed to load saved reports");
      setLastError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    console.log("Deleting report:", reportId);
    try {
      const status = await testConnection();
      
      if (status !== 'connected') {
        toast.error("Cannot delete report: Database connection error");
        return false;
      }
      
      const success = await deleteResearchReport(reportId);
      if (success) {
        console.log("Report deleted successfully, updating state");
        setReports(prevReports => prevReports.filter(report => report.id !== reportId));
      } else {
        console.error("Failed to delete report");
      }
      return success;
    } catch (err) {
      console.error("Error in deleteReport:", err);
      toast.error("Failed to delete report due to an error");
      setLastError(err instanceof Error ? err.message : String(err));
      return false;
    }
  };

  const saveReport = async (symbol: string, companyName: string, reportData: ResearchReport) => {
    console.log("Saving report for:", symbol, companyName);
    try {
      const status = await testConnection();
      
      if (status !== 'connected') {
        toast.error("Cannot save report: Database connection error");
        return null;
      }
      
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
    } catch (err) {
      console.error("Error in saveReport:", err);
      toast.error("Failed to save report due to an unexpected error");
      setLastError(err instanceof Error ? err.message : String(err));
      return null;
    }
  };

  // Fetch reports when the component mounts or user changes
  useEffect(() => {
    if (user) {
      console.log("useSavedReports useEffect - fetching reports");
      fetchReports();
    }
  }, [user]);

  return { 
    reports, 
    isLoading, 
    error, 
    lastError,
    debugInfo,
    fetchReports, 
    deleteReport, 
    saveReport,
    clearErrors 
  };
};
