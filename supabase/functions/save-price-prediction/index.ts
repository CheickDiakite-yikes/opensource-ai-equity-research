
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
    
    // Check for existing predictions with the same symbol
    const { data: existingPredictions, error: queryError } = await supabase
      .from("user_price_predictions")
      .select("id")
      .eq("user_id", userId)
      .eq("symbol", symbol)
      .limit(1);
    
    if (queryError) {
      console.error("Error querying existing predictions:", queryError);
      return new Response(
        JSON.stringify({ error: queryError.message, success: false }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    let predictionId;
    // If there's an existing prediction for this symbol, update it
    if (existingPredictions && existingPredictions.length > 0) {
      console.log(`Found existing prediction for ${symbol}, updating it`);
      
      const { data, error } = await supabase
        .from("user_price_predictions")
        .update({
          company_name: companyName,
          prediction_data: predictionData,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .eq("id", existingPredictions[0].id)
        .select("id")
        .single();
      
      if (error) {
        console.error("Error updating prediction:", error);
        return new Response(
          JSON.stringify({ error: error.message, success: false }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      
      predictionId = existingPredictions[0].id;
    } else {
      // Otherwise, insert a new prediction
      console.log(`Creating new prediction for ${symbol}`);
      
      const { data, error } = await supabase
        .from("user_price_predictions")
        .insert({
          user_id: userId,
          symbol,
          company_name: companyName,
          prediction_data: predictionData,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        })
        .select("id")
        .single();
      
      if (error) {
        console.error("Error inserting prediction:", error);
        return new Response(
          JSON.stringify({ error: error.message, success: false }),
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
      
      predictionId = data.id;
    }
    
    // Return success response
    return new Response(
      JSON.stringify({ 
        id: predictionId, 
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
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
