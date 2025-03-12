
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { Json } from "@/integrations/supabase/types";
import { generateReportHTML } from "./htmlGenerator";
import { getUserId, manageItemLimit } from "./baseService";

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

    // First, check if this user already has a report for this symbol
    const { data: existingReports, error: checkError } = await supabase
      .from("user_research_reports")
      .select("id")
      .eq("user_id", userId)
      .eq("symbol", symbol)
      .limit(1);
      
    if (checkError) {
      console.error("Error checking existing reports:", checkError);
      toast.error("Failed to check existing reports");
      return null;
    }
    
    const existingReportId = existingReports && existingReports.length > 0 ? existingReports[0].id : null;
    
    // If we're not updating an existing report, check the total count and manage limit
    if (!existingReportId) {
      // Get current count of user's reports
      const { count: totalCount, error: countError } = await supabase
        .from("user_research_reports")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (countError) {
        console.error("Error counting reports:", countError);
        toast.error("Failed to save report");
        return null;
      }

      console.log("Current report count:", totalCount);

      // Manage item limit - delete oldest if over limit
      const limitManaged = await manageItemLimit("user_research_reports", userId, totalCount);
      if (!limitManaged) {
        console.error("Failed to manage item limit");
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

    // Prepare report data
    const reportInfo = {
      user_id: userId,
      symbol,
      company_name: companyName,
      report_data: reportData as unknown as Json,
      html_content: htmlContent,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    let newReportId = null;
    
    // Insert or update based on whether report exists
    if (existingReportId) {
      console.log("Updating existing report with ID:", existingReportId);
      
      const { error } = await supabase
        .from("user_research_reports")
        .update(reportInfo)
        .eq("id", existingReportId);
        
      if (error) {
        console.error("Error updating report:", error);
        toast.error("Failed to update report: " + error.message);
        return null;
      }
      
      newReportId = existingReportId;
    } else {
      console.log("Inserting new report");
      
      const { data, error } = await supabase
        .from("user_research_reports")
        .insert(reportInfo)
        .select();
        
      if (error) {
        console.error("Error saving report:", error);
        toast.error("Failed to save report: " + error.message);
        return null;
      }
      
      if (data && data.length > 0) {
        newReportId = data[0].id;
      }
    }

    if (!newReportId) {
      console.error("No report ID returned after save operation");
      toast.error("Failed to save report - no ID returned");
      return null;
    }

    console.log("Report saved successfully. ID:", newReportId);
    toast.success(existingReportId ? "Research report updated successfully" : "Research report saved successfully");
    return newReportId;
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
    console.log("Deleting report with ID:", reportId);
    const { error } = await supabase
      .from("user_research_reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report: " + error.message);
      return false;
    }

    console.log("Report deleted successfully");
    toast.success("Report deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteResearchReport:", error);
    toast.error("An unexpected error occurred");
    return false;
  }
};
