
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Clock, Download, Trash2 } from "lucide-react";
import { SavedReport } from "@/hooks/saved-content";
import { motion } from "framer-motion";

interface SavedReportsListProps {
  reports: SavedReport[];
  selectedReport: SavedReport | null;
  onSelectReport: (report: SavedReport) => void;
  onDeleteReport: (reportId: string, e: React.MouseEvent) => Promise<void>;
  onDownloadHtml: (report: SavedReport, e: React.MouseEvent) => void;
}

const SavedReportsList: React.FC<SavedReportsListProps> = ({
  reports,
  selectedReport,
  onSelectReport,
  onDeleteReport,
  onDownloadHtml,
}) => {
  if (reports.length === 0) {
    return (
      <div className="text-center p-4 bg-muted/30 rounded-lg">
        <p className="text-muted-foreground">No saved reports found.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/40">
      {reports.map((report, index) => (
        <motion.div 
          key={report.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`cursor-pointer group p-4 hover:bg-primary/5 transition-all ${
            selectedReport?.id === report.id ? 'bg-primary/10' : ''
          }`}
          onClick={() => onSelectReport(report)}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`text-base font-medium ${
                selectedReport?.id === report.id ? 'text-primary' : ''
              }`}>
                {report.symbol}
              </h3>
              <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                {report.company_name}
              </p>
              
              <div className="flex items-center gap-2 mt-2">
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}</span>
                </div>
                
                {report.html_content && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-800">
                    HTML
                  </span>
                )}
                
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                  {report.report_data.recommendation}
                </span>
              </div>
            </div>
            
            <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {report.html_content && (
                <button
                  className="p-1.5 rounded-full hover:bg-primary/10 transition-colors"
                  onClick={(e) => onDownloadHtml(report, e)}
                  title="Download HTML"
                >
                  <Download className="h-3.5 w-3.5 text-primary" />
                </button>
              )}
              <button
                className="p-1.5 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                onClick={(e) => onDeleteReport(report.id, e)}
                title="Delete report"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-2">
            <div className="w-full flex justify-end">
              <span className="text-xs font-medium">
                Target: ${report.report_data.targetPrice}
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SavedReportsList;
