
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

/**
 * Edge function to save price predictions to the database.
 * This provides a more reliable way to save data and better handles duplicates.
 */
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { userId, symbol, companyName, predictionData } = await req.json();
    
    // Validate required parameters
    if (!userId || !symbol || !companyName || !predictionData) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required parameters", 
          success: false,
          details: "userId, symbol, companyName, and predictionData are required"
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Saving price prediction for user ${userId}, symbol ${symbol}`);
    
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Step 1: Delete any existing predictions for this user and symbol combination
    const { error: deleteError } = await supabase
      .from("user_price_predictions")
      .delete()
      .eq("user_id", userId)
      .eq("symbol", symbol);
    
    if (deleteError) {
      console.error("Error deleting existing predictions:", deleteError);
      return new Response(
        JSON.stringify({ error: deleteError.message, success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    console.log(`Deleted any existing predictions for ${symbol}, now creating a new one`);
    
    // Calculate expiration date (30 days from now)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    
    // Step 2: Insert a new prediction with explicitly listed columns
    const { data, error } = await supabase
      .from("user_price_predictions")
      .insert({
        user_id: userId,
        symbol: symbol,
        company_name: companyName,
        prediction_data: predictionData,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      })
      .select("id")
      .single();
    
    if (error) {
      console.error("Error inserting prediction:", error);
      return new Response(
        JSON.stringify({ 
          error: error.message, 
          code: error.code,
          details: error.details,
          hint: error.hint,
          success: false 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    if (!data) {
      return new Response(
        JSON.stringify({ error: "No data returned after saving", success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        id: data.id, 
        success: true, 
        message: "Price prediction saved successfully" 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error("Unexpected error in save-price-prediction:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        stack: error.stack,
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
