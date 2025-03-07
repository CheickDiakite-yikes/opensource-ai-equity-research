
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { SavedReport } from "@/hooks/useSavedContent";
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="col-span-1 space-y-4">
        <h2 className="text-xl font-medium">Your Reports</h2>
        
        <SavedReportsList
          reports={reports}
          selectedReport={selectedReport}
          onSelectReport={onSelectReport}
          onDeleteReport={onDeleteReport}
        />
        
        <SavedContentDisclaimer type="reports" />
      </div>
      
      <div className="col-span-1 lg:col-span-2">
        {selectedReport ? (
          <Card className="p-4 h-full">
            <div className="flex justify-end mb-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDownloadHtml(selectedReport)}
                className="flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                <span>Download HTML</span>
              </Button>
            </div>
            <ResearchReportDisplay report={selectedReport.report_data} />
          </Card>
        ) : (
          <ContentPlaceholder type="report" />
        )}
      </div>
    </div>
  );
};

export default ReportsTabContent;
