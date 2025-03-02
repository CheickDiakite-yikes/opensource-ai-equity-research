
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

// Define types for the response
interface ReportSection {
  title: string;
  content: string;
}

interface ResearchReport {
  symbol: string;
  companyName: string;
  date: string;
  recommendation: string;
  targetPrice: string;
  summary: string;
  sections: ReportSection[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { reportRequest } = await req.json();
    
    if (!reportRequest || !reportRequest.symbol) {
      throw new Error('Missing required parameters');
    }
    
    console.log(`Generating research report for ${reportRequest.symbol}`);
    
    // In a real scenario, here we would call an AI model or other analysis service
    // For now, we'll generate a realistic-looking mock report
    const report: ResearchReport = {
      symbol: reportRequest.symbol,
      companyName: reportRequest.companyName || reportRequest.symbol,
      date: new Date().toISOString().split('T')[0],
      recommendation: generateRecommendation(),
      targetPrice: generateTargetPrice(reportRequest.stockData?.price || 100),
      summary: generateSummary(reportRequest),
      sections: generateReportSections(reportRequest)
    };
    
    return new Response(JSON.stringify(report), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error generating research report:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

// Helper functions to generate report content
function generateRecommendation(): string {
  const recommendations = ['Buy', 'Strong Buy', 'Hold', 'Sell', 'Strong Sell'];
  const weights = [0.4, 0.3, 0.2, 0.05, 0.05]; // Weighted towards positive recommendations
  
  let random = Math.random();
  for (let i = 0; i < weights.length; i++) {
    if (random < weights[i]) {
      return recommendations[i];
    }
    random -= weights[i];
  }
  return recommendations[0];
}

function generateTargetPrice(currentPrice: number): string {
  // Generate a target price that's +/- 30% of current price
  const change = (Math.random() * 0.6) - 0.3;
  const targetPrice = currentPrice * (1 + change);
  return `$${targetPrice.toFixed(2)}`;
}

function generateSummary(reportRequest: any): string {
  const { companyName, sector, industry } = reportRequest;
  return `${companyName} is a leading company in the ${sector || 'technology'} sector, specifically within the ${industry || 'software'} industry. Based on our comprehensive analysis of the company's financial performance, market position, and growth prospects, we have issued a ${generateRecommendation()} recommendation. The company has demonstrated solid financial performance, with potential for continued growth in its core markets. Investors should consider this stock as part of a diversified portfolio, taking into account the specific risk factors outlined in this report.`;
}

function generateReportSections(reportRequest: any): ReportSection[] {
  const { symbol, companyName } = reportRequest;
  
  return [
    {
      title: "Investment Thesis",
      content: `Our investment thesis for ${companyName} is based on the company's strong market position, innovative product pipeline, and solid financial foundation. The company has consistently demonstrated its ability to adapt to changing market conditions while maintaining profitability and market share. We believe that ${companyName} is well-positioned to capitalize on emerging opportunities in its industry, potentially driving significant shareholder value over our investment horizon.`
    },
    {
      title: "Business Overview",
      content: `${companyName} operates primarily in the ${reportRequest.industry || 'technology'} industry. The company's primary products and services include [specific products/services]. Key markets include [geographic regions], with significant growth potential in [emerging markets]. The company faces competition from [key competitors], but maintains competitive advantages through [technological innovation/scale/brand recognition/etc.].`
    },
    {
      title: "Financial Analysis",
      content: `${companyName} has demonstrated [strong/stable/concerning] financial performance over the past several years. Revenue has grown at a CAGR of approximately [x]%, while profitability metrics indicate [improving/stable/declining] operational efficiency. The company's balance sheet shows [strong/moderate/concerning] liquidity with a debt-to-equity ratio of [x]. Key financial strengths include [high profit margins/strong cash flow/etc.], while areas of concern include [high capex requirements/volatile earnings/etc.].`
    },
    {
      title: "Valuation",
      content: `Based on our discounted cash flow (DCF) analysis and comparable company analysis, we believe ${companyName} is currently [undervalued/fairly valued/overvalued]. Our target price of [target price] represents a [premium/discount] to the current market price. This valuation is based on projected revenue growth of [x]% over the next five years, with operating margins expected to [improve/remain stable/decline] to [x]% by year five. Key valuation metrics include a forward P/E of [x], EV/EBITDA of [y], and PEG ratio of [z].`
    },
    {
      title: "Risk Factors",
      content: `Key risks to our investment thesis include: 1) Increased competition in core markets, potentially pressuring margins; 2) Regulatory challenges, particularly regarding [specific regulations]; 3) Technological disruption that could impact the company's existing product portfolio; 4) Macroeconomic headwinds, including inflation and interest rate fluctuations; 5) Execution risks related to the company's growth initiatives and strategic plans.`
    },
    {
      title: "ESG Considerations",
      content: `${companyName}'s environmental, social, and governance (ESG) profile is [strong/average/below average] compared to industry peers. Environmental initiatives include [specific initiatives], while social responsibility is demonstrated through [specific programs]. The governance structure is [well-established/in need of improvement], with [strong/weak] board independence and [aligned/misaligned] executive compensation structures.`
    }
  ];
}
