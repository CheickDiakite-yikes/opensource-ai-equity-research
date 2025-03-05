
import { ResearchReport } from "./reportTypes.ts";
import { formatLargeNumber } from "./dataFormatter.ts";
import { createFallbackReport, ensureCompleteReportStructure, createDefaultSections, enhanceSectionContent } from "./fallbackReportGenerator.ts";
import { API_BASE_URLS, OPENAI_MODELS } from "../constants.ts";

// Extract JSON from text response (handles when GPT wraps JSON in markdown code blocks)
export function extractJSONFromText(text: string) {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Continue to next attempt
  }
  
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch && jsonMatch[1]) {
    try {
      return JSON.parse(jsonMatch[1]);
    } catch (e) {
      console.error("Failed to parse extracted JSON:", e);
    }
  }
  
  const possibleJson = text.match(/\{[\s\S]*\}/);
  if (possibleJson) {
    try {
      return JSON.parse(possibleJson[0]);
    } catch (e) {
      console.error("Failed to parse possible JSON:", e);
    }
  }
  
  throw new Error("Could not extract valid JSON from response");
}

// Generate report using OpenAI
export async function generateReportWithOpenAI(data: any, reportRequest: any, openAIApiKey: string) {
  const { reportType, symbol, companyName } = reportRequest;
  
  const systemPrompt = `You are an expert financial analyst tasked with creating a detailed, professional equity research report for ${companyName} (${symbol}). 
Your report should meet the standards of major investment banks and research firms, with thorough analysis and substantial content in each section.

Based on the report type "${reportType}", emphasize:
${reportType === 'comprehensive' ? '- A balanced, in-depth analysis of all aspects including financials, growth, valuation, and risks, with detailed metrics and industry comparisons.' : ''}
${reportType === 'financial' ? '- Deep financial analysis with extensive ratio analysis, cash flow sustainability assessment, balance sheet strength, and capital structure evaluation.' : ''}
${reportType === 'valuation' ? '- Detailed valuation using multiple methodologies (DCF, multiples) with sensitivity analysis, fair value derivation, and comprehensive target price justification.' : ''}

Structure your report with these detailed sections:
1. Investment Thesis - Key reasons for the recommendation (at least 300 words)
2. Business Overview - Comprehensive company overview including business model, segments, competitive landscape (at least 300 words)
3. Financial Analysis - In-depth assessment of financial performance with multiple metrics and trends (at least 500 words)
   - Include detailed analysis of:
     - Revenue growth trends and drivers by segment/geography if available
     - Margin analysis (gross, operating, EBITDA, net) with industry comparisons
     - Return metrics (ROE, ROA, ROIC) and capital allocation efficiency
     - Cash flow analysis and conversion rates
     - Balance sheet strength (debt ratios, coverage ratios, liquidity)
     - Profitability trends and forecast
     - Key financial ratios compared to industry benchmarks
     - Capital structure assessment and optimization potential
4. Valuation - Thorough analysis using multiple methods with detailed justification (at least 300 words)
5. Risk Factors - Comprehensive risk assessment categorized by type (at least 300 words)
6. ESG Considerations - Detailed analysis of environmental, social, and governance factors (at least 200 words)

Your report MUST include:
- Clear, professional recommendation (Strong Buy, Buy, Hold, Sell, or Strong Sell)
- Well-justified target price with methodology explanation
- Detailed executive summary that captures all key points
- Data-driven analysis in each section with specific metrics, figures, and industry comparisons
- Rating details covering multiple business aspects
- Scenario analysis with bull, base, and bear cases
- Comprehensive growth catalysts and inhibitors
- Each section MUST have extensive, professional content; this is CRITICALLY important

Output in JSON format exactly matching the ResearchReport interface with all required fields and detailed content in each section.`;

  const userPrompt = `Create a professional, detailed equity research report for:

COMPANY INFORMATION:
Symbol: ${data.symbol}
Name: ${data.companyName}
Industry: ${data.industry}
Sector: ${data.sector}
Description: ${data.description}
Current Price: $${data.currentPrice}
Market Cap: $${formatLargeNumber(data.marketCap)}
P/E Ratio: ${data.pe}

FINANCIAL HIGHLIGHTS:
${JSON.stringify(data.financialSummary, null, 2)}

RECENT NEWS:
${JSON.stringify(data.newsSummary, null, 2)}

PEER COMPANIES:
${data.peers?.join(", ") || "Major industry competitors"}

Create a comprehensive, professional research report including:
1. Clear investment recommendation with thorough justification
2. Well-supported target price based on fundamental analysis
3. Detailed executive summary covering all key points
4. Extensive analysis in each required section (at least 300-500 words per section)
5. Comprehensive rating details across multiple business aspects
6. Detailed scenario analysis with price targets and probabilities
7. Thorough growth catalysts and risks assessment with timeline

FOR THE FINANCIAL ANALYSIS SECTION:
- Analyze at least 5 key financial metrics in detail (revenue, margins, profitability, debt, cash flow)
- Compare current performance against historical trends (minimum 3-year lookback)
- Provide industry benchmarking for each key metric
- Assess sustainability of current financial performance
- Identify key drivers of future financial performance
- Include a minimum of 3 specific financial ratios with interpretation
- Provide forward-looking financial projections with clear assumptions
- Analyze capital allocation strategy and efficiency
- Assess balance sheet strength and flexibility
- Evaluate cash flow generation and reinvestment needs

Your report should match the quality and depth of professional equity research from major investment banks.`;

  try {
    console.log("Sending request to OpenAI for professional research report generation...");
    
    const response = await fetch(API_BASE_URLS.OPENAI + "/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAIApiKey}`
      },
      body: JSON.stringify({
        model: OPENAI_MODELS.DEFAULT,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
        max_tokens: 4500
      })
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error("OpenAI API error:", responseData);
      throw new Error(`OpenAI API error: ${responseData.error?.message || "Unknown error"}`);
    }

    const content = responseData.choices?.[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content in OpenAI response");
    }

    console.log("Received response from OpenAI, processing...");

    try {
      const reportData = extractJSONFromText(content);
      
      console.log("Extracted JSON from OpenAI response, validating report structure...");
      console.log("Report has sections:", reportData.sections?.length || 0);
      
      const finalReport: ResearchReport = {
        symbol: data.symbol,
        companyName: data.companyName,
        date: new Date().toISOString().split('T')[0],
        recommendation: reportData.recommendation || "Hold",
        targetPrice: reportData.targetPrice || `$${(data.currentPrice * 1.1).toFixed(2)}`,
        summary: reportData.summary || reportData.executive_summary || "",
        sections: reportData.sections && reportData.sections.length > 0 
          ? reportData.sections.map(section => ({
              title: section.title || "Analysis",
              content: section.content || "Content unavailable"
            }))
          : createDefaultSections(data),
        
        ratingDetails: reportData.ratingDetails ? {
          overallRating: reportData.ratingDetails.overallRating || "Neutral",
          financialStrength: reportData.ratingDetails.financialStrength || "Adequate",
          growthOutlook: reportData.ratingDetails.growthOutlook || "Stable",
          valuationAttractiveness: reportData.ratingDetails.valuationAttractiveness || "Fair",
          competitivePosition: reportData.ratingDetails.competitivePosition || "Average",
          ratingScale: reportData.ratingDetails.ratingScale || "1-5 scale (5 is highest)",
          ratingJustification: reportData.ratingDetails.ratingJustification || ""
        } : undefined,
        
        scenarioAnalysis: reportData.scenarioAnalysis ? {
          bullCase: {
            price: reportData.scenarioAnalysis.bullCase?.price || `$${(data.currentPrice * 1.2).toFixed(2)}`,
            description: reportData.scenarioAnalysis.bullCase?.description || "Optimistic scenario",
            probability: reportData.scenarioAnalysis.bullCase?.probability || "25%",
            drivers: reportData.scenarioAnalysis.bullCase?.drivers || []
          },
          baseCase: {
            price: reportData.scenarioAnalysis.baseCase?.price || `$${(data.currentPrice * 1.05).toFixed(2)}`,
            description: reportData.scenarioAnalysis.baseCase?.description || "Most likely scenario",
            probability: reportData.scenarioAnalysis.baseCase?.probability || "50%",
            drivers: reportData.scenarioAnalysis.baseCase?.drivers || []
          },
          bearCase: {
            price: reportData.scenarioAnalysis.bearCase?.price || `$${(data.currentPrice * 0.9).toFixed(2)}`,
            description: reportData.scenarioAnalysis.bearCase?.description || "Pessimistic scenario",
            probability: reportData.scenarioAnalysis.bearCase?.probability || "25%",
            drivers: reportData.scenarioAnalysis.bearCase?.drivers || []
          }
        } : undefined,
        
        catalysts: reportData.catalysts ? {
          positive: reportData.catalysts.positive || [],
          negative: reportData.catalysts.negative || [],
          timeline: reportData.catalysts.timeline ? {
            shortTerm: reportData.catalysts.timeline.shortTerm || [],
            mediumTerm: reportData.catalysts.timeline.mediumTerm || [],
            longTerm: reportData.catalysts.timeline.longTerm || []
          } : undefined
        } : undefined
      };
      
      // Ensure the financial analysis section is comprehensive
      if (finalReport.sections) {
        const financialSectionIndex = finalReport.sections.findIndex(section => 
          section.title.toLowerCase().includes('financial') || 
          section.title.toLowerCase().includes('financials')
        );
        
        if (financialSectionIndex !== -1) {
          const financialSection = finalReport.sections[financialSectionIndex];
          
          // Check if financial section is substantial enough
          if (financialSection.content.length < 500) {
            console.log("Financial analysis section is too short, enhancing it...");
            
            // Generate enhanced financial content
            finalReport.sections[financialSectionIndex].content = generateEnhancedFinancialAnalysis(data);
          }
        } else {
          console.log("No financial analysis section found, adding one...");
          
          // Add a financial analysis section if missing
          finalReport.sections.splice(2, 0, {
            title: "Financial Analysis",
            content: generateEnhancedFinancialAnalysis(data)
          });
        }
      }
      
      return finalReport;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      
      return createFallbackReport(data);
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return createFallbackReport(data);
  }
}

// Generate a detailed financial analysis section if needed
function generateEnhancedFinancialAnalysis(data: any): string {
  const { financialSummary, companyName, symbol } = data;
  
  if (!financialSummary) {
    return "Financial analysis data unavailable.";
  }
  
  // Extract financial metrics
  const revenue = financialSummary.revenue ? `$${formatLargeNumber(financialSummary.revenue)}` : "N/A";
  const netIncome = financialSummary.netIncome ? `$${formatLargeNumber(financialSummary.netIncome)}` : "N/A";
  const grossMargin = financialSummary.grossMargin ? `${(financialSummary.grossMargin * 100).toFixed(2)}%` : "N/A";
  const operatingMargin = financialSummary.operatingMargin ? `${(financialSummary.operatingMargin * 100).toFixed(2)}%` : "N/A";
  const netMargin = financialSummary.netMargin ? `${(financialSummary.netMargin * 100).toFixed(2)}%` : "N/A";
  const revenueGrowth = financialSummary.revenueGrowth || "N/A";
  const netIncomeGrowth = financialSummary.netIncomeGrowth || "N/A";
  const totalAssets = financialSummary.totalAssets ? `$${formatLargeNumber(financialSummary.totalAssets)}` : "N/A";
  const totalLiabilities = financialSummary.totalLiabilities ? `$${formatLargeNumber(financialSummary.totalLiabilities)}` : "N/A";
  const totalEquity = financialSummary.totalEquity ? `$${formatLargeNumber(financialSummary.totalEquity)}` : "N/A";
  const debt = financialSummary.debt ? `$${formatLargeNumber(financialSummary.debt)}` : "N/A";
  const cash = financialSummary.cashAndEquivalents ? `$${formatLargeNumber(financialSummary.cashAndEquivalents)}` : "N/A";
  const ocf = financialSummary.operatingCashFlow ? `$${formatLargeNumber(financialSummary.operatingCashFlow)}` : "N/A";
  const fcf = financialSummary.freeCashFlow ? `$${formatLargeNumber(financialSummary.freeCashFlow)}` : "N/A";
  const roe = financialSummary.returnOnEquity ? `${(financialSummary.returnOnEquity * 100).toFixed(2)}%` : "N/A";
  const roa = financialSummary.returnOnAssets ? `${(financialSummary.returnOnAssets * 100).toFixed(2)}%` : "N/A";
  const debtToEquity = financialSummary.debtToEquity ? financialSummary.debtToEquity.toFixed(2) : "N/A";
  const currentRatio = financialSummary.currentRatio ? financialSummary.currentRatio.toFixed(2) : "N/A";
  const year = financialSummary.year || "recent";
  
  // Generate comprehensive analysis
  return `## Financial Performance Overview

${companyName} (${symbol}) reported revenue of ${revenue} for the ${year} fiscal year${revenueGrowth !== "N/A" ? `, representing a year-over-year growth of ${revenueGrowth}` : ""}. The company generated net income of ${netIncome}${netIncomeGrowth !== "N/A" ? `, which translates to a growth rate of ${netIncomeGrowth} compared to the previous year` : ""}.

### Profitability Analysis

The company demonstrated a gross margin of ${grossMargin}, operating margin of ${operatingMargin}, and net profit margin of ${netMargin}. These metrics indicate the company's ability to convert revenue into profits at various operational levels. ${
  parseFloat(String(grossMargin)) > 40 ? "The strong gross margin suggests the company has significant pricing power and/or efficient production costs relative to industry peers." : 
  parseFloat(String(grossMargin)) > 25 ? "The moderate gross margin is in line with industry standards, indicating reasonable cost control." : 
  "The relatively low gross margin may indicate pricing pressure or higher cost of goods sold compared to industry peers."
}

${
  parseFloat(String(operatingMargin)) > 20 ? "The robust operating margin demonstrates excellent operational efficiency and cost control across the organization." : 
  parseFloat(String(operatingMargin)) > 10 ? "The solid operating margin reflects adequate control over operating expenses relative to revenue generation." : 
  "The modest operating margin suggests there may be opportunities to optimize operating expenses and improve operational efficiency."
}

### Growth Trends

Revenue growth ${revenueGrowth !== "N/A" ? `of ${revenueGrowth}` : "has been"} ${
  revenueGrowth !== "N/A" && parseFloat(revenueGrowth) > 15 ? "impressive, outpacing many industry peers and indicating strong market demand for the company's products/services." : 
  revenueGrowth !== "N/A" && parseFloat(revenueGrowth) > 5 ? "solid, keeping pace with broader industry growth rates." : 
  "modest, suggesting the company may be operating in a mature market or facing competitive pressures."
}

Net income growth ${netIncomeGrowth !== "N/A" ? `of ${netIncomeGrowth}` : ""} ${
  netIncomeGrowth !== "N/A" && parseFloat(netIncomeGrowth) > parseFloat(revenueGrowth || "0") ? "has outpaced revenue growth, indicating improving operational efficiency and cost management." : 
  netIncomeGrowth !== "N/A" && parseFloat(netIncomeGrowth) < parseFloat(revenueGrowth || "100") ? "has not kept pace with revenue growth, suggesting increasing cost pressures or investments for future growth." : 
  "has generally tracked with revenue performance."
}

### Balance Sheet Strength

As of the ${year} fiscal year, ${companyName} reported total assets of ${totalAssets}, total liabilities of ${totalLiabilities}, and shareholders' equity of ${totalEquity}. The company maintains a debt level of ${debt} against cash and cash equivalents of ${cash}, resulting in a ${
  parseFloat(cash) > parseFloat(debt) ? `net cash position of approximately $${formatLargeNumber(parseFloat(cash) - parseFloat(debt))}` : 
  `net debt position of approximately $${formatLargeNumber(parseFloat(debt) - parseFloat(cash))}`
}.

The debt-to-equity ratio stands at ${debtToEquity}, which is ${
  parseFloat(String(debtToEquity)) < 0.5 ? "conservative and indicates a strong balance sheet with limited financial leverage." : 
  parseFloat(String(debtToEquity)) < 1.0 ? "moderate and suggests a balanced approach to financial leverage." : 
  "elevated and may indicate higher financial risk, though this should be evaluated within the context of the industry."
}

The current ratio of ${currentRatio} ${
  parseFloat(String(currentRatio)) > 2 ? "demonstrates robust short-term liquidity and the ability to comfortably meet near-term obligations." : 
  parseFloat(String(currentRatio)) > 1 ? "indicates adequate liquidity to meet short-term obligations." : 
  "suggests potential liquidity constraints that warrant monitoring."
}

### Cash Flow Analysis

${companyName} generated operating cash flow of ${ocf} and free cash flow of ${fcf} during the ${year} fiscal year. ${
  fcf !== "N/A" && ocf !== "N/A" && parseFloat(fcf) > 0 ? 
  `The positive free cash flow demonstrates the company's ability to generate cash beyond its operational and capital expenditure needs, providing flexibility for shareholder returns, debt reduction, or strategic investments.` : 
  `The company's cash flow profile requires careful analysis as it may indicate heavy investment for future growth or potential challenges in converting earnings to cash.`
}

The cash flow conversion rate (free cash flow as a percentage of net income) ${
  fcf !== "N/A" && netIncome !== "N/A" && parseFloat(fcf) > parseFloat(netIncome) ? 
  "exceeds 100%, which is excellent and indicates high-quality earnings with minimal accounting adjustments." : 
  fcf !== "N/A" && netIncome !== "N/A" && parseFloat(fcf) > 0.8 * parseFloat(netIncome) ? 
  "is strong at over 80%, indicating good quality of earnings." : 
  "suggests some disconnect between reported earnings and cash generation that warrants further investigation."
}

### Returns and Efficiency Metrics

Return on Equity (ROE) of ${roe} and Return on Assets (ROA) of ${roa} provide insight into management's efficiency at generating profits from the company's equity and asset base, respectively. ${
  parseFloat(String(roe)) > 15 ? "The strong ROE indicates efficient use of shareholder capital." : 
  parseFloat(String(roe)) > 10 ? "The ROE is solid and in line with broader market returns." : 
  "The ROE suggests potential opportunities for improving returns to shareholders."
}

${
  parseFloat(String(roa)) > 5 ? "The robust ROA demonstrates effective deployment of company assets to generate profits." : 
  parseFloat(String(roa)) > 3 ? "The ROA is reasonable given the company's asset intensity." : 
  "The relatively modest ROA may indicate lower asset turnover or profit margins compared to industry benchmarks."
}

### Industry Comparison and Outlook

Relative to industry peers, ${companyName}'s financial metrics ${
  (parseFloat(String(grossMargin)) > 40 || parseFloat(String(operatingMargin)) > 20 || parseFloat(String(roe)) > 15) ? 
  "stand out positively, particularly in terms of profitability and returns on invested capital." : 
  "are generally in line with industry standards, though with some areas for potential improvement."
}

Looking ahead, we expect ${companyName}'s financial performance to be shaped by ${
  revenueGrowth !== "N/A" && parseFloat(revenueGrowth) > 10 ? 
  "its continued strong momentum in revenue growth, with potential for margin expansion as economies of scale are realized." : 
  "market conditions in its core segments, with a focus on operational efficiency to drive margin improvement."
}

Capital allocation priorities likely include ${
  parseFloat(cash) > parseFloat(debt) * 2 ? 
  "strategic acquisitions, share repurchases, and potential dividend increases given the strong cash position." : 
  debt !== "N/A" && parseFloat(debt) > parseFloat(totalEquity) ? 
  "debt reduction to strengthen the balance sheet, alongside targeted growth investments." : 
  "a balanced approach to organic growth investments, shareholder returns, and maintaining financial flexibility."
}

### Conclusion

${companyName}'s financial position can be characterized as ${
  (parseFloat(String(grossMargin)) > 35 && parseFloat(String(roe)) > 15 && parseFloat(cash) > parseFloat(debt)) ? 
  "strong, with industry-leading profitability, healthy returns on capital, and a solid balance sheet that provides significant strategic flexibility." : 
  (parseFloat(String(grossMargin)) > 25 && parseFloat(String(roe)) > 10) ? 
  "solid, with competitive margins and returns that support continued investment in growth initiatives." : 
  "stable, though with opportunities for enhancement in key metrics to drive shareholder value creation."
}

The company's financial strategy appears focused on ${
  revenueGrowth !== "N/A" && parseFloat(revenueGrowth) > 15 ? 
  "supporting its high-growth trajectory while gradually improving profitability metrics." : 
  netMargin !== "N/A" && parseFloat(String(netMargin)) > 15 ? 
  "maintaining its strong profitability while seeking targeted growth opportunities." : 
  "balancing growth investments with operational improvements to enhance returns."
}`;
}
