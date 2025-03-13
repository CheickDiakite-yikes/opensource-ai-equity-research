
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { Json } from "@/integrations/supabase/types";
import { generateReportHTML } from "./htmlGenerator";
import { getUserId, manageItemLimit, UserContentError } from "./baseService";

/**
 * Save a research report for the current user
 */
export const saveResearchReport = async (
  symbol: string,
  companyName: string,
  reportData: ResearchReport
): Promise<string | null> => {
  try {
    console.log("=== Starting saveResearchReport ===");
    console.log("Symbol:", symbol);
    console.log("Company:", companyName);
    
    const userId = await getUserId();
    if (!userId) {
      toast.error("You must be signed in to save reports");
      return null;
    }
    
    console.log("User ID:", userId);

    // First, count existing reports
    const { count, error: countError } = await supabase
      .from("user_research_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      throw new UserContentError("Error counting reports", "saveResearchReport", countError);
    }

    console.log("Current report count:", count);

    // Manage item limit
    const limitManaged = await manageItemLimit("user_research_reports", userId, count);
    if (!limitManaged) {
      throw new UserContentError("Failed to manage item limit", "saveResearchReport");
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

    // Insert the new report - WITHOUT on conflict
    console.log("Inserting report into database with HTML:", htmlContent ? "YES" : "NO");
    
    // Debug log the full object being inserted (truncated for readability)
    console.log("Report data keys:", Object.keys(reportData));
    
    const insertObject = {
      user_id: userId,
      symbol,
      company_name: companyName,
      report_data: reportData as unknown as Json,
      html_content: htmlContent
    };
    
    // Use simple insert without ON CONFLICT
    const { data, error } = await supabase
      .from("user_research_reports")
      .insert(insertObject)
      .select("id, html_content");

    if (error) {
      throw new UserContentError("Error saving report", "saveResearchReport", error);
    }

    if (!data || data.length === 0) {
      throw new UserContentError("No data returned after saving report", "saveResearchReport");
    }

    console.log("Report saved successfully. ID:", data[0].id, "HTML content:", data[0].html_content ? "YES" : "NO");
    toast.success("Research report saved successfully");
    return data[0].id;
  } catch (error) {
    if (error instanceof UserContentError) {
      console.error(`${error.source}: ${error.message}`, error.details);
      toast.error(error.message);
      return null;
    }
    
    console.error("Unexpected error in saveResearchReport:", error);
    toast.error("An unexpected error occurred while saving report");
    return null;
  }
};

/**
 * Get all saved research reports for the current user
 */
export const getUserResearchReports = async () => {
  try {
    console.log("=== Getting user research reports ===");
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
      throw new UserContentError("Error fetching user reports", "getUserResearchReports", error);
    }

    if (!data || data.length === 0) {
      console.log("No reports found for user");
      return [];
    }

    console.log(`Found ${data.length} reports for user`);
    // Log sample data structure for debugging
    if (data.length > 0) {
      console.log("Sample report data structure:", {
        id: data[0].id,
        symbol: data[0].symbol,
        created_at: data[0].created_at,
        has_html: !!data[0].html_content,
        data_keys: data[0].report_data ? Object.keys(data[0].report_data) : 'no data'
      });
    }
    
    return data || [];
  } catch (error) {
    if (error instanceof UserContentError) {
      console.error(`${error.source}: ${error.message}`, error.details);
      toast.error(error.message);
      return [];
    }
    
    console.error("Unexpected error in getUserResearchReports:", error);
    toast.error("An unexpected error occurred while fetching reports");
    return [];
  }
};

/**
 * Delete a research report by ID
 */
export const deleteResearchReport = async (reportId: string): Promise<boolean> => {
  try {
    console.log("=== Deleting report ===");
    console.log("Report ID:", reportId);
    
    const { error } = await supabase
      .from("user_research_reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      throw new UserContentError("Error deleting report", "deleteResearchReport", error);
    }

    toast.success("Report deleted successfully");
    return true;
  } catch (error) {
    if (error instanceof UserContentError) {
      console.error(`${error.source}: ${error.message}`, error.details);
      toast.error(error.message);
      return false;
    }
    
    console.error("Unexpected error in deleteResearchReport:", error);
    toast.error("An unexpected error occurred while deleting report");
    return false;
  }
};
