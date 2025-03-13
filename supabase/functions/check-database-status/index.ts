
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Gather more detailed diagnostic information
    const diagnosticInfo = {
      status: 'online',
      timestamp: new Date().toISOString(),
      environment: Deno.env.get('ENVIRONMENT') || 'development',
      region: Deno.env.get('REGION') || 'unknown',
      function_version: '1.0.1',
      service_details: {
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
