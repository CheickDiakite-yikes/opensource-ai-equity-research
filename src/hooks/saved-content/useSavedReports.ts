
import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useSavedContentBase } from "./useSavedContentBase";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { saveResearchReport, getUserResearchReports, deleteResearchReport } from "@/services/api/userContent";

export type SavedReport = {
  id: string;
  symbol: string;
  company_name: string;
  created_at: string;
  report_data: ResearchReport;
  html_content?: string | null;
  user_id: string;
  updated_at?: string;
  expires_at?: string | null;
};

export const useSavedReports = () => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const { user, isLoading, setIsLoading, isRefreshing, setIsRefreshing, error, setError, checkUserLoggedIn } = useSavedContentBase();

  const fetchReports = useCallback(async () => {
    const isLoggedIn = await checkUserLoggedIn();
    if (!isLoggedIn) return;

    try {
      setIsRefreshing(true);
      const reportsList = await getUserResearchReports();
      console.log(`Fetched ${reportsList.length} reports`);
      setReports(reportsList as unknown as SavedReport[]);
    } catch (err: any) {
      console.error("Error fetching reports:", err);
      setError(err.message || "Failed to load saved reports");
      toast.error("Could not load your saved reports");
    } finally {
      setIsRefreshing(false);
    }
  }, [checkUserLoggedIn, setIsRefreshing, setError]);

  const saveReport = useCallback(async (
    symbol: string,
    companyName: string,
    reportData: ResearchReport
  ): Promise<string | null> => {
    const isLoggedIn = await checkUserLoggedIn();
    if (!isLoggedIn) return null;

    try {
      setIsLoading(true);
      const reportId = await saveResearchReport(symbol, companyName, reportData);
      if (reportId) {
        toast.success("Report saved successfully");
        fetchReports();
      }
      return reportId;
    } catch (err: any) {
      console.error("Error saving report:", err);
      toast.error("Could not save report: " + (err.message || "Unknown error"));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [checkUserLoggedIn, fetchReports, setIsLoading]);

  const deleteReport = useCallback(async (reportId: string): Promise<boolean> => {
    const isLoggedIn = await checkUserLoggedIn();
    if (!isLoggedIn) return false;

    try {
      setIsLoading(true);
      const success = await deleteResearchReport(reportId);
      if (success) {
        toast.success("Report deleted successfully");
        setReports(prevReports => prevReports.filter(r => r.id !== reportId));
      }
      return success;
    } catch (err: any) {
      console.error("Error deleting report:", err);
      toast.error("Could not delete report: " + (err.message || "Unknown error"));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [checkUserLoggedIn, setIsLoading]);

  return {
    reports,
    isLoading,
    isRefreshing,
    error,
    fetchReports,
    saveReport,
    deleteReport
  };
};
