
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

    // First, count existing reports
    const { count, error: countError } = await supabase
      .from("user_research_reports")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    if (countError) {
      console.error("Error counting reports:", countError);
      toast.error("Failed to save report");
      return null;
    }

    console.log("Current report count:", count);

    // Manage item limit
    const limitManaged = await manageItemLimit("user_research_reports", userId, count);
    if (!limitManaged) {
      console.error("Failed to manage item limit");
      return null;
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

    // Check if report for this symbol already exists
    const { data: existingReports, error: checkError } = await supabase
      .from("user_research_reports")
      .select("id")
      .match({ user_id: userId, symbol: symbol });
      
    if (checkError) {
      console.error("Error checking for existing report:", checkError);
      toast.error("Failed to save report");
      return null;
    }
    
    let reportId = null;
    
    if (existingReports && existingReports.length > 0) {
      // Update existing report
      console.log("Updating existing report for", symbol);
      const { data, error: updateError } = await supabase
        .from("user_research_reports")
        .update({
          company_name: companyName,
          report_data: reportData as unknown as Json,
          html_content: htmlContent,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .eq("id", existingReports[0].id)
        .select("id, html_content");
        
      if (updateError) {
        console.error("Error updating report:", updateError);
        toast.error("Failed to update report: " + updateError.message);
        return null;
      }
      
      reportId = existingReports[0].id;
      console.log("Report updated successfully. ID:", reportId);
      toast.success("Research report updated successfully");
    } else {
      // Insert new report
      console.log("Inserting new report into database");
      const { data, error: insertError } = await supabase
        .from("user_research_reports")
        .insert({
          user_id: userId,
          symbol,
          company_name: companyName,
          report_data: reportData as unknown as Json,
          html_content: htmlContent
        })
        .select("id, html_content");
        
      if (insertError) {
        console.error("Error saving report:", insertError);
        toast.error("Failed to save report: " + insertError.message);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.error("No data returned after saving report");
        toast.error("Failed to save report - no data returned");
        return null;
      }
      
      reportId = data[0].id;
      console.log("Report saved successfully. ID:", reportId, "HTML content:", data[0].html_content ? "YES" : "NO");
      toast.success("Research report saved successfully");
    }
    
    return reportId;
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
