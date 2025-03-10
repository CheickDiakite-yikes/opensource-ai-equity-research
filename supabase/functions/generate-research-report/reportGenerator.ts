
import { ResearchReport } from "./types.ts";
import { OPENAI_API_KEY } from "../_shared/constants.ts";
import { extractJSONFromText } from "../_shared/report-utils/openAIGenerator.ts";

export async function generateResearchReport(reportRequest: any): Promise<ResearchReport> {
  try {
    console.log(`Generating enhanced research report for ${reportRequest.symbol}`);
    
    // Format the data for OpenAI
    const formattedData = formatReportData(reportRequest);
    
    // Generate the report
    const report = await generateReportWithOpenAI(formattedData);
    
    // Enhance the report with the additional data
    const enhancedReport = enhanceReportWithExtraData(report, reportRequest);
    
    return enhancedReport;
  } catch (error) {
    console.error("Error generating research report:", error);
    throw error;
  }
}

function formatReportData(reportRequest: any): any {
  // Basic company data
  const data = {
    symbol: reportRequest.symbol,
    companyName: reportRequest.companyName,
    sector: reportRequest.sector,
    industry: reportRequest.industry,
    description: reportRequest.description,
    currentPrice: reportRequest.stockData?.price || 0,
    marketCap: reportRequest.stockData?.mktCap || 0,
    pe: reportRequest.stockData?.pe || 0,
    
    // Financial data
    financialSummary: extractFinancialSummary(reportRequest.financials),
    
    // News
    newsSummary: extractNewsSummary([
      ...(reportRequest.news || []),
      ...(reportRequest.finnhubNews || [])
    ]),
    
    // Peers
    peers: combinePeers(reportRequest.peers, reportRequest.finnhubPeers),
    
    // Enhanced data
    recommendationTrends: formatRecommendationTrends(reportRequest.recommendationTrends),
    earningsCalendar: formatEarningsCalendar(reportRequest.earningsCalendar),
    enterpriseValue: formatEnterpriseValue(reportRequest.enterpriseValue),
    analystEstimates: formatAnalystEstimates(reportRequest.analystEstimates),
    
    // Original report type
    reportType: reportRequest.reportType || 'comprehensive'
  };
  
  return data;
}

function extractFinancialSummary(financials: any = {}): any {
  if (!financials) return {};
  
  // Extract financial data from income statements, balance sheets, cash flow statements, and ratios
  const income = financials.income || [];
  const balance = financials.balance || [];
  const cashflow = financials.cashflow || [];
  const ratios = financials.ratios || [];
  
  // If we have financial data, extract key metrics
  if (income.length > 0 || balance.length > 0 || cashflow.length > 0 || ratios.length > 0) {
    return {
      // Income statement metrics
      revenue: income[0]?.revenue,
      netIncome: income[0]?.netIncome,
      grossProfit: income[0]?.grossProfit,
      operatingIncome: income[0]?.operatingIncome,
      ebitda: income[0]?.ebitda,
      
      // Balance sheet metrics
      totalAssets: balance[0]?.totalAssets,
      totalLiabilities: balance[0]?.totalLiabilities,
      totalEquity: balance[0]?.totalEquity,
      cash: balance[0]?.cashAndCashEquivalents,
      debt: balance[0]?.totalDebt,
      
      // Cash flow metrics
      operatingCashFlow: cashflow[0]?.operatingCashFlow,
      capitalExpenditure: cashflow[0]?.capitalExpenditure,
      freeCashFlow: cashflow[0]?.freeCashFlow,
      
      // Key ratios
      roe: ratios[0]?.returnOnEquity,
      roa: ratios[0]?.returnOnAssets,
      debtToEquity: ratios[0]?.debtToEquity,
      currentRatio: ratios[0]?.currentRatio,
      quickRatio: ratios[0]?.quickRatio,
      grossMargin: ratios[0]?.grossProfitMargin,
      operatingMargin: ratios[0]?.operatingProfitMargin,
      netMargin: ratios[0]?.netProfitMargin,
      
      // Growth metrics (if we have multiple periods)
      revenueGrowth: income.length > 1 ? (income[0]?.revenue - income[1]?.revenue) / income[1]?.revenue : null,
      netIncomeGrowth: income.length > 1 ? (income[0]?.netIncome - income[1]?.netIncome) / income[1]?.netIncome : null,
      
      // Previous periods
      previousYearRevenue: income.length > 1 ? income[1]?.revenue : null,
      previousYearNetIncome: income.length > 1 ? income[1]?.netIncome : null
    };
  }
  
  return {};
}

function extractNewsSummary(news: any[] = []): any {
  if (!news || news.length === 0) return { recentHeadlines: [] };
  
  // Sort news by date (most recent first)
  const sortedNews = [...news].sort((a, b) => {
    const dateA = a.datetime || new Date(a.publishedDate).getTime() / 1000;
    const dateB = b.datetime || new Date(b.publishedDate).getTime() / 1000;
    return dateB - dateA;
  });
  
  // Extract recent headlines
  const recentHeadlines = sortedNews.slice(0, 5).map(article => article.headline || article.title);
  
  // Analyze sentiment
  const positiveWords = ['rise', 'up', 'growth', 'gain', 'positive', 'beat', 'exceeded', 'strong', 'success'];
  const negativeWords = ['fall', 'down', 'decline', 'loss', 'negative', 'miss', 'weak', 'drop', 'concern'];
  
  let positiveCount = 0;
  let negativeCount = 0;
  
  sortedNews.slice(0, 10).forEach(article => {
    const headline = (article.headline || article.title || '').toLowerCase();
    const summary = (article.summary || '').toLowerCase();
    
    positiveWords.forEach(word => {
      if (headline.includes(word) || summary.includes(word)) positiveCount++;
    });
    
    negativeWords.forEach(word => {
      if (headline.includes(word) || summary.includes(word)) negativeCount++;
    });
  });
  
  let sentimentScore;
  if (positiveCount > negativeCount * 1.5) {
    sentimentScore = "strongly positive";
  } else if (positiveCount > negativeCount) {
    sentimentScore = "positive";
  } else if (negativeCount > positiveCount * 1.5) {
    sentimentScore = "strongly negative";
  } else if (negativeCount > positiveCount) {
    sentimentScore = "negative";
  } else {
    sentimentScore = "neutral";
  }
  
  return {
    recentHeadlines,
    articleCount: sortedNews.length,
    sentimentScore,
    sourcesCount: new Set(sortedNews.map(article => article.source)).size
  };
}

function combinePeers(originalPeers: string[] = [], finnhubPeers: string[] = []): string[] {
  // Combine both peer lists and remove duplicates
  const allPeers = [...(originalPeers || []), ...(finnhubPeers || [])];
  return [...new Set(allPeers)];
}

function formatRecommendationTrends(trends: any[] = []): any {
  if (!trends || trends.length === 0) return null;
  
  // Sort by date (most recent first)
  const sortedTrends = [...trends].sort((a, b) => {
    return new Date(b.period).getTime() - new Date(a.period).getTime();
  });
  
  // Get the most recent recommendation
  const latestTrend = sortedTrends[0];
  
  // Calculate sentiment score
  const totalRecommendations = 
    latestTrend.strongBuy + 
    latestTrend.buy + 
    latestTrend.hold + 
    latestTrend.sell + 
    latestTrend.strongSell;
  
  const sentimentScore = totalRecommendations > 0 ? 
    (latestTrend.strongBuy * 2 + 
     latestTrend.buy * 1 + 
     latestTrend.hold * 0 + 
     latestTrend.sell * -1 + 
     latestTrend.strongSell * -2) / totalRecommendations : 0;
  
  return {
    latest: latestTrend,
    sentimentScore: parseFloat(sentimentScore.toFixed(2)),
    buyPercentage: totalRecommendations > 0 ? 
      ((latestTrend.strongBuy + latestTrend.buy) / totalRecommendations) * 100 : 0,
    sellPercentage: totalRecommendations > 0 ? 
      ((latestTrend.strongSell + latestTrend.sell) / totalRecommendations) * 100 : 0,
    holdPercentage: totalRecommendations > 0 ? 
      (latestTrend.hold / totalRecommendations) * 100 : 0,
    totalAnalysts: totalRecommendations,
    history: sortedTrends.slice(0, 5)
  };
}

function formatEarningsCalendar(calendar: any): any {
  if (!calendar || !calendar.earningsCalendar || calendar.earningsCalendar.length === 0) return null;
  
  // Sort by date (most recent first)
  const sortedEarnings = [...calendar.earningsCalendar].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  // Split into past and upcoming earnings
  const now = new Date();
  const upcomingEarnings = sortedEarnings.filter(entry => new Date(entry.date) >= now);
  const pastEarnings = sortedEarnings.filter(entry => new Date(entry.date) < now);
  
  // Calculate surprise percentages for past earnings
  const pastEarningsWithSurprise = pastEarnings.map(entry => ({
    ...entry,
    epsSurprisePercent: entry.epsEstimate ? ((entry.epsActual - entry.epsEstimate) / Math.abs(entry.epsEstimate)) * 100 : 0,
    revenueSurprisePercent: entry.revenueEstimate ? ((entry.revenueActual - entry.revenueEstimate) / entry.revenueEstimate) * 100 : 0
  }));
  
  return {
    upcoming: upcomingEarnings.slice(0, 2),
    past: pastEarningsWithSurprise.slice(0, 5),
    hasUpcomingEarnings: upcomingEarnings.length > 0,
    nextEarningsDate: upcomingEarnings.length > 0 ? upcomingEarnings[0].date : null
  };
}

function formatEnterpriseValue(enterpriseValue: any[] = []): any {
  if (!enterpriseValue || enterpriseValue.length === 0) return null;
  
  // Get the most recent enterprise value
  const latestEV = enterpriseValue[0];
  
  return {
    enterpriseValue: latestEV.enterpriseValue,
    marketCap: latestEV.marketCapitalization,
    evToMarketCap: latestEV.enterpriseValue / latestEV.marketCapitalization,
    totalDebt: latestEV.addTotalDebt,
    cashAndEquivalents: latestEV.minusCashAndCashEquivalents,
    stockPrice: latestEV.stockPrice,
    date: latestEV.date
  };
}

function formatAnalystEstimates(estimates: any[] = []): any {
  if (!estimates || estimates.length === 0) return null;
  
  // Sort by date (most recent first for current year, then future years)
  const sortedEstimates = [...estimates].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });
  
  // Group by year
  const estimatesByYear = sortedEstimates.reduce((acc, estimate) => {
    const year = new Date(estimate.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(estimate);
    return acc;
  }, {});
  
  // Get the current year and future years
  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  
  return {
    currentYear: estimatesByYear[currentYear] ? estimatesByYear[currentYear][0] : null,
    nextYear: estimatesByYear[nextYear] ? estimatesByYear[nextYear][0] : null,
    growthProjections: {
      revenueGrowth: calculateGrowthRate(sortedEstimates, 'revenueAvg'),
      epsGrowth: calculateGrowthRate(sortedEstimates, 'epsAvg'),
      netIncomeGrowth: calculateGrowthRate(sortedEstimates, 'netIncomeAvg')
    },
    analystCount: sortedEstimates[0]?.numberAnalystEstimated || 0
  };
}

function calculateGrowthRate(estimates: any[], field: string): number | null {
  if (!estimates || estimates.length < 2) return null;
  
  // Get the current year estimate and the next year estimate
  const currentYearEstimate = estimates[0][field];
  const nextYearEstimate = estimates[1][field];
  
  // Calculate growth rate
  if (currentYearEstimate && nextYearEstimate && currentYearEstimate !== 0) {
    return ((nextYearEstimate - currentYearEstimate) / Math.abs(currentYearEstimate)) * 100;
  }
  
  return null;
}

async function generateReportWithOpenAI(data: any): Promise<ResearchReport> {
  try {
    console.log(`Sending enhanced data to OpenAI for ${data.symbol} research report generation`);
    
    // Prepare system prompt
    const systemPrompt = `You are an expert financial analyst tasked with creating a detailed, professional equity research report for ${data.companyName} (${data.symbol}). 
Your report should meet the standards of major investment banks and research firms, with thorough analysis and substantial content in each section.

Based on the report type "${data.reportType}", emphasize:
${data.reportType === 'comprehensive' ? '- A balanced, in-depth analysis of all aspects including financials, growth, valuation, and risks, with detailed metrics and industry comparisons.' : ''}
${data.reportType === 'financial' ? '- Deep financial analysis with extensive ratio analysis, cash flow sustainability assessment, balance sheet strength, and capital structure evaluation.' : ''}
${data.reportType === 'valuation' ? '- Detailed valuation using multiple methodologies (DCF, multiples) with sensitivity analysis, fair value derivation, and comprehensive target price justification.' : ''}

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

MAKE SURE TO INCORPORATE:
- Analyst consensus data including recommendation trends, EPS estimates, and revenue forecasts
- Upcoming earnings information and historical earnings surprises
- Enterprise value data and its implications for the company's valuation
- Peer comparison using the provided peer companies

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

    // Prepare user prompt with enhanced data
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

ENHANCED DATA:
1. RECOMMENDATION TRENDS (${data.recommendationTrends?.totalAnalysts || 0} analysts):
${data.recommendationTrends ? 
  `Buy/StrongBuy: ${data.recommendationTrends.buyPercentage.toFixed(1)}%
   Hold: ${data.recommendationTrends.holdPercentage.toFixed(1)}%
   Sell/StrongSell: ${data.recommendationTrends.sellPercentage.toFixed(1)}%
   Sentiment Score: ${data.recommendationTrends.sentimentScore} (-2 to +2 scale)` : 
  'No recommendation trends available'
}

2. EARNINGS CALENDAR:
${data.earningsCalendar?.hasUpcomingEarnings ?
  `Next Earnings Date: ${data.earningsCalendar.nextEarningsDate}
   
   Recent Earnings Performance:
   ${data.earningsCalendar.past && data.earningsCalendar.past.length > 0 ?
     data.earningsCalendar.past.slice(0, 2).map((e: any) => 
     `Date: ${e.date}, EPS: $${e.epsActual} vs Est: $${e.epsEstimate} (${e.epsSurprisePercent.toFixed(1)}%), 
      Revenue: $${(e.revenueActual/1000000000).toFixed(2)}B vs Est: $${(e.revenueEstimate/1000000000).toFixed(2)}B (${e.revenueSurprisePercent.toFixed(1)}%)`
     ).join('\n   ') :
     'No recent earnings data available'
   }` :
  'No upcoming earnings scheduled'
}

3. ENTERPRISE VALUE:
${data.enterpriseValue ?
  `Enterprise Value: $${formatLargeNumber(data.enterpriseValue.enterpriseValue)}
   EV/Market Cap: ${data.enterpriseValue.evToMarketCap.toFixed(2)}
   Total Debt: $${formatLargeNumber(data.enterpriseValue.totalDebt)}
   Cash & Equivalents: $${formatLargeNumber(data.enterpriseValue.cashAndEquivalents)}` :
  'No enterprise value data available'
}

4. ANALYST ESTIMATES:
${data.analystEstimates ?
  `Analyst Count: ${data.analystEstimates.analystCount}
   
   Growth Projections:
   Revenue Growth: ${data.analystEstimates.growthProjections.revenueGrowth ? data.analystEstimates.growthProjections.revenueGrowth.toFixed(1) + '%' : 'N/A'}
   EPS Growth: ${data.analystEstimates.growthProjections.epsGrowth ? data.analystEstimates.growthProjections.epsGrowth.toFixed(1) + '%' : 'N/A'}
   Net Income Growth: ${data.analystEstimates.growthProjections.netIncomeGrowth ? data.analystEstimates.growthProjections.netIncomeGrowth.toFixed(1) + '%' : 'N/A'}` :
  'No analyst estimates available'
}

Create a comprehensive, professional research report including:
1. Clear investment recommendation with thorough justification (be decisive based on ALL available data)
2. Well-supported target price based on analyst consensus and your fundamental analysis
3. Detailed executive summary covering all key points
4. Extensive analysis in each required section (at least 300-500 words per section)
5. Comprehensive rating details across multiple business aspects
6. Detailed scenario analysis with price targets and probabilities
7. Thorough growth catalysts and risks assessment with timeline

Your report should match the quality and depth of professional equity research from major investment banks.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
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

    try {
      const reportData = extractJSONFromText(content);
      
      const report: ResearchReport = {
        symbol: data.symbol,
        companyName: data.companyName,
        date: new Date().toISOString().split('T')[0],
        recommendation: reportData.recommendation || "Hold",
        targetPrice: reportData.targetPrice || `$${(data.currentPrice * 1.1).toFixed(2)}`,
        summary: reportData.summary || "",
        sections: reportData.sections || [],
        ratingDetails: reportData.ratingDetails,
        scenarioAnalysis: reportData.scenarioAnalysis,
        catalysts: reportData.catalysts
      };
      
      return report;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.log("Raw response:", content);
      throw parseError;
    }
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    throw error;
  }
}

function enhanceReportWithExtraData(report: ResearchReport, reportRequest: any): ResearchReport {
  // Add recommendation trends section if available
  if (reportRequest.recommendationTrends && report.sections) {
    const recommendationTrends = reportRequest.recommendationTrends;
    
    // Find the existing valuation section to add recommendation trends
    const valuationSectionIndex = report.sections.findIndex(section => 
      section.title.toLowerCase().includes('valuation')
    );
    
    if (valuationSectionIndex !== -1) {
      const valuationSection = report.sections[valuationSectionIndex];
      
      // Add analyst consensus data to the valuation section
      report.sections[valuationSectionIndex].content = valuationSection.content + `

## Analyst Consensus

According to the latest data from ${recommendationTrends.totalAnalysts} analysts covering ${report.companyName}, the consensus recommendation leans ${
  recommendationTrends.sentimentScore > 0.5 ? 'strongly positive' :
  recommendationTrends.sentimentScore > 0 ? 'positive' :
  recommendationTrends.sentimentScore < -0.5 ? 'strongly negative' :
  recommendationTrends.sentimentScore < 0 ? 'negative' : 'neutral'
}.

The breakdown of recommendations is as follows:
- Buy/Strong Buy: ${recommendationTrends.buyPercentage.toFixed(1)}%
- Hold: ${recommendationTrends.holdPercentage.toFixed(1)}%
- Sell/Strong Sell: ${recommendationTrends.sellPercentage.toFixed(1)}%

This consensus view ${
  (recommendationTrends.sentimentScore > 0 && report.recommendation.includes('Buy')) || 
  (recommendationTrends.sentimentScore < 0 && (report.recommendation.includes('Sell') || report.recommendation === 'Hold')) ?
  'aligns with' : 'differs from'
} our recommendation of "${report.recommendation}".`;
    }
  }
  
  // Add upcoming earnings information
  if (reportRequest.earningsCalendar?.hasUpcomingEarnings && report.catalysts) {
    const earningsCalendar = reportRequest.earningsCalendar;
    
    // Add upcoming earnings to catalysts
    if (!report.catalysts.timeline) {
      report.catalysts.timeline = {
        shortTerm: [],
        mediumTerm: [],
        longTerm: []
      };
    }
    
    // Add as a short-term catalyst
    report.catalysts.timeline.shortTerm.push(
      `Earnings report on ${earningsCalendar.nextEarningsDate}`
    );
  }
  
  // Add enterprise value data to the report summary
  if (reportRequest.enterpriseValue && report.summary) {
    const enterpriseValue = reportRequest.enterpriseValue;
    
    report.summary = report.summary + `

The company has an enterprise value of $${formatLargeNumber(enterpriseValue.enterpriseValue)}, which represents ${enterpriseValue.evToMarketCap.toFixed(2)}x its market capitalization. ${
  enterpriseValue.evToMarketCap > 1.3 ? 
  'This elevated EV/Market Cap ratio indicates significant debt levels relative to the company\'s equity value.' :
  enterpriseValue.evToMarketCap < 0.9 ?
  'This low EV/Market Cap ratio indicates the company has significant net cash on its balance sheet, providing financial flexibility.' :
  'This EV/Market Cap ratio is in line with typical levels, indicating a balanced capital structure.'
}`;
  }
  
  return report;
}

function formatLargeNumber(num: number): string {
  if (!num && num !== 0) return 'N/A';
  
  if (num >= 1000000000000) {
    return `${(num / 1000000000000).toFixed(2)}T`;
  } else if (num >= 1000000000) {
    return `${(num / 1000000000).toFixed(2)}B`;
  } else if (num >= 1000000) {
    return `${(num / 1000000).toFixed(2)}M`;
  } else {
    return num.toString();
  }
}
