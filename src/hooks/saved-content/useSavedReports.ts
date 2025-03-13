
import { useState, useEffect } from "react";
import { 
  getUserResearchReports, 
  deleteResearchReport,
  saveResearchReport 
} from "@/services/api/userContent";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { useSavedContentBase, SavedContentError } from "./useSavedContentBase";
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
  const {
    user,
    isLoading,
    setIsLoading,
    error,
    setError,
    lastError,
    setLastError,
    checkUserLoggedIn,
    handleError
  } = useSavedContentBase();
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  const fetchReports = async () => {
    if (!checkUserLoggedIn()) {
      setReports([]);
      return;
    }

    console.log("=== Fetching reports ===");
    console.log("User:", user.id);
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    
    try {
      const data = await getUserResearchReports();
      
      // Debug logging
      console.log("Raw data from getUserResearchReports:", data);
      setDebugInfo(`Retrieved ${data.length} reports from database`);
      
      if (data.length === 0) {
        console.log("No reports found for user");
        setReports([]);
        setIsLoading(false);
        return;
      }
      
      // Convert Json type to ResearchReport type with type assertion
      const convertedReports = data.map(item => {
        setDebugInfo(prev => `${prev}\nProcessing report ${item.id}: ${item.symbol}`);
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
          const errorMsg = `Report ${item.id} has no report_data!`;
          console.error(errorMsg);
          setDebugInfo(prev => `${prev}\nERROR: ${errorMsg}`);
        }
        
        return {
          ...item,
          report_data: item.report_data as unknown as ResearchReport,
          html_content: item.html_content || null
        };
      }) as SavedReport[];
      
      // More debug
      console.log(`Fetched ${convertedReports.length} reports`);
      setDebugInfo(prev => `${prev}\nSuccessfully processed ${convertedReports.length} reports`);
      
      convertedReports.forEach(report => {
        console.log(`Report ${report.id}: Symbol=${report.symbol}, HTML content: ${report.html_content ? `YES (${report.html_content.length} chars)` : 'NO'}`);
      });
      
      setReports(convertedReports);
    } catch (err) {
      const errorInfo = handleError(err, "fetchReports", "Failed to load saved reports");
      setDebugInfo(`Error: ${errorInfo.message}\nDetails: ${JSON.stringify(errorInfo.details)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteReport = async (reportId: string) => {
    console.log("=== Deleting report ===");
    console.log("Report ID:", reportId);
    setDebugInfo(`Attempting to delete report: ${reportId}`);
    
    try {
      const success = await deleteResearchReport(reportId);
      if (success) {
        console.log("Report deleted successfully, updating state");
        setReports(prevReports => prevReports.filter(report => report.id !== reportId));
        setDebugInfo(prev => `${prev}\nSuccessfully deleted report ${reportId}`);
      } else {
        console.error("Failed to delete report");
        setDebugInfo(prev => `${prev}\nFailed to delete report ${reportId}`);
      }
      return success;
    } catch (err) {
      const errorInfo = handleError(err, "deleteReport", "Failed to delete report");
      setDebugInfo(prev => `${prev}\nError deleting report: ${JSON.stringify(errorInfo)}`);
      return false;
    }
  };

  const saveReport = async (symbol: string, companyName: string, reportData: ResearchReport) => {
    console.log("=== Saving report ===");
    console.log("Symbol:", symbol);
    console.log("Company:", companyName);
    setDebugInfo(`Attempting to save report for: ${symbol} (${companyName})`);
    
    try {
      const reportId = await saveResearchReport(symbol, companyName, reportData);
      console.log("Save result - report ID:", reportId);
      setDebugInfo(prev => `${prev}\nSave result - report ID: ${reportId || 'FAILED'}`);
      
      if (reportId) {
        // Refresh reports list after saving
        console.log("Report saved successfully, refreshing reports list");
        setDebugInfo(prev => `${prev}\nReport saved successfully, refreshing list`);
        await fetchReports();
      } else {
        console.error("Failed to save report - no ID returned");
        setDebugInfo(prev => `${prev}\nFailed to save report - no ID returned`);
      }
      return reportId;
    } catch (err) {
      const errorInfo = handleError(err, "saveReport", "Failed to save report");
      setDebugInfo(prev => `${prev}\nError saving report: ${JSON.stringify(errorInfo)}`);
      return null;
    }
  };

  // Fetch reports when the component mounts or user changes
  useEffect(() => {
    console.log("useSavedReports useEffect - fetching reports");
    fetchReports();
  }, [user]);

  return { 
    reports, 
    isLoading, 
    error, 
    lastError,
    debugInfo, 
    fetchReports, 
    deleteReport, 
    saveReport 
  };
};
