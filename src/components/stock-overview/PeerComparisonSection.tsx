
import React, { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, RefreshCw } from "lucide-react";
import { StockProfile, StockQuote } from "@/types";
import { PeerCompany, fetchPeerComparisonData } from "@/services/api/peerComparisonService";
import { formatLargeNumber, formatPercentage } from "@/utils/financial/formatUtils";

interface PeerComparisonSectionProps {
  symbol: string;
  profile: StockProfile;
  quote: StockQuote;
}

const PeerComparisonSection: React.FC<PeerComparisonSectionProps> = ({
  symbol,
  profile,
  quote
}) => {
  const [peerData, setPeerData] = useState<PeerCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPeerData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPeerComparisonData(symbol, profile, quote);
      setPeerData(data);
    } catch (err) {
      console.error("Failed to load peer data:", err);
      setError("Failed to load peer comparison data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (symbol && profile && quote) {
      loadPeerData();
    }
  }, [symbol, profile, quote]);

  const exportToCSV = () => {
    if (peerData.length === 0) return;

    // Create CSV header
    const headers = [
      "Symbol", "Company", "Price", "Market Cap", "Enterprise Value", 
      "P/E Ratio", "EV/EBITDA", "EV/Revenue", 
      "Revenue Growth", "Gross Margin", "Operating Margin", "Net Margin"
    ];

    // Create CSV rows
    const rows = peerData.map(peer => [
      peer.symbol,
      peer.name,
      peer.price.toString(),
      peer.marketCap.toString(),
      peer.enterpriseValue.toString(),
      peer.peRatio.toString(),
      peer.evToEbitda.toString(),
      peer.evToRevenue.toString(),
      peer.revenueGrowth?.toString() || "",
      peer.grossMargin?.toString() || "",
      peer.operatingMargin?.toString() || "",
      peer.netMargin?.toString() || ""
    ]);

    // Combine header and rows
    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    // Create a Blob and download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${symbol}_peer_comparison.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Public Comparables</span>
            <Button size="sm" variant="outline" onClick={loadPeerData}>
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl flex justify-between items-center">
          <span>Public Comparables</span>
          {!isLoading && peerData.length > 0 && (
            <Button size="sm" variant="outline" onClick={exportToCSV}>
              <Download className="mr-2 h-4 w-4" /> Export to CSV
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : peerData.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No comparable companies found for {symbol}.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Ticker</TableHead>
                  <TableHead className="font-semibold">Company</TableHead>
                  <TableHead className="font-semibold text-right">Price</TableHead>
                  <TableHead className="font-semibold text-right">Market Cap</TableHead>
                  <TableHead className="font-semibold text-right">EV/EBITDA</TableHead>
                  <TableHead className="font-semibold text-right">P/E</TableHead>
                  <TableHead className="font-semibold text-right">EV/Revenue</TableHead>
                  <TableHead className="font-semibold text-right">Gross Margin</TableHead>
                  <TableHead className="font-semibold text-right">Op. Margin</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {peerData.map((peer) => {
                  const isHighlighted = peer.symbol === symbol;
                  return (
                    <TableRow 
                      key={peer.symbol}
                      className={isHighlighted ? "bg-primary/5 font-medium" : ""}
                    >
                      <TableCell className="font-medium">{peer.symbol}</TableCell>
                      <TableCell>{peer.name}</TableCell>
                      <TableCell className="text-right">${peer.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">{formatLargeNumber(peer.marketCap)}</TableCell>
                      <TableCell className="text-right">{peer.evToEbitda?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell className="text-right">{peer.peRatio?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell className="text-right">{peer.evToRevenue?.toFixed(2) || "N/A"}</TableCell>
                      <TableCell className="text-right">{peer.grossMargin ? formatPercentage(peer.grossMargin) : "N/A"}</TableCell>
                      <TableCell className="text-right">{peer.operatingMargin ? formatPercentage(peer.operatingMargin) : "N/A"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PeerComparisonSection;
