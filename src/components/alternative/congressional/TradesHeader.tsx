
import React from 'react';
import { Button } from '@/components/ui/button';
import { Filter, Download } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

interface TradesHeaderProps {
  title: string;
  hasMultipleSources: boolean;
  dataSource: 'all' | 'finnhub' | 'fmp';
  onSourceChange: (source: 'all' | 'finnhub' | 'fmp') => void;
  onExportCSV: () => void;
}

const TradesHeader: React.FC<TradesHeaderProps> = ({
  title,
  hasMultipleSources,
  dataSource,
  onSourceChange,
  onExportCSV
}) => {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4">
      <h3 className="text-xl font-semibold">{title}</h3>
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
