
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { generateReportHTML } from "@/lib/utils";
import { Download, FileText, RefreshCw, Share2 } from "lucide-react";

interface ResearchReportGeneratorProps {
  symbol: string;
}

const ResearchReportGenerator = ({ symbol }: ResearchReportGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [selectedSections, setSelectedSections] = useState({
    companyOverview: true,
    financialAnalysis: true,
    industryAnalysis: true,
    valuation: true,
    technicalAnalysis: true,
    risks: true,
    outlook: true,
    investmentThesis: true,
  });

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    
    // This would be replaced with actual OpenAI API call
    // For demo purposes, using a timeout
    setTimeout(() => {
      setReport(mockReportContent);
      setIsGenerating(false);
      
      toast({
        title: "Report Generated",
        description: `Research report for ${symbol} has been successfully generated.`,
      });
    }, 3000);
  };

  const handleSectionToggle = (section: keyof typeof selectedSections) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleDownloadPDF = () => {
    if (!report) return;
    
    // In a real implementation, this would convert the report to PDF
    // For demo purposes, we'll just show a toast
    toast({
      title: "Report Downloaded",
      description: `${symbol}_Equity_Research_Report.pdf has been downloaded.`,
    });
  };

  const handleDownloadHTML = () => {
    if (!report) return;
    
    const htmlContent = generateReportHTML(`${symbol} Equity Research Report`, report);
    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${symbol}_Equity_Research_Report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {!report ? (
        <Card>
          <CardHeader>
            <CardTitle>Generate Research Report</CardTitle>
            <CardDescription>
              Create a comprehensive equity research report for {symbol} using AI analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-3">Report Sections</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="company-overview" 
                      checked={selectedSections.companyOverview}
                      onCheckedChange={() => handleSectionToggle("companyOverview")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="company-overview"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Company Overview
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Business description, products, and market position
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="financial-analysis" 
                      checked={selectedSections.financialAnalysis}
                      onCheckedChange={() => handleSectionToggle("financialAnalysis")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="financial-analysis"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Financial Analysis
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Income statement, balance sheet, and cash flow analysis
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="industry-analysis" 
                      checked={selectedSections.industryAnalysis}
                      onCheckedChange={() => handleSectionToggle("industryAnalysis")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="industry-analysis"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Industry Analysis
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Market trends, competition, and industry outlook
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="valuation" 
                      checked={selectedSections.valuation}
                      onCheckedChange={() => handleSectionToggle("valuation")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="valuation"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Valuation
                      </label>
                      <p className="text-xs text-muted-foreground">
                        DCF analysis, multiples, and fair value estimation
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="technical-analysis" 
                      checked={selectedSections.technicalAnalysis}
                      onCheckedChange={() => handleSectionToggle("technicalAnalysis")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="technical-analysis"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Technical Analysis
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Price trends, support/resistance, and indicators
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="risks" 
                      checked={selectedSections.risks}
                      onCheckedChange={() => handleSectionToggle("risks")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="risks"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Risk Assessment
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Key risks, sensitivities, and downside scenarios
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="outlook" 
                      checked={selectedSections.outlook}
                      onCheckedChange={() => handleSectionToggle("outlook")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="outlook"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Future Outlook
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Growth projections, catalysts, and future opportunities
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox 
                      id="investment-thesis" 
                      checked={selectedSections.investmentThesis}
                      onCheckedChange={() => handleSectionToggle("investmentThesis")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="investment-thesis"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Investment Thesis
                      </label>
                      <p className="text-xs text-muted-foreground">
                        Buy/hold/sell recommendation with supporting arguments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Research Report
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">{symbol} Research Report</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleDownloadHTML}>
                <Download className="mr-2 h-4 w-4" />
                HTML
              </Button>
              <Button onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" />
                PDF
              </Button>
              <Button variant="secondary">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="destructive" onClick={() => setReport(null)}>
                Regenerate
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="report" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="report">Full Report</TabsTrigger>
              <TabsTrigger value="summary">Executive Summary</TabsTrigger>
            </TabsList>
            <TabsContent value="report" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: report }} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="summary" className="mt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: mockSummaryContent }} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

// Mock Report Content
const mockReportContent = `
<h2>AAPL Equity Research Report</h2>

<div class="report-section">
  <h3>1. Company Overview</h3>
  <div class="report-content">
    <p>Apple Inc. (NASDAQ: AAPL) designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home, and accessories comprising AirPods, Apple TV, Apple Watch, Beats products, and HomePod. It also provides AppleCare support and cloud services, and operates various platforms, including the App Store.</p>
    
    <p>Headquartered in Cupertino, California, Apple has established itself as one of the world's most valuable technology companies with a market capitalization exceeding $2.8 trillion. The company's ecosystem strategy and premium brand positioning have created strong customer loyalty and recurring revenue streams.</p>
  </div>
</div>

<div class="report-section">
  <h3>2. Financial Analysis</h3>
  <div class="report-content">
    <p><strong>Revenue Growth:</strong> Apple has demonstrated consistent revenue growth over the past five years, with a CAGR of approximately 12.8%. The company's diversification across product categories and services has contributed to this robust performance. The Services segment has been a particularly strong growth driver, expanding at nearly twice the rate of hardware products.</p>
    
    <p><strong>Profitability:</strong> Apple maintains industry-leading margins. Gross margin has expanded from 40% in 2019 to 44.2% in 2023, while operating margin improved from 15.8% to 20.8% during the same period. This improvement reflects both economies of scale and the increasing mix of high-margin services revenue.</p>
    
    <p><strong>Balance Sheet Strength:</strong> The company maintains a strong financial position with $55.9 billion in cash and cash equivalents and short-term investments as of Q4 2023. Total debt stands at $109.6 billion, resulting in a net debt position of $53.7 billion. With strong free cash flow generation exceeding $100 billion annually, Apple's financial flexibility remains robust.</p>
    
    <p><strong>Cash Return to Shareholders:</strong> Apple has an aggressive capital return program. In fiscal 2023, the company returned $94.1 billion to shareholders through dividends ($14.8 billion) and share repurchases ($79.3 billion). The current dividend yield is approximately 0.5%, while the share count has decreased by about 20% over the past five years through repurchases.</p>
  </div>
</div>

<div class="report-section">
  <h3>3. Industry Analysis</h3>
  <div class="report-content">
    <p>Apple operates across multiple hardware and software markets, competing in premium segments where brand strength and ecosystem integration are key differentiators.</p>
    
    <p><strong>Smartphone Market:</strong> The global smartphone market is maturing, with growth predominantly coming from emerging markets and upgrade cycles. Apple maintains approximately 20% unit market share but captures around 80% of global smartphone profits through its premium pricing strategy. Key competitors include Samsung, Xiaomi, and OPPO.</p>
    
    <p><strong>Personal Computing:</strong> The PC market has seen a post-pandemic normalization but remains essential for productivity. Apple's Mac lineup has gained market share, reaching approximately 10% of global shipments, benefiting from the company's custom silicon transition.</p>
    
    <p><strong>Services Ecosystem:</strong> Digital services represent the highest growth opportunity, including cloud storage, content streaming, financial services, and app economy. Apple's Services segment has emerged as a $85+ billion annual business with higher margins than hardware. Key competitors include Google, Microsoft, Amazon, and various specialized service providers.</p>
    
    <p><strong>Wearables:</strong> Apple leads the smartwatch and hearables categories with Apple Watch and AirPods. The wearable technology market continues to expand as health monitoring capabilities and integration with smartphones increase.</p>
  </div>
</div>

<div class="report-section">
  <h3>4. Valuation</h3>
  <div class="report-content">
    <p>We employ multiple valuation methodologies to determine Apple's fair value:</p>
    
    <p><strong>P/E Multiple:</strong> Apple currently trades at a forward P/E of 25.5x, compared to the S&P 500 technology sector average of 23.8x. Given Apple's superior financial metrics, brand strength, and ecosystem advantages, we believe a 20-30% premium to the sector is justified, implying a target P/E range of 28.6-31.0x.</p>
    
    <p><strong>DCF Analysis:</strong> Our discounted cash flow model utilizes the following assumptions:</p>
    <ul>
      <li>5-year explicit forecast period with revenue CAGR of 8.5%</li>
      <li>Terminal growth rate of 3.5%</li>
      <li>WACC of 9.2%</li>
      <li>Operating margin expanding to 22.5% by end of forecast period</li>
    </ul>
    
    <p>This DCF analysis yields a fair value estimate of $215 per share.</p>
    
    <p><strong>Sum-of-the-Parts (SOTP):</strong> Applying segment-specific multiples:</p>
    <ul>
      <li>iPhone (45% of revenue): 18x segment operating profit</li>
      <li>Services (25% of revenue): 28x segment operating profit</li>
      <li>Mac, iPad, Wearables (30% of revenue): 15x combined segment operating profit</li>
    </ul>
    
    <p>The SOTP analysis produces a fair value estimate of $205 per share.</p>
    
    <p><strong>Fair Value Range:</strong> Weighting these methodologies equally, we arrive at a fair value range of $195-$225 per share, with a point estimate of $210, representing approximately 15% upside from current levels.</p>
  </div>
</div>

<div class="report-section">
  <h3>5. Technical Analysis</h3>
  <div class="report-content">
    <p>AAPL shares have demonstrated positive momentum, trading above both the 50-day and 200-day moving averages. The stock has established a strong support level around $170, which has held through recent market volatility.</p>
    
    <p>The Relative Strength Index (RSI) currently reads 62, indicating positive momentum without being in overbought territory. The MACD indicator shows a bullish signal with the MACD line above the signal line.</p>
    
    <p>Volume patterns have been supportive of the recent price action, with higher-than-average volume on up days. The On-Balance Volume (OBV) indicator has been trending upward, confirming the price trend.</p>
    
    <p>Key technical resistance levels exist at $195 (recent high) and $210 (all-time high), while support can be found at $175 (50-day MA) and $165 (100-day MA).</p>
  </div>
</div>

<div class="report-section">
  <h3>6. Risk Assessment</h3>
  <div class="report-content">
    <p><strong>Concentration Risk:</strong> The iPhone still accounts for approximately 45% of Apple's revenue. Any significant decline in smartphone demand or failure to maintain competitive positioning would materially impact financial results.</p>
    
    <p><strong>Regulatory Risk:</strong> Apple faces increasing regulatory scrutiny regarding App Store practices, platform power, and competitive behavior. Forced changes to the App Store business model could impact the high-margin Services segment growth trajectory.</p>
    
    <p><strong>Supply Chain Vulnerabilities:</strong> Geopolitical tensions, particularly between the U.S. and China, pose risks to Apple's manufacturing strategy. While the company has initiated supply chain diversification efforts, meaningful shifts will take multiple years to implement.</p>
    
    <p><strong>Innovation Plateau:</strong> Apple's growth is contingent on continued product innovation. Failure to deliver compelling new products or services could result in elongated replacement cycles and reduced revenue growth.</p>
    
    <p><strong>Valuation Risk:</strong> At current valuation multiples, Apple shares embed expectations for continued growth and margin expansion. Any shortfall relative to these expectations could lead to multiple compression.</p>
  </div>
</div>

<div class="report-section">
  <h3>7. Future Outlook</h3>
  <div class="report-content">
    <p><strong>Services Expansion:</strong> The Services segment is expected to continue outgrowing hardware, potentially reaching 30% of total revenue by 2026. New offerings in financial services (Apple Card, Apple Pay Later) and potential subscription hardware models represent additional growth vectors.</p>
    
    <p><strong>AI Integration:</strong> Apple is accelerating investments in artificial intelligence, both on-device and cloud-based. We expect significant AI-powered feature enhancements across the product portfolio in the next 2-3 years, potentially driving a strong upgrade cycle.</p>
    
    <p><strong>New Product Categories:</strong> Apple's rumored mixed reality headset represents the company's first major new product category since the Apple Watch. While initial volumes may be modest, this could establish a new growth platform over the medium term.</p>
    
    <p><strong>Geographic Expansion:</strong> India represents a significant growth opportunity, with Apple doubling its market share over the past three years. The company is also expanding its retail presence in emerging markets.</p>
    
    <p><strong>Margin Profile:</strong> The continued shift toward services, coupled with operational efficiencies, is expected to drive further margin expansion. We project operating margins to exceed 22% by fiscal 2025.</p>
  </div>
</div>

<div class="report-section">
  <h3>8. Investment Thesis</h3>
  <div class="report-content">
    <p><strong>Recommendation: BUY</strong> with a price target of $210 (15% upside)</p>
    
    <p>We recommend a BUY rating on Apple Inc. (AAPL) based on the following key investment thesis points:</p>
    
    <ol>
      <li><strong>Ecosystem Strength:</strong> Apple's integrated ecosystem creates high switching costs and customer loyalty, supporting stable installed base growth and expanding monetization opportunities.</li>
      <li><strong>Services Transformation:</strong> The ongoing transition toward high-margin, recurring services revenue enhances overall margin profile and reduces cyclicality.</li>
      <li><strong>Capital Return Program:</strong> Aggressive share repurchases provide an effective floor for the stock while enhancing per-share metrics.</li>
      <li><strong>Innovation Pipeline:</strong> Anticipated new products and AI integration should drive growth acceleration in fiscal 2025-2026.</li>
      <li><strong>Brand Premium:</strong> Apple's brand strength enables premium pricing, supporting industry-leading profitability metrics.</li>
    </ol>
    
    <p>While valuation is not inexpensive, we believe the premium is justified by the company's superior financial profile, ecosystem advantages, and long-term growth opportunities. The risk-reward balance appears favorable at current levels.</p>
  </div>
</div>

<div class="report-section">
  <h3>Analyst Certification</h3>
  <div class="report-content">
    <p>This research report has been generated by AI Equity Research. The analysis is based on publicly available information and proprietary methodologies. This report is for informational purposes only and does not constitute investment advice. Investors should conduct their own research before making investment decisions.</p>
  </div>
</div>
`;

// Mock Summary Content
const mockSummaryContent = `
<h2>AAPL Equity Research - Executive Summary</h2>

<div class="report-section">
  <div class="report-content">
    <p><strong>Recommendation: BUY</strong> with a price target of $210 (15% upside)</p>
    
    <p><strong>Investment Highlights:</strong></p>
    <ul>
      <li>Apple maintains leading market positions across smartphones, wearables, and premium personal computing with its cohesive ecosystem creating high switching costs and strong customer loyalty.</li>
      <li>Financial performance remains robust with 5-year revenue CAGR of 12.8% and expanding margins (gross margin: 44.2%, operating margin: 20.8%).</li>
      <li>Services segment (25% of revenue) continues outpacing hardware growth with higher margins, supporting overall profitability expansion.</li>
      <li>Strong balance sheet with significant cash generation capacity enables both strategic investments and aggressive capital return program ($94.1B returned to shareholders in 2023).</li>
      <li>AI integration, geographic expansion (particularly India), and potential new product categories (mixed reality) represent key growth vectors.</li>
    </ul>
    
    <p><strong>Key Risks:</strong></p>
    <ul>
      <li>iPhone concentration (45% of revenue) creates vulnerability to smartphone market maturation.</li>
      <li>Regulatory scrutiny regarding App Store practices and platform power.</li>
      <li>Supply chain exposure to geopolitical tensions between the U.S. and China.</li>
      <li>Innovation expectations embedded in current valuation multiples.</li>
    </ul>
    
    <p><strong>Valuation:</strong> Our $210 price target is based on a blended valuation approach incorporating:</p>
    <ul>
      <li>Forward P/E multiple of 29.8x (25% premium to sector)</li>
      <li>DCF analysis with 8.5% 5-year revenue CAGR and terminal growth of 3.5%</li>
      <li>Sum-of-the-parts valuation applying segment-specific multiples</li>
    </ul>
    
    <p>The current valuation, while not inexpensive at 25.5x forward earnings, is justified by Apple's superior financial metrics, ecosystem advantages, and long-term growth opportunities.</p>
  </div>
</div>
`;

export default ResearchReportGenerator;
