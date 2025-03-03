
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ResearchReport } from "@/types";
import { generateReportHTML } from "@/lib/utils";
import { Download, AlertTriangle, ArrowRight, TrendingUp, TrendingDown, Target, Activity, Lightbulb, Shield, BarChart3 } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface ResearchReportDisplayProps {
  report: ResearchReport;
}

const ResearchReportDisplay: React.FC<ResearchReportDisplayProps> = ({ report }) => {
  const [expandedScenarios, setExpandedScenarios] = useState<string | null>(null);
  
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
    
    // Add scenarios if they exist
    if (report.scenarioAnalysis) {
      content += `<div class="scenario-analysis">
        <h2>Scenario Analysis</h2>
        <div class="scenario bull">
          <h3>Bull Case: ${report.scenarioAnalysis.bullCase.price}</h3>
          <p>Probability: ${report.scenarioAnalysis.bullCase.probability}</p>
          <ul>${report.scenarioAnalysis.bullCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
        </div>
        <div class="scenario base">
          <h3>Base Case: ${report.scenarioAnalysis.baseCase.price}</h3>
          <p>Probability: ${report.scenarioAnalysis.baseCase.probability}</p>
          <ul>${report.scenarioAnalysis.baseCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
        </div>
        <div class="scenario bear">
          <h3>Bear Case: ${report.scenarioAnalysis.bearCase.price}</h3>
          <p>Probability: ${report.scenarioAnalysis.bearCase.probability}</p>
          <ul>${report.scenarioAnalysis.bearCase.drivers.map(d => `<li>${d}</li>`).join('')}</ul>
        </div>
      </div>`;
    }
    
    // Add catalysts if they exist
    if (report.catalysts) {
      content += `<div class="catalysts">
        <h2>Growth Catalysts & Inhibitors</h2>
        <div class="positive">
          <h3>Positive Catalysts</h3>
          <ul>${report.catalysts.positive.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
        <div class="negative">
          <h3>Negative Catalysts</h3>
          <ul>${report.catalysts.negative.map(c => `<li>${c}</li>`).join('')}</ul>
        </div>
      </div>`;
    }
    
    // Add rating details if they exist
    if (report.ratingDetails) {
      content += `<div class="rating-details">
        <h2>Rating Details</h2>
        <p><strong>Rating Scale:</strong> ${report.ratingDetails.ratingScale}</p>
        <p><strong>Justification:</strong> ${report.ratingDetails.ratingJustification}</p>
      </div>`;
    }
    
    // Add all the standard sections
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

  // Function to determine badge color based on recommendation
  const getRecommendationColor = (recommendation: string) => {
    const rec = recommendation.toLowerCase();
    if (rec.includes('buy') || rec.includes('strong') || rec.includes('outperform')) {
      return "bg-green-100 text-green-800";
    } else if (rec.includes('hold') || rec.includes('neutral')) {
      return "bg-yellow-100 text-yellow-800";
    } else if (rec.includes('sell') || rec.includes('underperform')) {
      return "bg-red-100 text-red-800";
    }
    return "bg-blue-100 text-blue-800";
  };

  // Toggle expanded scenario
  const toggleScenario = (scenario: string) => {
    if (expandedScenarios === scenario) {
      setExpandedScenarios(null);
    } else {
      setExpandedScenarios(scenario);
    }
  };

  // Create sensitivity analysis section content
  const renderSensitivityAnalysisContent = () => {
    if (!report.scenarioAnalysis) return null;
    
    return (
      <div className="space-y-3">
        {/* Bull Case */}
        <div className="cursor-pointer" onClick={() => toggleScenario('bull')}>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <TrendingUp className="h-4 w-4 text-green-600 mr-2" />
              <span className="font-medium">Bull Case</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-semibold">
                {report.scenarioAnalysis.bullCase.price}
              </span>
              <span className="text-xs text-muted-foreground">
                ({report.scenarioAnalysis.bullCase.probability} probability)
              </span>
            </div>
          </div>
          <Progress 
            value={parseInt(report.scenarioAnalysis.bullCase.probability) || 25} 
            className="h-2 bg-gray-100" 
            indicatorClassName="bg-green-600" 
          />
          
          {expandedScenarios === 'bull' && (
            <div className="mt-2 p-3 bg-green-50 rounded-md">
              <p className="text-sm font-medium text-green-800 mb-1">Key Drivers:</p>
              <ul className="text-sm list-disc pl-5 text-green-700 space-y-1">
                {report.scenarioAnalysis.bullCase.drivers.map((driver, idx) => (
                  <li key={idx}>{driver}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Base Case */}
        <div className="cursor-pointer" onClick={() => toggleScenario('base')}>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <Activity className="h-4 w-4 text-blue-600 mr-2" />
              <span className="font-medium">Base Case</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-semibold">
                {report.scenarioAnalysis.baseCase.price}
              </span>
              <span className="text-xs text-muted-foreground">
                ({report.scenarioAnalysis.baseCase.probability} probability)
              </span>
            </div>
          </div>
          <Progress 
            value={parseInt(report.scenarioAnalysis.baseCase.probability) || 50} 
            className="h-2 bg-gray-100" 
            indicatorClassName="bg-blue-600" 
          />
          
          {expandedScenarios === 'base' && (
            <div className="mt-2 p-3 bg-blue-50 rounded-md">
              <p className="text-sm font-medium text-blue-800 mb-1">Key Drivers:</p>
              <ul className="text-sm list-disc pl-5 text-blue-700 space-y-1">
                {report.scenarioAnalysis.baseCase.drivers.map((driver, idx) => (
                  <li key={idx}>{driver}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* Bear Case */}
        <div className="cursor-pointer" onClick={() => toggleScenario('bear')}>
          <div className="flex justify-between items-center mb-1">
            <div className="flex items-center">
              <TrendingDown className="h-4 w-4 text-red-600 mr-2" />
              <span className="font-medium">Bear Case</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-semibold">
                {report.scenarioAnalysis.bearCase.price}
              </span>
              <span className="text-xs text-muted-foreground">
                ({report.scenarioAnalysis.bearCase.probability} probability)
              </span>
            </div>
          </div>
          <Progress 
            value={parseInt(report.scenarioAnalysis.bearCase.probability) || 25} 
            className="h-2 bg-gray-100" 
            indicatorClassName="bg-red-600" 
          />
          
          {expandedScenarios === 'bear' && (
            <div className="mt-2 p-3 bg-red-50 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-1">Key Drivers:</p>
              <ul className="text-sm list-disc pl-5 text-red-700 space-y-1">
                {report.scenarioAnalysis.bearCase.drivers.map((driver, idx) => (
                  <li key={idx}>{driver}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Create growth catalysts section content
  const renderGrowthCatalystsContent = () => {
    if (!report.catalysts) return null;
    
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Positive Catalysts */}
          <div className="p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1.5" />
              Positive Catalysts
            </h4>
            <ul className="space-y-2">
              {report.catalysts.positive.map((catalyst, index) => (
                <li key={index} className="text-sm text-green-700 pl-2 border-l-2 border-green-300">
                  {catalyst}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Negative Catalysts */}
          <div className="p-3 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2 flex items-center">
              <TrendingDown className="h-4 w-4 mr-1.5" />
              Growth Inhibitors
            </h4>
            <ul className="space-y-2">
              {report.catalysts.negative.map((catalyst, index) => (
                <li key={index} className="text-sm text-red-700 pl-2 border-l-2 border-red-300">
                  {catalyst}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Timeline if available */}
        {report.catalysts.timeline && (
          <div className="mt-4 pt-3 border-t">
            <h4 className="font-medium mb-2">Catalyst Timeline</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-xs font-medium text-gray-600 block mb-1">Short Term</span>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {report.catalysts.timeline.shortTerm.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-xs font-medium text-gray-600 block mb-1">Medium Term</span>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {report.catalysts.timeline.mediumTerm.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="p-2 bg-gray-50 rounded">
                <span className="text-xs font-medium text-gray-600 block mb-1">Long Term</span>
                <ul className="text-sm list-disc pl-5 space-y-1">
                  {report.catalysts.timeline.longTerm.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Create an array of all report sections including the new ones
  const allSections = [
    // Add Sensitivity Analysis if available
    ...(report.scenarioAnalysis ? [{
      title: "Sensitivity Analysis",
      content: renderSensitivityAnalysisContent(),
      icon: <Target className="h-4 w-4" />
    }] : []),
    
    // Add Growth Catalysts if available
    ...(report.catalysts ? [{
      title: "Growth Catalysts & Inhibitors",
      content: renderGrowthCatalystsContent(),
      icon: <Lightbulb className="h-4 w-4" />
    }] : []),
    
    // Add the standard sections
    ...report.sections.map(section => ({
      title: section.title,
      content: <div dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }} />,
      icon: <ArrowRight className="h-4 w-4" />
    }))
  ];

  return (
    <div className="space-y-4">
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
      
      <div className="flex flex-wrap gap-4">
        <div className="p-3 border rounded-lg flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Recommendation</span>
          <Badge 
            className={`${getRecommendationColor(report.recommendation)} px-2.5 py-1 font-semibold`}
            variant="outline"
          >
            {report.recommendation}
          </Badge>
        </div>
        <div className="p-3 border rounded-lg flex-1">
          <span className="text-xs text-muted-foreground block mb-1">Price Target</span>
          <span className="text-xl font-semibold">{report.targetPrice}</span>
        </div>
        
        {/* Rating Details if available */}
        {report.ratingDetails && (
          <div className="p-3 border rounded-lg flex-1">
            <span className="text-xs text-muted-foreground block mb-1">Rating Scale</span>
            <span className="text-sm font-medium">{report.ratingDetails.ratingScale}</span>
          </div>
        )}
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="text-lg font-medium mb-2">Executive Summary</h3>
        <p className="text-sm leading-relaxed">{report.summary}</p>
      </div>
      
      <div className="border rounded-lg overflow-hidden">
        <div className="bg-muted p-3">
          <h3 className="font-medium">Report Sections</h3>
        </div>
        <div className="divide-y">
          {allSections.map((section, index) => (
            <details key={index} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between p-4 hover:bg-muted/50">
                <div className="flex items-center">
                  {section.icon}
                  <h4 className="font-medium ml-2">{section.title}</h4>
                </div>
                <ArrowRight className="h-4 w-4 transition-transform group-open:rotate-90" />
              </summary>
              <div className="p-4 pt-0">
                <div className="text-sm text-muted-foreground prose-sm max-w-none">
                  {section.content}
                </div>
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
