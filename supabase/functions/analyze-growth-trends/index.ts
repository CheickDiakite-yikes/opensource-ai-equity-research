// @filename: index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
    })
  }

  try {
    const { symbol, transcriptData, filingData } = await req.json()
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Missing required symbol parameter' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Prepare content for analysis
    let analysisContent = ''
    let contextInfo = `Analyzing growth trends for ${symbol}.\n\n`

    // Add transcript data if available
    if (transcriptData && transcriptData.content) {
      contextInfo += `Earnings Call Date: ${transcriptData.date}\n`
      contextInfo += `Quarter: ${transcriptData.quarter} ${transcriptData.year}\n\n`
      analysisContent += `EARNINGS CALL TRANSCRIPT:\n${transcriptData.content}\n\n`
    }

    // Add filing data or reference if available
    if (filingData) {
      contextInfo += `SEC Filing: ${filingData.form} filed on ${filingData.filingDate}\n`
      contextInfo += `Filing type: ${filingData.type}\n\n`
      
      // If we have filing content directly, use it
      if (filingData.content) {
        analysisContent += `SEC FILING CONTENT:\n${filingData.content}\n\n`
      } else {
        // Otherwise just reference the URL
        analysisContent += `SEC FILING available at ${filingData.url}\n\n`
      }
    }

    // If we don't have enough content to analyze, return an empty result
    if (analysisContent.length < 100) {
      console.log(`Insufficient content to analyze for ${symbol}`)
      return new Response(
        JSON.stringify({ insights: [] }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Prepare system prompt for the OpenAI API
    const systemPrompt = `
      You are a financial analyst specializing in growth trend analysis.
      Your task is to analyze the provided earnings call transcript and/or SEC filing content 
      to identify factors related to the company's future growth prospects.
      
      Specifically focus on:
      1. Forward-looking statements about revenue or earnings growth
      2. Management's commentary on growth strategies
      3. Analyst questions about future growth or expansion
      4. Risks or challenges mentioned that could impact growth
      5. New product or market opportunities mentioned
      
      ${contextInfo}
      
      Provide your analysis as a list of 4-7 concise, insightful bullet points.
      Each insight should be classified as one of:
      - "positive" (growth opportunity or strength)
      - "risk" (potential challenge to growth)
      - "neutral" (important but neither clearly positive nor negative)
      
      Format your response as a JSON array with each insight having "type" and "content" fields.
    `

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: analysisContent
          }
        ],
        temperature: 0.2, // Lower temperature for more consistent results
        max_tokens: 1000,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      throw new Error(`OpenAI API error: ${error}`)
    }

    const result = await response.json()
    const analysisText = result.choices[0].message.content.trim()
    
    // Parse the JSON from the response
    let insights = []
    try {
      // Extract JSON array if it's embedded in other text
      const jsonMatch = analysisText.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        insights = JSON.parse(jsonMatch[0])
      } else {
        // Try parsing the whole response as JSON
        insights = JSON.parse(analysisText)
      }
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error)
      console.log('Raw response:', analysisText)
      
      // Fallback: Try to manually extract insights
      const lines = analysisText.split('\n').filter(line => line.trim().length > 0)
      insights = lines.map(line => {
        // Try to determine type from line content
        let type = 'neutral'
        if (line.toLowerCase().includes('risk') || line.toLowerCase().includes('challenge') || line.toLowerCase().includes('concern')) {
          type = 'risk'
        } else if (line.toLowerCase().includes('opportunity') || line.toLowerCase().includes('growth') || line.toLowerCase().includes('positive')) {
          type = 'positive'
        }
        
        return {
          type,
          content: line.replace(/^[•\-\*]\s*/, '') // Remove bullet points
        }
      })
    }

    // Return the insights
    return new Response(
      JSON.stringify({ insights }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in analyze-growth-trends function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
