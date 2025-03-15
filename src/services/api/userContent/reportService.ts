
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { Json } from "@/integrations/supabase/types";
import { generateReportHTML } from "./htmlGenerator";
import { getUserId, countUserItems, deleteOldestItems, MAX_SAVED_ITEMS } from "./baseService";

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
    
    // Get the current user ID
    const userId = await getUserId();
    
    if (!userId) {
      console.error("No user ID found");
      toast.error("You must be signed in to save reports");
      return null;
    }
    
    console.log("Using user ID:", userId);

    // Count existing reports
    const currentCount = await countUserItems("user_research_reports", userId);
    console.log("Current report count:", currentCount);

    // Delete oldest reports if over limit
    if (currentCount >= MAX_SAVED_ITEMS) {
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

    // First, check if a report with this user_id and symbol already exists
    console.log("Checking for existing report...");
    const { data: existingData, error: existingError } = await supabase
      .from("user_research_reports")
      .select("id")
      .eq("user_id", userId)
      .eq("symbol", symbol)
      .maybeSingle();

    if (existingError) {
      console.error("Error checking for existing report:", existingError);
      toast.error("Failed to save report: " + existingError.message);
      return null;
    }

    let result;

    if (existingData) {
      // Update existing report
      console.log("Updating existing report ID:", existingData.id);
      const { data, error } = await supabase
        .from("user_research_reports")
        .update({
          company_name: companyName,
          report_data: reportData as unknown as Json,
          html_content: htmlContent,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingData.id)
        .select("id, html_content");

      if (error) {
        console.error("Error updating report:", error);
        toast.error("Failed to update report: " + error.message);
        return null;
      }
      
      result = data;
    } else {
      // Insert new report
      console.log("Inserting new report for user:", userId);
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
      
      result = data;
    }

    if (!result || result.length === 0) {
      console.error("No data returned after saving report");
      toast.error("Failed to save report - no data returned");
      return null;
    }

    console.log("Report saved successfully. ID:", result[0].id, "HTML content:", result[0].html_content ? "YES" : "NO");
    toast.success("Research report saved successfully");
    return result[0].id;
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
    
    // Get the current user ID
    const userId = await getUserId();
    
    if (!userId) {
      console.log("No user ID found");
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
    // Get the current user ID to ensure the user is authenticated
    const userId = await getUserId();
    
    if (!userId) {
      console.error("No user ID found");
      toast.error("You must be signed in to delete reports");
      return false;
    }
    
    const { error } = await supabase
      .from("user_research_reports")
      .delete()
      .eq("id", reportId)
      .eq("user_id", userId); // Ensure users can only delete their own reports

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
