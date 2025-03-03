
import React from "react";
import { Button } from "@/components/ui/button";
import { ResearchReport } from "@/types";
import { generateReportHTML } from "@/lib/utils";
import { Download, AlertTriangle, ArrowRight, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import RevenueIncomeChart from "@/components/charts/RevenueIncomeChart";
import AssetsLiabilitiesChart from "@/components/charts/AssetsLiabilitiesChart";
import ProfitabilityChart from "@/components/charts/ProfitabilityChart";
import CashFlowChart from "@/components/charts/CashFlowChart";
import GrowthChart from "@/components/charts/GrowthChart";
import { prepareFinancialData, prepareRatioData, calculateGrowth } from "@/utils/financialDataUtils";

interface ResearchReportDisplayProps {
  report: ResearchReport;
}

const ResearchReportDisplay: React.FC<ResearchReportDisplayProps> = ({ report }) => {
  const downloadAsHTML = () => {
    if (!report) return;
    
    const title = `${report.companyName} (${report.symbol}) - Equity Research Report`;
    
    let content = `<h1>${title}</h1>`;
    content += `<p class="date">Date: ${report.date}</p>`;
    content += `<p class="recommendation"><strong>Recommendation:</strong> ${report.recommendation}</p>`;
    content += `<p class="price-target"><strong>Price Target:</strong> ${report.targetPrice}</p>`;
    
    content += `<div class="summary">
      <h2>Executive Summary</h2>
      <p>${report.summary}</p>
    </div>`;
    
    // Add investment thesis
    if (report.investmentThesis) {
      content += `<div class="section">
        <h2>Investment Thesis</h2>
        <div>${report.investmentThesis}</div>
      </div>`;
    }
    
    // Add business overview
    if (report.businessOverview) {
      content += `<div class="section">
        <h2>Business Overview</h2>
        <div>${report.businessOverview}</div>
      </div>`;
    }
    
    // Add industry analysis
    if (report.industryAnalysis) {
      content += `<div class="section">
        <h2>Industry Analysis</h2>
        <div>${report.industryAnalysis}</div>
      </div>`;
    }
    
    // Add financial analysis
    if (report.financialAnalysis) {
      content += `<div class="section">
        <h2>Financial Analysis</h2>
        <div>${report.financialAnalysis}</div>
      </div>`;
    }
    
    // Add growth prospects
    if (report.growthProspects) {
      content += `<div class="section">
        <h2>Growth Prospects</h2>
        <div>${report.growthProspects}</div>
      </div>`;
    }
    
    // Add valuation
    if (report.valuation) {
      content += `<div class="section">
        <h2>Valuation</h2>
        <div>${report.valuation}</div>
      </div>`;
    }
    
    // Add risk factors
    if (report.riskFactors) {
      content += `<div class="section">
        <h2>Risk Factors</h2>
        <div>${report.riskFactors}</div>
      </div>`;
    }
    
    // Add ESG considerations
    if (report.esgConsiderations) {
      content += `<div class="section">
        <h2>ESG Considerations</h2>
        <div>${report.esgConsiderations}</div>
      </div>`;
    }
    
    // Add any additional sections
    report.sections.forEach(section => {
      content += `<div class="section">
        <h2>${section.title}</h2>
        <div>${section.content}</div>
      </div>`;
    });
    
    const htmlContent = generateReportHTML(title, content);
    
    // Create a Blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.symbol}_research_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Report Downloaded",
      description: "Research report has been downloaded as HTML.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{report.companyName} ({report.symbol})</h2>
          <p className="text-sm text-muted-foreground">Report Date: {report.date}</p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadAsHTML}>
          <Download className="h-4 w-4 mr-1.5" />
          Download Report
        </Button>
      </div>
      
      <div className="flex space-x-4">
        <div className="p-3 border rounded-lg flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Recommendation</span>
          <span className="text-xl font-semibold">{report.recommendation}</span>
        </div>
        <div className="p-3 border rounded-lg flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Price Target</span>
          <span className="text-xl font-semibold">{report.targetPrice}</span>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
        <p className="text-sm leading-relaxed">{report.summary}</p>
      </div>
      
      {/* Charts Section - conditionally rendered based on chartSections */}
      {report.chartSections && report.chartSections.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Financial Charts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {report.chartSections.map((chart, index) => (
              <ChartRenderer key={index} chartType={chart.type} symbol={report.symbol} />
            ))}
          </div>
        </div>
      )}
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-3">
          <h3 className="font-medium">Report Sections</h3>
        </div>
        <div className="divide-y">
          {/* Investment Thesis */}
          {report.investmentThesis && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">Investment Thesis</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.investmentThesis.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          )}
          
          {/* Business Overview */}
          {report.businessOverview && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">Business Overview</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.businessOverview.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          )}
          
          {/* Industry Analysis */}
          {report.industryAnalysis && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">Industry Analysis</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.industryAnalysis.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          )}
          
          {/* Financial Analysis */}
          {report.financialAnalysis && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">Financial Analysis</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.financialAnalysis.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          )}
          
          {/* Growth Prospects */}
          {report.growthProspects && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">Growth Prospects</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.growthProspects.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          )}
          
          {/* Valuation */}
          {report.valuation && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">Valuation</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.valuation.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          )}
          
          {/* Risk Factors */}
          {report.riskFactors && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">Risk Factors</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.riskFactors.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          )}
          
          {/* ESG Considerations */}
          {report.esgConsiderations && (
            <details className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">ESG Considerations</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: report.esgConsiderations.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          )}
          
          {/* Additional Sections */}
          {report.sections.map((section, index) => (
            <details key={index} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">{section.title}</h4>
                <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }}
                />
              </div>
            </details>
          ))}
        </div>
      </div>
      
      <div className="bg-amber-50 border-amber-200 border rounded-lg p-3 text-xs text-amber-800">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
          <p>
            This report is generated using AI and should not be the sole basis for investment decisions.
            Always conduct your own research and consult with a financial advisor.
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper component to render the appropriate chart based on type
const ChartRenderer = ({ chartType, symbol }) => {
  // For demo purposes, we'll use static data
  // In production, this would be fetched from your APIs
  const [data, setData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulation of API data fetch
    const fetchData = async () => {
      setLoading(true);
      try {
        // In a real implementation, you would fetch this data from your API
        // For now, we'll use sample data
        const sampleData = [
          { 
            year: '2023', 
            revenue: 394328000000, 
            netIncome: 97176000000,
            totalAssets: 352755000000,
            totalLiabilities: 290452000000,
            grossMargin: 0.447,
            operatingMargin: 0.3,
            netMargin: 0.246,
            operatingCashFlow: 120232000000,
            capitalExpenditure: -13075000000,
            freeCashFlow: 107157000000
          },
          { 
            year: '2022', 
            revenue: 365817000000, 
            netIncome: 94680000000,
            totalAssets: 323888000000,
            totalLiabilities: 261205000000,
            grossMargin: 0.433,
            operatingMargin: 0.298,
            netMargin: 0.259,
            operatingCashFlow: 109199000000,
            capitalExpenditure: -11085000000,
            freeCashFlow: 98114000000
          },
          { 
            year: '2021', 
            revenue: 274515000000, 
            netIncome: 57411000000,
            totalAssets: 287715000000,
            totalLiabilities: 229705000000,
            grossMargin: 0.418,
            operatingMargin: 0.293,
            netMargin: 0.209,
            operatingCashFlow: 92953000000,
            capitalExpenditure: -9571000000,
            freeCashFlow: 83382000000
          },
          { 
            year: '2020', 
            revenue: 260174000000, 
            netIncome: 55256000000,
            totalAssets: 258549000000,
            totalLiabilities: 198349000000,
            grossMargin: 0.407,
            operatingMargin: 0.245,
            netMargin: 0.212,
            operatingCashFlow: 80674000000,
            capitalExpenditure: -7309000000,
            freeCashFlow: 73365000000
          },
          { 
            year: '2019', 
            revenue: 215639000000, 
            netIncome: 45687000000,
            totalAssets: 232186000000,
            totalLiabilities: 175450000000,
            grossMargin: 0.398,
            operatingMargin: 0.241,
            netMargin: 0.212,
            operatingCashFlow: 73365000000,
            capitalExpenditure: -6151000000,
            freeCashFlow: 67214000000
          }
        ];
        
        setData(sampleData);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [chartType, symbol]);
  
  if (loading) {
    return <div className="h-60 flex items-center justify-center">Loading chart data...</div>;
  }
  
  // Render the appropriate chart based on type
  switch (chartType) {
    case 'revenue-income':
      return <RevenueIncomeChart data={data} />;
    case 'assets-liabilities':
      return <AssetsLiabilitiesChart data={data} />;
    case 'profitability':
      return <ProfitabilityChart data={data} />;
    case 'cash-flow':
      return <CashFlowChart data={data} />;
    case 'growth':
      // Calculate revenue growth
      const revenueGrowth = calculateGrowth(data, 'revenue');
      return <GrowthChart data={revenueGrowth} title="Revenue Growth YoY" color="#1d4ed8" />;
    default:
      return <div>Chart type not supported</div>;
  }
};

export default ResearchReportDisplay;
