import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ResearchReport } from "@/types/ai-analysis/reportTypes";
import { Json } from "@/integrations/supabase/types";
import { getUserId, manageItemLimit, testConnection } from "./baseService";
import { generateHTMLContent } from "./htmlGenerator";

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
    
    // Test connection first to avoid timeouts
    const connectionStatus = await testConnection();
    if (connectionStatus !== 'connected') {
      console.error("Database connection test failed when saving report");
      toast.error("Cannot save report: Database connection error");
      return null;
    }
    
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
      toast.error("Failed to save report: Database error");
      return null;
    }

    console.log("Current report count:", count);

    // Manage item limit
    const limitManaged = await manageItemLimit("user_research_reports", userId, count);
    if (!limitManaged) {
      console.error("Failed to manage item limit");
      toast.error("Failed to save report: Could not manage storage limit");
      return null;
    }

    // Generate HTML content for the report
    console.log("Generating HTML content for report...");
    console.log("Generating HTML content for report", symbol);
    const htmlContent = await generateHTMLContent(reportData);
    console.log("HTML content generated successfully, length:", htmlContent.length);
    console.log("HTML content generated successfully, length:", htmlContent.length);

    // Check if a report with this symbol already exists for this user
    const { data: existingReports, error: findError } = await supabase
      .from("user_research_reports")
      .select("id")
      .eq("user_id", userId)
      .eq("symbol", symbol);
      
    if (findError) {
      console.error("Error checking for existing report:", findError);
      toast.error("Failed to save report: Database error");
      return null;
    }
    
    console.log("Inserting report into database with HTML:", htmlContent ? "YES" : "NO");
    
    // Prepare report data for database
    console.log("Report data sample:", JSON.stringify(reportData).substring(0, 100) + "...");
    
    try {
      let data;
      let error;
      
      // If report exists, update it
      if (existingReports && existingReports.length > 0) {
        console.log("Updating existing report with ID:", existingReports[0].id);
        
        const result = await supabase
          .from("user_research_reports")
          .update({
            report_data: reportData as unknown as Json,
            html_content: htmlContent,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
          .eq("id", existingReports[0].id)
          .select("id");
          
        data = result.data;
        error = result.error;
        
        if (!error) {
          return existingReports[0].id;
        }
      } else {
        // Otherwise insert a new report
        console.log("Inserting new report");
        
        const result = await supabase
          .from("user_research_reports")
          .insert({
            user_id: userId,
            symbol,
            company_name: companyName,
            report_data: reportData as unknown as Json,
            html_content: htmlContent,
          })
          .select("id");
          
        data = result.data;
        error = result.error;
      }
      
      if (error) {
        console.error("Error saving report:", error);
        
        // More specific error message based on error code
        if (error.code === "23505") {
          toast.error("This report already exists. Please try again in a moment.");
        } else if (error.code === "23503") {
          toast.error("Authentication error. Please sign in again.");
        } else if (error.code === "42P01") {
          toast.error("Database configuration error. Please contact support.");
        } else {
          toast.error(`Failed to save report: ${error.message}`);
        }
        return null;
      }

      if (!data || data.length === 0) {
        console.error("No data returned after saving report");
        toast.error("Failed to save report - no data returned");
        return null;
      }

      console.log("Report saved successfully with ID:", data[0].id);
      toast.success("Research report saved successfully");
      return data[0].id;
    } catch (insertError) {
      console.error("Exception during database insert:", insertError);
      toast.error("Failed to save report. Please try again.");
      return null;
    }
  } catch (error) {
    console.error("Error in saveResearchReport:", error);
    toast.error("An unexpected error occurred while saving report");
    return null;
  }
};

/**
 * Get all saved research reports for the current user
 */
export const getUserResearchReports = async () => {
  try {
    console.log("Getting user research reports");
    
    // Test connection first
    const connectionStatus = await testConnection();
    if (connectionStatus !== 'connected') {
      console.error("Database connection test failed when getting reports");
      toast.error("Cannot load reports: Database connection error");
      return [];
    }
    
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
    if (!reportId) {
      console.error("No report ID provided for deletion");
      toast.error("Failed to delete: Missing report ID");
      return false;
    }
    
    // Test connection first
    const connectionStatus = await testConnection();
    if (connectionStatus !== 'connected') {
      console.error("Database connection test failed when deleting report");
      toast.error("Cannot delete report: Database connection error");
      return false;
    }
    
    const { error } = await supabase
      .from("user_research_reports")
      .delete()
      .eq("id", reportId);

    if (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report: " + error.message);
      return false;
    }

    toast.success("Report deleted successfully");
    return true;
  } catch (error) {
    console.error("Error in deleteResearchReport:", error);
    toast.error("An unexpected error occurred while deleting");
    return false;
  }
};
