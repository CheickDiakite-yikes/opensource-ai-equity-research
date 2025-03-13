
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.36.0'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Test database connection with a simple query
    const startTime = performance.now();
    const { error: testError } = await supabase.from('_schema').select('*').limit(1);
    const endTime = performance.now();
    const latency = Math.round(endTime - startTime);
    
    // Check service status function if available
    let serviceStatus = null;
    try {
      const { data: statusData, error: statusError } = await supabase.rpc('get_service_status');
      if (!statusError) {
        serviceStatus = statusData;
      }
    } catch (statusCheckError) {
      console.error('Error checking service status:', statusCheckError);
    }
    
    // Gather more detailed diagnostic information
    const diagnosticInfo = {
      status: testError ? 'error' : 'online',
      timestamp: new Date().toISOString(),
      environment: Deno.env.get('ENVIRONMENT') || 'development',
      region: Deno.env.get('REGION') || 'unknown',
      function_version: '1.0.2',
      connection: {
        success: !testError,
        latency: latency,
        error: testError ? testError.message : null
      },
      service_details: serviceStatus,
      service_info: {
        memory_usage: Deno.memoryUsage(),
        uptime_ms: performance.now(),
      }
    }

    return new Response(
      JSON.stringify(diagnosticInfo),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in check-database-status function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: 'error',
        timestamp: new Date().toISOString()
      }),
      { 
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500 
      }
    )
  }
})
