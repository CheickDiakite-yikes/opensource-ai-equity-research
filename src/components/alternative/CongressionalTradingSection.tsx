
import React, { useState } from 'react';
import { CongressionalTradesResponse } from '@/types/alternative';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, TrendingDown, Download, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from '@/components/ui/badge';

interface CongressionalTradingSectionProps {
  trading: CongressionalTradesResponse | null;
  loading: boolean;
  error: string | null;
}

const CongressionalTradingSection: React.FC<CongressionalTradingSectionProps> = ({ 
  trading, 
  loading, 
  error 
}) => {
  const [visibleRows, setVisibleRows] = useState(10);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Failed to load congressional trading data</h3>
        <p className="text-sm text-red-500 mt-1">{error}</p>
      </div>
    );
  }

  if (!trading || !trading.data || trading.data.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No congressional trading data available for this company.</p>
      </div>
    );
  }

  // Format the amount as a currency range
  const formatAmountRange = (from: number, to: number) => {
    return `$${from.toLocaleString()} - $${to.toLocaleString()}`;
  };

  // Download data as CSV
  const downloadCsv = () => {
    // CSV headers
    const headers = [
      'Name',
      'Position',
      'Asset Name',
      'Transaction Type',
      'Amount From',
      'Amount To',
      'Transaction Date',
      'Filing Date'
    ];

    // Format data for CSV
    const csvData = trading.data.map(trade => [
      trade.name,
      trade.position,
      trade.assetName,
      trade.transactionType,
      trade.amountFrom,
      trade.amountTo,
      trade.transactionDate,
      trade.filingDate
    ]);

    // Combine headers and data
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create a blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${trading.symbol}_congressional_trading.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate stats
  const purchases = trading.data.filter(t => t.transactionType === 'Purchase');
  const sales = trading.data.filter(t => t.transactionType === 'Sale');
  const totalPurchaseValue = purchases.reduce((sum, t) => sum + t.amountTo, 0);
  const totalSaleValue = sales.reduce((sum, t) => sum + t.amountTo, 0);
  
  // Show more functionality
  const hasMore = trading.data.length > visibleRows;
  const visibleData = trading.data.slice(0, visibleRows);
  const showMore = () => setVisibleRows(prev => prev + 10);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <div>
          <h3 className="text-lg font-medium">Congressional Trading</h3>
          <p className="text-sm text-muted-foreground">
            Stock trades disclosed by members of Congress
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={downloadCsv} className="mt-2 sm:mt-0">
          <Download className="h-4 w-4 mr-1" />
          Download CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Purchases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold text-green-500">{purchases.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total value: ${totalPurchaseValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-2xl font-bold text-red-500">{sales.length}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total value: ${totalSaleValue.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Net Flow</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {totalPurchaseValue > totalSaleValue ? (
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={`text-2xl font-bold ${totalPurchaseValue > totalSaleValue ? 'text-green-500' : 'text-red-500'}`}>
                ${Math.abs(totalPurchaseValue - totalSaleValue).toLocaleString()}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalPurchaseValue > totalSaleValue ? 'Net buying' : 'Net selling'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
          <CardDescription>Recent congressional trades for {trading.symbol}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Representative</TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleData.map((trade, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{trade.name}</span>
                        <span className="text-xs text-muted-foreground">{trade.position}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={trade.transactionType === 'Purchase' ? 'default' : 'destructive'}>
                        {trade.transactionType}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatAmountRange(trade.amountFrom, trade.amountTo)}</TableCell>
                    <TableCell>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center">
                              {trade.assetName.length > 30 
                                ? `${trade.assetName.substring(0, 30)}...` 
                                : trade.assetName}
                              {trade.assetName.length > 30 && (
                                <Info className="h-3 w-3 ml-1 text-muted-foreground" />
                              )}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{trade.assetName}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{format(new Date(trade.transactionDate), 'MMM d, yyyy')}</span>
                        <span className="text-xs text-muted-foreground">
                          Filed: {format(new Date(trade.filingDate), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {hasMore && (
            <div className="flex justify-center mt-4">
              <Button variant="outline" onClick={showMore}>
                Show More ({trading.data.length - visibleRows} remaining)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CongressionalTradingSection;
