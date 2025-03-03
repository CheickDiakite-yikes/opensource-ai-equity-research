
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SECFiling } from "@/types";
import { FileText, Download, ExternalLink } from "lucide-react";

interface SECFilingsSectionProps {
  secFilings: SECFiling[];
  isLoading: boolean;
  symbol: string;
  companyName: string;
}

const SECFilingsSection = ({ secFilings, isLoading, symbol, companyName }: SECFilingsSectionProps) => {
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
                  <tr key={index} className="border-b last:border-0">
                    <td className="py-3">{filing.type || filing.form}</td>
                    <td className="py-3">{new Date(filing.reportDate).toLocaleDateString()}</td>
                    <td className="py-3">{new Date(filing.filingDate).toLocaleDateString()}</td>
                    <td className="py-3 text-right">
                      <Button variant="ghost" size="sm" className="gap-1 text-primary" asChild>
                        <a href={filing.url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-3.5 w-3.5" />
                          <span>Download</span>
                        </a>
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
