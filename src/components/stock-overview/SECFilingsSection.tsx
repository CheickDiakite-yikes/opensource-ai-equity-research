
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { SECFiling } from "@/types";
import { FileText, Download, ExternalLink } from "lucide-react";
import { getSECFilingDownloadLink } from "@/services/api/documents/filings";

interface SECFilingsSectionProps {
  secFilings: SECFiling[];
  isLoading: boolean;
  symbol: string;
  companyName: string;
}

const SECFilingsSection = ({ secFilings, isLoading, symbol, companyName }: SECFilingsSectionProps) => {
  const [downloadingIds, setDownloadingIds] = useState<Set<number | string>>(new Set());

  const handleDownload = async (filing: SECFiling) => {
    try {
      // Mark this filing as downloading
      setDownloadingIds(prev => new Set(prev).add(filing.id || filing.filingNumber));
      
      // Get download link (this will also cache the document)
      const downloadUrl = await getSECFilingDownloadLink(
        filing.url,
        filing.id,
        filing.symbol,
        filing.form,
        filing.filingDate
      );
      
      // Open in new tab
      window.open(downloadUrl, '_blank');
      
      toast({
        title: "SEC Filing",
        description: `${filing.type} downloaded successfully`,
      });
    } catch (error) {
      console.error("Error downloading SEC filing:", error);
      toast({
        title: "Download Error",
        description: "Failed to download the SEC filing",
        variant: "destructive",
      });
    } finally {
      // Remove from downloading state
      setDownloadingIds(prev => {
        const next = new Set(prev);
        next.delete(filing.id || filing.filingNumber);
        return next;
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <FileText className="h-5 w-5 mr-2 text-primary" />
          SEC Filings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : secFilings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Filing Type</th>
                  <th className="text-left py-2 font-medium">Period End</th>
                  <th className="text-left py-2 font-medium">Filed Date</th>
                  <th className="text-right py-2 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {secFilings.map((filing, index) => (
                  <tr key={filing.id || index} className="border-b last:border-0">
                    <td className="py-3">{filing.type || filing.form}</td>
                    <td className="py-3">{new Date(filing.reportDate).toLocaleDateString()}</td>
                    <td className="py-3">{new Date(filing.filingDate).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="gap-1 text-primary"
                        onClick={() => handleDownload(filing)}
                        disabled={downloadingIds.has(filing.id || filing.filingNumber)}
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>{downloadingIds.has(filing.id || filing.filingNumber) ? 'Downloading...' : 'Download'}</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No SEC filings available
          </div>
        )}
        <div className="mt-4 text-center">
          <Button variant="outline" size="sm" asChild>
            <a 
              href={`https://www.sec.gov/edgar/search/#/entityName=${companyName}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="gap-1"
            >
              <ExternalLink className="h-4 w-4" />
              <span>View All Filings on SEC.gov</span>
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SECFilingsSection;
