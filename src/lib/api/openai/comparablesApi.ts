
/**
 * OpenAI API for comparable companies analysis
 */

import { toast } from "sonner";
import { ComparablesRequest, ComparablesResponse } from "@/types/comparables";
import { callOpenAI } from "./apiUtils";

/**
 * Generate comparable companies analysis
 */
export async function generateComparablesAnalysis(
  request: ComparablesRequest
): Promise<ComparablesResponse> {
  try {
    // Build system prompt
    const systemPrompt = `You are an expert financial analyst specializing in comparable companies analysis.
Your task is to analyze the provided company data and generate a comprehensive comparable companies analysis.
You will be given a company symbol, its sector, industry, and a list of peer companies.
Use this information to create a detailed comparable companies table with key financial metrics and valuation multiples.

The analysis should include:
1. Market data: Price, Market Cap, Enterprise Value (TEV)
2. Financial data: Revenue, EBITDA, EBIT, Net Income
3. Valuation multiples: EV/Sales, EV/EBITDA, EV/EBIT, P/E
4. Averages and medians for all multiples

You must return the data in a structured JSON format that can be used to build a table.`;

    // Build user prompt
    const userPrompt = `Generate a comparable companies analysis for:
    
Company Symbol: ${request.symbol}
Sector: ${request.sector || 'N/A'}
Industry: ${request.industry || 'N/A'}
Peer Companies: ${request.peers ? request.peers.join(', ') : 'N/A'}

Please provide all the necessary financial and valuation data in JSON format with the following structure:

{
  "mainCompany": {
    "symbol": "MAIN",
    "name": "Main Company Name",
    "price": 100,
    "marketCap": 1000000000,
    "enterpriseValue": 1200000000,
    "revenue": 500000000,
    "ebitda": 100000000,
    "ebit": 80000000,
    "netIncome": 60000000,
    "evToSales": 2.4,
    "evToEbitda": 12.0,
    "evToEbit": 15.0,
    "peRatio": 16.7
  },
  "comparables": [
    {
      "symbol": "COMP1",
      "name": "Comparable Company 1",
      "price": 50,
      "marketCap": 500000000,
      "enterpriseValue": 600000000,
      "revenue": 250000000,
      "ebitda": 50000000,
      "ebit": 40000000,
      "netIncome": 30000000,
      "evToSales": 2.4,
      "evToEbitda": 12.0,
      "evToEbit": 15.0,
      "peRatio": 16.7
    }
  ],
  "averages": {
    "evToSales": 2.4,
    "evToEbitda": 12.0,
    "evToEbit": 15.0,
    "peRatio": 16.7
  },
  "medians": {
    "evToSales": 2.4,
    "evToEbitda": 12.0,
    "evToEbit": 15.0,
    "peRatio": 16.7
  }
}

Use actual financial data if available, otherwise provide reasonable estimates based on industry standards.`;

    // Call OpenAI API with the correct model and parameters for o3-mini
    const completion = await callOpenAI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], "high"); // Using high reasoning effort for financial analysis

    const resultText = completion.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = resultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse OpenAI response as JSON");
    }
    
    const comparablesData = JSON.parse(jsonMatch[0]);
    return comparablesData as ComparablesResponse;
  } catch (error) {
    console.error("Error generating comparables analysis:", error);
    toast.error("Failed to generate comparables analysis");
    throw error;
  }
}
