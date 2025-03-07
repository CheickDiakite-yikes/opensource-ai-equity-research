
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Download, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SavedReport } from "@/hooks/useSavedContent";
import { toast } from "sonner";

interface SavedReportsListProps {
  reports: SavedReport[];
  selectedReport: SavedReport | null;
  onSelectReport: (report: SavedReport) => void;
  onDeleteReport: (reportId: string, e: React.MouseEvent) => Promise<void>;
}

const SavedReportsList: React.FC<SavedReportsListProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  onDeleteReport,
}) => {
  const handleDownloadHtml = (report: SavedReport, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!report.html_content) {
      toast.error("HTML content not available for this report");
      return;
    }

    // Create a Blob and download
    const blob = new Blob([report.html_content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.symbol}_research_report.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Report downloaded as HTML");
  };

  if (reports.length === 0) {
    return (
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No saved reports found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <Card 
          key={report.id} 
          className={`cursor-pointer hover:border-primary/50 transition-colors ${
            selectedReport?.id === report.id ? 'border-primary' : ''
          }`}
          onClick={() => onSelectReport(report)}
        >
          <CardHeader className="p-4 pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">{report.symbol}</CardTitle>
                <CardDescription className="text-xs line-clamp-1">
                  {report.company_name}
                </CardDescription>
              </div>
              <div className="flex">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full hover:bg-primary/10 text-muted-foreground"
                  onClick={(e) => handleDownloadHtml(report, e)}
                  title="Download HTML"
                  disabled={!report.html_content}
                >
                  <Download className={`h-4 w-4 ${!report.html_content ? 'opacity-50' : ''}`} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  onClick={(e) => onDeleteReport(report.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 pb-2">
            <div className="text-xs text-muted-foreground flex items-center mt-1 gap-1">
              <Clock className="h-3 w-3" />
              <span>
                Saved {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
              </span>
            </div>
            {report.html_content ? (
              <div className="mt-1">
                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                  HTML Available
                </span>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="p-4 pt-0">
            <div className="w-full flex justify-between items-center">
              <div className="text-xs bg-primary/10 text-primary rounded-full px-2 py-0.5">
                {report.report_data.recommendation}
              </div>
              <div className="text-xs font-medium">
                Target: ${report.report_data.targetPrice}
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default SavedReportsList;
