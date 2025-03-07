
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

    // Now, insert the new report - use type cast to Json
    console.log("Inserting report into database with HTML:", htmlContent ? "YES" : "NO");
    
    const { data, error } = await supabase
      .from("user_research_reports")
      .insert({
        user_id: userId,
        symbol,
        company_name: companyName,
        report_data: reportData as unknown as Json,
        html_content: htmlContent
      })
      .select("id, html_content")
      .single();

    if (error) {
      console.error("Error saving report:", error);
      toast.error("Failed to save report");
      return null;
    }

    console.log("Report saved successfully. ID:", data.id, "HTML content:", data.html_content ? "YES" : "NO");
    toast.success("Research report saved successfully");
    return data.id;
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
    const userId = await getUserId();
    if (!userId) {
      return [];
    }

    const { data, error } = await supabase
      .from("user_research_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user reports:", error);
      toast.error("Failed to load saved reports");
      return [];
    }

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
