
import { useState } from "react";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { saveResearchReport } from "@/services/api/userContent";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useReportSaving = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const { user } = useAuth();

  /**
   * Auto save a generated report
   */
  const autoSaveReport = async (
    symbol: string,
    companyName: string,
    report: ResearchReport
  ): Promise<string | null> => {
    // Skip if not logged in
    if (!user) {
      console.log("User not logged in, skipping auto-save");
      return null;
    }

    try {
      setIsSaving(true);
      console.log("Auto-saving report for:", symbol);
      
      const reportId = await saveResearchReport(symbol, companyName, report);
      
      if (reportId) {
        console.log("Report auto-saved successfully, ID:", reportId);
        setSavedReportId(reportId);
        toast.success(`Research report for ${symbol} saved to your account`);
      } else {
        console.error("Failed to auto-save report");
      }
      
      return reportId;
    } catch (error) {
      console.error("Error auto-saving report:", error);
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    savedReportId,
    autoSaveReport
  };
};
