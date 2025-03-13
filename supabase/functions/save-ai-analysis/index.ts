
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for browser compatibility
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Edge function to save AI analysis results (reports or predictions) to the database.
 * This function simply inserts new records without any deletion of previous entries.
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Create a Supabase client with the Auth context
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );
    
    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      console.error("Authentication error:", userError);
      return new Response(
        JSON.stringify({ error: "Not authenticated", details: userError?.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }
    
    // Parse the request body
    const { type, symbol, companyName, data } = await req.json();
    
    if (!type || !symbol || !companyName || !data) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters", details: "Type, symbol, companyName, and data are required" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Saving ${type} for ${symbol} (${companyName})`);
    
    let result;
    
    // Save the data based on the type
    if (type === 'report') {
      // Insert the research report
      const { data: reportData, error: reportError } = await supabaseClient
        .from('user_research_reports')
        .insert({
          user_id: user.id,
          symbol: symbol,
          company_name: companyName,
          report_data: data,
          // expires_at is set by default to now() + 7 days in the table definition
        });
      
      if (reportError) {
        throw reportError;
      }
      
      result = { success: true, type: 'report', message: "Research report saved successfully" };
      
    } else if (type === 'prediction') {
      // Insert the price prediction
      const { data: predictionData, error: predictionError } = await supabaseClient
        .from('user_price_predictions')
        .insert({
          user_id: user.id,
          symbol: symbol,
          company_name: companyName,
          prediction_data: data,
          // expires_at is set by default to now() + 7 days in the table definition
        });
      
      if (predictionError) {
        throw predictionError;
      }
      
      result = { success: true, type: 'prediction', message: "Price prediction saved successfully" };
      
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid type", details: "Type must be 'report' or 'prediction'" }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Error saving AI analysis:", error);
    
    return new Response(
      JSON.stringify({ error: "Server error", details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
