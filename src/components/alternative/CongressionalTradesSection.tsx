import React, { useState } from 'react';
import { CongressionalTradesResponse, CongressionalTrade } from '@/types/alternative/companyNewsTypes';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { BadgeInfo, ChevronDown, ChevronUp, Download, ExternalLink, Search, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

interface CongressionalTradesSectionProps {
  data: CongressionalTradesResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const CongressionalTradesSection: React.FC<CongressionalTradesSectionProps> = ({ 
  data, 
  isLoading, 
  error,
  onRetry
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CongressionalTrade; direction: 'asc' | 'desc' }>({ 
    key: 'transactionDate', 
    direction: 'desc' 
  });
  const [visibleTrades, setVisibleTrades] = useState(10);
  const [dataSource, setDataSource] = useState<'all' | 'finnhub' | 'fmp'>('all');

  if (isLoading) {
    return <TradesLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">Failed to load congressional trading data</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No congressional trading data available for this stock</p>
      </div>
    );
  }

  const sourcedTrades = data.data.filter(trade => {
    if (dataSource === 'all') return true;
    return trade.source === dataSource;
  });

  const filteredTrades = sourcedTrades.filter(trade => 
    trade.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.assetName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedTrades = [...filteredTrades].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      if (sortConfig.direction === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      if (sortConfig.direction === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    }
    return 0;
  });

  const displayedTrades = sortedTrades.slice(0, visibleTrades);
  const hasMoreTrades = visibleTrades < sortedTrades.length;

  const purchases = filteredTrades.filter(t => t.transactionType === 'Purchase').length;
  const sales = filteredTrades.filter(t => t.transactionType === 'Sale').length;

  const hasMultipleSources = data?.data?.some(trade => trade.source === 'fmp') && 
                            data?.data?.some(trade => trade.source === 'finnhub');

  const downloadCSV = () => {
    const headers = ['Name', 'Position', 'Asset', 'Transaction Type', 'Transaction Date', 'Filing Date', 'Amount From', 'Amount To', 'Source', 'Link'];
    const csvRows = [
      headers.join(','),
      ...sortedTrades.map(trade => {
        return [
          `"${trade.name}"`,
          `"${trade.position}"`,
          `"${trade.assetName}"`,
          trade.transactionType,
          trade.transactionDate,
          trade.filingDate,
          trade.amountFrom,
          trade.amountTo,
          trade.source || 'finnhub',
          trade.link || ''
        ].join(',');
      })
    ];
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${data.symbol}_congressional_trades.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const requestSort = (key: keyof CongressionalTrade) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key: keyof CongressionalTrade) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp className="inline h-4 w-4" /> : <ChevronDown className="inline h-4 w-4" />;
  };

  const getSourceBadgeVariant = (source?: string) => {
    switch(source) {
      case 'fmp': return 'secondary';
      case 'finnhub': return 'outline';
      default: return 'default';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h3 className="text-xl font-semibold">Congressional Trading</h3>
        <div className="flex flex-wrap gap-2">
          {hasMultipleSources && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <Filter className="h-4 w-4" />
                  <span>Data Source: {dataSource === 'all' ? 'All' : dataSource.toUpperCase()}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Data Source</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setDataSource('all')}>
                  All Sources
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDataSource('finnhub')}>
                  Finnhub
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setDataSource('fmp')}>
                  FMP
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          <Button 
            size="sm" 
            variant="outline" 
            onClick={downloadCSV}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4"
      >
        <TradingSummaryCard
          title="Total Transactions"
          value={filteredTrades.length.toString()}
          icon={<BadgeInfo className="h-5 w-5" />}
        />
        <TradingSummaryCard
          title="Purchases"
          value={purchases.toString()}
          icon={<BadgeInfo className="h-5 w-5 text-green-500" />}
        />
        <TradingSummaryCard
          title="Sales"
          value={sales.toString()}
          icon={<BadgeInfo className="h-5 w-5 text-red-500" />}
        />
      </motion.div>
      
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, position, or asset..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-md border overflow-hidden"
      >
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => requestSort('name')}
                >
                  Name {getSortIndicator('name')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => requestSort('position')}
                >
                  Position {getSortIndicator('position')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => requestSort('transactionType')}
                >
                  Type {getSortIndicator('transactionType')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer" 
                  onClick={() => requestSort('transactionDate')}
                >
                  Date {getSortIndicator('transactionDate')}
                </TableHead>
                <TableHead 
                  className="cursor-pointer"
                  onClick={() => requestSort('amountFrom')}
                >
                  Amount {getSortIndicator('amountFrom')}
                </TableHead>
                <TableHead>Asset</TableHead>
                {hasMultipleSources && (
                  <TableHead>Source</TableHead>
                )}
                <TableHead>Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTrades.map((trade, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{trade.name}</TableCell>
                  <TableCell>{trade.position}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={trade.transactionType === 'Purchase' ? 'secondary' : 'destructive'}
                    >
                      {trade.transactionType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span>{format(new Date(trade.transactionDate), 'MM/dd/yyyy')}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          Filed on: {format(new Date(trade.filingDate), 'MM/dd/yyyy')}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    {trade.amountFrom === trade.amountTo 
                      ? `$${trade.amountFrom.toLocaleString()}`
                      : `$${trade.amountFrom.toLocaleString()} - $${trade.amountTo.toLocaleString()}`
                    }
                  </TableCell>
                  <TableCell>{trade.assetName}</TableCell>
                  {hasMultipleSources && (
                    <TableCell>
                      <Badge variant={getSourceBadgeVariant(trade.source)}>
                        {trade.source || 'finnhub'}
                      </Badge>
                    </TableCell>
                  )}
                  <TableCell>
                    {trade.link && (
                      <a 
                        href={trade.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:text-blue-700 flex items-center"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {hasMoreTrades && (
          <div className="flex justify-center p-4">
            <Button 
              variant="outline" 
              onClick={() => setVisibleTrades(prev => prev + 10)}
            >
              Show More
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const TradingSummaryCard: React.FC<{ title: string; value: string; icon: React.ReactNode }> = ({ title, value, icon }) => {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
};

const TradesLoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-5 rounded-full" />
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
    <Skeleton className="h-10 w-full mb-4" />
    <div>
      <Skeleton className="h-10 w-full mb-2" />
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full mb-2" />
      ))}
    </div>
  </div>
);

export default CongressionalTradesSection;
