
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RotateCw } from "lucide-react";
import { OwnershipData } from "@/types/profile/ownershipTypes";
import { formatDate, formatLargeNumber } from "@/utils/financial/formatUtils";

interface OwnershipSectionProps {
  ownershipData: OwnershipData | null;
  isLoading: boolean;
  symbol: string;
}

const OwnershipSection = ({ ownershipData, isLoading, symbol }: OwnershipSectionProps) => {
  const [limit, setLimit] = useState<number>(10);
  
  const downloadCSV = () => {
    if (!ownershipData || !ownershipData.ownership || ownershipData.ownership.length === 0) return;
    
    // Create CSV content
    const headers = ["Investor", "Shares", "Change", "Filing Date"];
    const rows = ownershipData.ownership.map(item => [
      item.name,
      item.share.toString(),
      item.change.toString(),
      item.filingDate
    ]);
    
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
    setLimit(prev => prev + 10);
  };

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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {ownershipData.ownership.length > limit && (
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
