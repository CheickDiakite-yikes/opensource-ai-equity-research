import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { Json } from "@/integrations/supabase/types";
import { generateReportHTML } from "./htmlGenerator";
import { getUserId, countUserItems, deleteOldestItems } from "./baseService";

/**
 * Save a research report for the current user
 */
export const saveResearchReport = async (
  symbol: string,
  companyName: string,
  reportData: ResearchReport
): Promise<string | null> => {
  try {
    console.log("Starting saveResearchReport for:", symbol);
    const userId = await getUserId();
    if (!userId) {
      console.error("No user ID found when saving report");
      toast.error("You must be signed in to save reports");
      return null;
    }
    
    console.log("User ID:", userId);

    // First, count existing reports
    const currentCount = await countUserItems("user_research_reports", userId);
    console.log("Current report count:", currentCount);

    // Delete oldest reports if over limit
    if (currentCount >= 10) {
      const deleted = await deleteOldestItems("user_research_reports", userId, currentCount);
      if (!deleted) {
        console.error("Failed to delete oldest reports");
        toast.error("Failed to save report - couldn't manage report limit");
        return null;
      }
    }

    // Generate HTML version of the report
    console.log("Generating HTML content for report...");
    let htmlContent = null;
    
    try {
      // Make sure the reportData has all needed properties
      const enhancedReportData = {
        ...reportData,
        symbol: symbol,
        companyName: companyName
      };
      
      htmlContent = generateReportHTML(enhancedReportData);
      
      // Validate the generated HTML
      if (!htmlContent || htmlContent.length < 100) {
        console.warn("Generated HTML is too short or empty, length:", htmlContent?.length);
        htmlContent = null;
      } else {
        console.log("HTML content generated successfully, length:", htmlContent.length);
      }
    } catch (htmlError) {
      console.error("Error generating HTML content:", htmlError);
    }

    // Now, insert the new report - use type cast to Json
    console.log("Inserting report into database with HTML:", htmlContent ? "YES" : "NO");
    console.log("Report data sample:", JSON.stringify(reportData).substring(0, 200) + "...");
    
    const { data, error } = await supabase
      .from("user_research_reports")
      .insert({
        user_id: userId,
        symbol,
        company_name: companyName,
        report_data: reportData as unknown as Json,
        html_content: htmlContent
      })
      .select("id, html_content");

    if (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report: " + error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.error("No data returned after saving report");
      toast.error("Failed to save report - no data returned");
      return null;
    }

    console.log("Report saved successfully. ID:", data[0].id, "HTML content:", data[0].html_content ? "YES" : "NO");
    toast.success("Research report saved successfully");
    return data[0].id;
  } catch (error) {
    console.error("Error in saveResearchReport:", error);
    toast.error("An unexpected error occurred");
    return null;
  }
};

/**
 * Get all saved research reports for the current user
 */
export const getUserResearchReports = async () => {
  try {
    console.log("Getting user research reports");
    const userId = await getUserId();
    if (!userId) {
      console.log("No user ID found when getting reports");
      return [];
    }

    console.log("Fetching reports for user:", userId);
    const { data, error } = await supabase
      .from("user_research_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user reports:", error);
      toast.error("Failed to load saved reports: " + error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log("No reports found for user");
      return [];
    }

    console.log(`Found ${data.length} reports for user`);
    return data || [];
  } catch (error) {
    console.error("Error in getUserResearchReports:", error);
    toast.error("An unexpected error occurred");
    return [];
  }
};

/**
 * Delete a research report by ID
 */
export const deleteResearchReport = async (reportId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("user_research_reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
      return false;
    }

    toast.success("Report deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteResearchReport:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};
