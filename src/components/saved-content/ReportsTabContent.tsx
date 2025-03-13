
import React from "react";
import { Card } from "@/components/ui/card";
import { SavedReport } from "@/hooks/saved-content";
import SavedReportsList from "./SavedReportsList";
import EmptyContentState from "./EmptyContentState";
import ContentPlaceholder from "./ContentPlaceholder";
import SavedContentDisclaimer from "./SavedContentDisclaimer";
import ResearchReportDisplay from "@/components/reports/ResearchReportDisplay";

interface ReportsTabContentProps {
  reports: SavedReport[];
  selectedReport: SavedReport | null;
  onSelectReport: (report: SavedReport) => void;
  onDeleteReport: (reportId: string, e: React.MouseEvent) => Promise<void>;
  onDownloadHtml: (report: SavedReport) => void;
}

const ReportsTabContent: React.FC<ReportsTabContentProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  onDeleteReport,
  onDownloadHtml,
}) => {
  if (reports.length === 0) {
    return <EmptyContentState type="reports" />;
  }

  // Handler for the download button in the list
  const handleDownloadFromList = (report: SavedReport, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row selection
    onDownloadHtml(report);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-primary/90">Your Reports</h2>
          <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
            {reports.length} saved
          </span>
        </div>
        
        <div className="bg-gradient-to-r from-background to-secondary/30 p-0.5 rounded-xl shadow-sm">
          <div className="bg-background rounded-lg overflow-hidden">
            <SavedReportsList
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={onSelectReport}
              onDeleteReport={onDeleteReport}
              onDownloadHtml={handleDownloadFromList}
            />
          </div>
        </div>
        
        <SavedContentDisclaimer type="reports" />
      </div>
      
      <div className="col-span-1 lg:col-span-2 transition-all duration-300">
        {selectedReport ? (
          <Card className="p-5 h-full overflow-hidden border border-primary/5 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-background to-secondary/10">
            <ResearchReportDisplay 
              report={selectedReport.report_data} 
              htmlContent={selectedReport.html_content}
              onDownloadHtml={() => onDownloadHtml(selectedReport)}
            />
          </Card>
        ) : (
          <ContentPlaceholder type="report" />
        )}
      </div>
    </div>
  );
};

export default ReportsTabContent;
