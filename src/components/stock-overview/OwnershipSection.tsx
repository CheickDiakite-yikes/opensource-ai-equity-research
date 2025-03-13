
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RotateCw, AlertTriangle } from "lucide-react";
import { OwnershipData } from "@/types/profile/ownershipTypes";
import { formatDate, formatLargeNumber, formatPercentage } from "@/utils/financial/formatUtils";

interface OwnershipSectionProps {
  ownershipData: OwnershipData | null;
  isLoading: boolean;
  symbol: string;
}

const OwnershipSection = ({ ownershipData, isLoading, symbol }: OwnershipSectionProps) => {
  const [limit, setLimit] = useState<number>(10);
  const [showAllColumns, setShowAllColumns] = useState<boolean>(false);
  
  const downloadCSV = () => {
    if (!ownershipData || !ownershipData.ownership || ownershipData.ownership.length === 0) return;
    
    // Create headers based on available data
    const sampleItem = ownershipData.ownership[0];
    const headers = ["Investor", "Shares", "Change", "Filing Date"];
    
    // Add extra headers if available
    if (sampleItem.marketValue !== undefined) headers.push("Market Value");
    if (sampleItem.portfolioPercent !== undefined) headers.push("Portfolio %");
    if (sampleItem.portfolioName !== undefined) headers.push("Portfolio Name");
    if (sampleItem.reportDate !== undefined) headers.push("Report Date");
    if (sampleItem.position !== undefined) headers.push("Position");
    
    // Create rows with all available data
    const rows = ownershipData.ownership.map(item => {
      const row = [
        item.name,
        item.share.toString(),
        item.change.toString(),
        item.filingDate
      ];
      
      // Add extra data if available
      if (sampleItem.marketValue !== undefined) row.push(item.marketValue?.toString() || "");
      if (sampleItem.portfolioPercent !== undefined) row.push(item.portfolioPercent?.toString() || "");
      if (sampleItem.portfolioName !== undefined) row.push(item.portfolioName || "");
      if (sampleItem.reportDate !== undefined) row.push(item.reportDate || "");
      if (sampleItem.position !== undefined) row.push(item.position?.toString() || "");
      
      return row;
    });
    
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${symbol}_ownership.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleShowMore = () => {
    setLimit(prev => Math.min(prev + 10, 100));
  };
  
  const handleShowAllColumns = () => {
    setShowAllColumns(prev => !prev);
  };

  // Check if additional data is available
  const hasAdditionalData = ownershipData?.ownership && ownershipData.ownership.length > 0 && (
    ownershipData.ownership[0].marketValue !== undefined ||
    ownershipData.ownership[0].portfolioPercent !== undefined ||
    ownershipData.ownership[0].portfolioName !== undefined
  );

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-4 flex items-center">
            <span>Ownership</span>
            <Skeleton className="h-4 w-20 ml-2" />
          </h3>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex justify-between mb-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasData = ownershipData && ownershipData.ownership && ownershipData.ownership.length > 0;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium">Ownership</h3>
          <div className="flex gap-2">
            {hasData && hasAdditionalData && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs" 
                onClick={handleShowAllColumns}
              >
                {showAllColumns ? "Show Basic Columns" : "Show All Columns"}
              </Button>
            )}
            {hasData && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs" 
                onClick={downloadCSV}
              >
                <Download className="h-3 w-3 mr-1" /> Export
              </Button>
            )}
          </div>
        </div>
        
        {hasData ? (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Investor</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                    <TableHead className="text-right">Filing Date</TableHead>
                    {showAllColumns && ownershipData.ownership[0].marketValue !== undefined && (
                      <TableHead className="text-right">Market Value</TableHead>
                    )}
                    {showAllColumns && ownershipData.ownership[0].portfolioPercent !== undefined && (
                      <TableHead className="text-right">Portfolio %</TableHead>
                    )}
                    {showAllColumns && ownershipData.ownership[0].portfolioName !== undefined && (
                      <TableHead className="text-right">Portfolio</TableHead>
                    )}
                    {showAllColumns && ownershipData.ownership[0].reportDate !== undefined && (
                      <TableHead className="text-right">Report Date</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownershipData.ownership.slice(0, limit).map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-right">{formatLargeNumber(item.share)}</TableCell>
                      <TableCell className={`text-right ${item.change > 0 ? 'text-green-500' : item.change < 0 ? 'text-red-500' : ''}`}>
                        {item.change > 0 ? '+' : ''}{formatLargeNumber(item.change)}
                      </TableCell>
                      <TableCell className="text-right">{formatDate(item.filingDate)}</TableCell>
                      {showAllColumns && item.marketValue !== undefined && (
                        <TableCell className="text-right">{formatLargeNumber(item.marketValue)}</TableCell>
                      )}
                      {showAllColumns && item.portfolioPercent !== undefined && (
                        <TableCell className="text-right">{formatPercentage(item.portfolioPercent)}</TableCell>
                      )}
                      {showAllColumns && item.portfolioName !== undefined && (
                        <TableCell className="text-right">{item.portfolioName}</TableCell>
                      )}
                      {showAllColumns && item.reportDate !== undefined && (
                        <TableCell className="text-right">{formatDate(item.reportDate)}</TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {ownershipData.ownership.length > limit && limit < 100 && (
              <div className="flex justify-center mt-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleShowMore}
                >
                  Show More
                </Button>
              </div>
            )}
            
            {limit >= 100 && ownershipData.ownership.length > 100 && (
              <div className="flex items-center justify-center mt-4 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3 mr-1" />
                <span>Showing top 100 investors. Export to CSV for complete data.</span>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>No ownership data available for this symbol</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
            >
              <RotateCw className="h-3 w-3 mr-1" /> Refresh
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OwnershipSection;
