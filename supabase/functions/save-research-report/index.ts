import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

/**
 * Edge function to save research reports to the database.
 * This provides a more reliable way to save data and better handles duplicates.
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { userId, symbol, companyName, reportData, htmlContent } = await req.json();
    
    // Validate required parameters
    if (!userId || !symbol || !companyName || !reportData) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters", 
          success: false,
          details: "userId, symbol, companyName, and reportData are required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Saving research report for user ${userId}, symbol ${symbol}`);
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Check for existing reports with the same symbol
    const { data: existingReports, error: queryError } = await supabase
      .from("user_research_reports")
      .select("id")
      .match({ user_id: userId, symbol: symbol })
      .order("created_at", { ascending: false })
      .limit(1);
    
    if (queryError) {
      console.error("Error querying existing reports:", queryError);
      return new Response(
        JSON.stringify({ error: queryError.message, success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    let reportId;
    // If there's an existing report for this symbol, update it
    if (existingReports && existingReports.length > 0) {
      console.log(`Found existing report for ${symbol}, updating it`);
      
      const { data, error } = await supabase
        .from("user_research_reports")
        .update({
          company_name: companyName,
          report_data: reportData,
          html_content: htmlContent,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .eq("id", existingReports[0].id)
        .select("id");
      
      if (error) {
        console.error("Error updating report:", error);
        return new Response(
          JSON.stringify({ error: error.message, success: false }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      reportId = existingReports[0].id;
    } else {
      // Otherwise, insert a new report
      console.log(`Creating new report for ${symbol}`);
      
      const { data, error } = await supabase
        .from("user_research_reports")
        .insert({
          user_id: userId,
          symbol,
          company_name: companyName,
          report_data: reportData,
          html_content: htmlContent,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .select("id");
      
      if (error) {
        console.error("Error inserting report:", error);
        return new Response(
          JSON.stringify({ error: error.message, success: false }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      if (!data || data.length === 0) {
        return new Response(
          JSON.stringify({ error: "No data returned after saving", success: false }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      reportId = data[0].id;
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        id: reportId, 
        success: true, 
        message: "Research report saved successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Unexpected error in save-research-report:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
