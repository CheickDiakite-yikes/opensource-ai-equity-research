
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/components/ui/tooltip';

interface TradesHeaderProps {
  title: string;
  hasMultipleSources: boolean;
  dataSource: 'all' | 'finnhub' | 'fmp';
  onSourceChange: (source: 'all' | 'finnhub' | 'fmp') => void;
  onExportCSV: () => void;
  sourcesAvailable?: {
    finnhub: boolean;
    fmpHouse: boolean;
    fmpSenate: boolean;
  };
}

const TradesHeader: React.FC<TradesHeaderProps> = ({
  title,
  hasMultipleSources,
  dataSource,
  onSourceChange,
  onExportCSV,
  sourcesAvailable = { finnhub: false, fmpHouse: false, fmpSenate: false }
}) => {
  const { finnhub, fmpHouse, fmpSenate } = sourcesAvailable;
  const sourceCount = [finnhub, fmpHouse, fmpSenate].filter(Boolean).length;
  
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <div className="flex items-center gap-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                <Info className="h-4 w-4 text-muted-foreground cursor-help" />
              </div>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>Data from {sourceCount} source{sourceCount !== 1 ? 's' : ''}:
                {finnhub && ' Finnhub'}
                {fmpHouse && ' FMP House'}
                {fmpSenate && ' FMP Senate'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
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
              <DropdownMenuItem onClick={() => onSourceChange('all')}>
                All Sources
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSourceChange('finnhub')}>
                Finnhub
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onSourceChange('fmp')}>
                FMP
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onExportCSV}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Export CSV</span>
        </Button>
      </div>
    </div>
  );
};

export default TradesHeader;
