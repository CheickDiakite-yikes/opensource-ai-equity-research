
import React from "react";
import { Button } from "@/components/ui/button";
import { ResearchReport } from "@/types";
import { generateReportHTML } from "@/lib/utils";
import { Download, AlertTriangle, ArrowRight, BarChart, LineChart, PieChart } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import RevenueIncomeChart from "@/components/charts/RevenueIncomeChart";
import AssetsLiabilitiesChart from "@/components/charts/AssetsLiabilitiesChart";
import ProfitabilityChart from "@/components/charts/ProfitabilityChart";
import CashFlowChart from "@/components/charts/CashFlowChart";
import GrowthChart from "@/components/charts/GrowthChart";

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

  // Extract financial data for charts if available
  const { financialCharts } = report;
  
  // Helper to determine if we have chart data
  const hasChartData = financialCharts && (
    financialCharts.revenueIncome?.length > 0 || 
    financialCharts.assetsLiabilities?.length > 0 || 
    financialCharts.profitability?.length > 0 || 
    financialCharts.cashFlow?.length > 0 ||
    financialCharts.revenueGrowth?.length > 0 ||
    financialCharts.epsGrowth?.length > 0
  );

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
        <div className="p-3 border rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">Recommendation</span>
          <span className="text-xl font-semibold">{report.recommendation}</span>
        </div>
        <div className="p-3 border rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">Price Target</span>
          <span className="text-xl font-semibold">{report.targetPrice}</span>
        </div>
      </div>
      
      <div className="border rounded-lg p-4 bg-card">
        <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
        <p className="text-sm leading-relaxed">{report.summary}</p>
      </div>

      {/* Financial Charts Section */}
      {hasChartData && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted p-3">
            <h3 className="font-medium flex items-center gap-2">
              <BarChart className="h-4 w-4" />
              Financial Charts
            </h3>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialCharts?.revenueIncome && financialCharts.revenueIncome.length > 0 && (
              <div>
                <RevenueIncomeChart data={financialCharts.revenueIncome} />
              </div>
            )}
            
            {financialCharts?.assetsLiabilities && financialCharts.assetsLiabilities.length > 0 && (
              <div>
                <AssetsLiabilitiesChart data={financialCharts.assetsLiabilities} />
              </div>
            )}
            
            {financialCharts?.profitability && financialCharts.profitability.length > 0 && (
              <div>
                <ProfitabilityChart data={financialCharts.profitability} />
              </div>
            )}
            
            {financialCharts?.cashFlow && financialCharts.cashFlow.length > 0 && (
              <div>
                <CashFlowChart data={financialCharts.cashFlow} />
              </div>
            )}

            {financialCharts?.revenueGrowth && financialCharts.revenueGrowth.length > 0 && (
              <div>
                <GrowthChart 
                  data={financialCharts.revenueGrowth} 
                  title="Revenue Growth (%)"
                  color="#3b82f6" 
                />
              </div>
            )}
            
            {financialCharts?.epsGrowth && financialCharts.epsGrowth.length > 0 && (
              <div>
                <GrowthChart 
                  data={financialCharts.epsGrowth} 
                  title="EPS Growth (%)"
                  color="#10b981" 
                />
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Report Sections */}
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-3">
          <h3 className="font-medium">Report Sections</h3>
        </div>
        <div className="divide-y">
          {report.sections.map((section, index) => (
            <details key={index} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <h4 className="font-medium">{section.title}</h4>
                <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div 
                  className="text-sm text-muted-foreground prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }}
                />
                
                {/* Display section charts if any */}
                {section.charts && section.charts.length > 0 && (
                  <div className="mt-4 pt-4 border-t grid grid-cols-1 gap-6">
                    {section.charts.map((chart, chartIndex) => (
                      <div key={`chart-${index}-${chartIndex}`} className="border rounded-lg p-4">
                        <h5 className="font-medium mb-4 flex items-center gap-2">
                          <LineChart className="h-4 w-4" />
                          {chart.title}
                        </h5>
                        <div className="h-80">
                          {/* Render the appropriate chart based on chart type */}
                          {chart.type === 'revenue-income' && <RevenueIncomeChart data={chart.data} />}
                          {chart.type === 'assets-liabilities' && <AssetsLiabilitiesChart data={chart.data} />}
                          {chart.type === 'profitability' && <ProfitabilityChart data={chart.data} />}
                          {chart.type === 'cash-flow' && <CashFlowChart data={chart.data} />}
                          {chart.type === 'growth' && <GrowthChart data={chart.data} title={chart.title} color="#3b82f6" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Display section tables if any */}
                {section.tables && section.tables.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    {section.tables.map((table, tableIndex) => (
                      <div key={`table-${index}-${tableIndex}`} className="border rounded-lg p-4 mt-4">
                        <h5 className="font-medium mb-4">{table.title}</h5>
                        {/* Table rendering would go here */}
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            {/* Table content would be rendered here based on table.data */}
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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

export default ResearchReportDisplay;
