
import React from 'react';
import { format } from 'date-fns';
import { CongressionalTrade } from '@/types/alternative/companyNewsTypes';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TradesTableProps {
  trades: CongressionalTrade[];
  sortConfig: { key: keyof CongressionalTrade; direction: 'asc' | 'desc' };
  onRequestSort: (key: keyof CongressionalTrade) => void;
  onShowMoreClick: () => void;
  visibleTrades: number;
  hasMoreTrades: boolean;
  hasMultipleSources: boolean;
}

const TradesTable: React.FC<TradesTableProps> = ({
  trades,
  sortConfig,
  onRequestSort,
  onShowMoreClick,
  visibleTrades,
  hasMoreTrades,
  hasMultipleSources
}) => {
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
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => onRequestSort('name')}
              >
                Name {getSortIndicator('name')}
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => onRequestSort('position')}
              >
                Position {getSortIndicator('position')}
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => onRequestSort('transactionType')}
              >
                Type {getSortIndicator('transactionType')}
              </TableHead>
              <TableHead 
                className="cursor-pointer" 
                onClick={() => onRequestSort('transactionDate')}
              >
                Date {getSortIndicator('transactionDate')}
              </TableHead>
              <TableHead 
                className="cursor-pointer"
                onClick={() => onRequestSort('amountFrom')}
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
            {trades.slice(0, visibleTrades).map((trade, index) => (
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
            {trades.length === 0 && (
              <TableRow>
                <TableCell colSpan={hasMultipleSources ? 8 : 7} className="text-center py-8">
                  No trading data found for this symbol.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {hasMoreTrades && (
        <div className="flex justify-center p-4">
          <Button 
            variant="outline" 
            onClick={onShowMoreClick}
          >
            Show More
          </Button>
        </div>
      )}
    </div>
  );
};

export default TradesTable;
