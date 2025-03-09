
import React, { useState, useEffect } from 'react';
import { CongressionalTradesResponse, CongressionalTrade } from '@/types/alternative/companyNewsTypes';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Import the component files
import TradesLoadingSkeleton from './congressional/TradesLoadingSkeleton';
import TradesHeader from './congressional/TradesHeader';
import TradesTable from './congressional/TradesTable';
import TradesSummary from './congressional/TradesSummary';
import TradesSearchBar from './congressional/TradesSearchBar';

interface CongressionalTradesSectionProps {
  data: CongressionalTradesResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
  fmpHouseAvailable?: boolean;
  fmpSenateAvailable?: boolean;
  finnhubAvailable?: boolean;
}

const CongressionalTradesSection: React.FC<CongressionalTradesSectionProps> = ({ 
  data, 
  isLoading, 
  error,
  onRetry,
  fmpHouseAvailable = false,
  fmpSenateAvailable = false,
  finnhubAvailable = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof CongressionalTrade; direction: 'asc' | 'desc' }>({ 
    key: 'transactionDate', 
    direction: 'desc' 
  });
  const [visibleTrades, setVisibleTrades] = useState(10);
  const [dataSource, setDataSource] = useState<'all' | 'finnhub' | 'fmp'>('all');

  // Debug logging
  useEffect(() => {
    console.log('CongressionalTradesSection data:', data);
    console.log('isLoading:', isLoading);
    console.log('error:', error);
    console.log('Data sources available:', {
      fmpHouse: fmpHouseAvailable,
      fmpSenate: fmpSenateAvailable,
      finnhub: finnhubAvailable
    });
  }, [data, isLoading, error, fmpHouseAvailable, fmpSenateAvailable, finnhubAvailable]);

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
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  // Apply the source filter
  const sourcedTrades = data.data.filter(trade => {
    if (dataSource === 'all') return true;
    return trade.source === dataSource;
  });

  // Apply the search filter
  const filteredTrades = sourcedTrades.filter(trade => 
    trade.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.position?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.assetName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort the filtered trades
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

  const hasMoreTrades = visibleTrades < sortedTrades.length;
  const purchases = filteredTrades.filter(t => t.transactionType === 'Purchase').length;
  const sales = filteredTrades.filter(t => t.transactionType === 'Sale').length;
  
  // Check if we have data from multiple sources
  const hasFinnhubData = data.data.some(trade => trade.source === 'finnhub');
  const hasFmpData = data.data.some(trade => trade.source === 'fmp');
  const hasMultipleSources = hasFinnhubData && hasFmpData;

  // Debug logging
  console.log('Trading data sources detected:', { hasFinnhubData, hasFmpData, hasMultipleSources });
  console.log('Filtered trades count:', filteredTrades.length);

  const downloadCSV = () => {
    const headers = ['Name', 'Position', 'Asset', 'Transaction Type', 'Transaction Date', 'Filing Date', 'Amount From', 'Amount To', 'Source', 'Link'];
    const csvRows = [
      headers.join(','),
      ...sortedTrades.map(trade => {
        return [
          `"${trade.name || ''}"`,
          `"${trade.position || ''}"`,
          `"${trade.assetName || ''}"`,
          trade.transactionType || '',
          trade.transactionDate || '',
          trade.filingDate || '',
          trade.amountFrom || 0,
          trade.amountTo || 0,
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

  return (
    <div className="space-y-4">
      <TradesHeader 
        title="Congressional Trading"
        hasMultipleSources={hasMultipleSources}
        dataSource={dataSource}
        onSourceChange={setDataSource}
        onExportCSV={downloadCSV}
        sourcesAvailable={{
          finnhub: finnhubAvailable || hasFinnhubData,
          fmpHouse: fmpHouseAvailable,
          fmpSenate: fmpSenateAvailable
        }}
      />
      
      <TradesSummary 
        totalTrades={filteredTrades.length} 
        purchases={purchases} 
        sales={sales} 
      />
      
      <TradesSearchBar 
        searchTerm={searchTerm} 
        onSearchChange={setSearchTerm} 
        placeholder="Search by name, position, asset, or chamber (House/Senate)..."
      />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <TradesTable 
          trades={sortedTrades}
          sortConfig={sortConfig}
          onRequestSort={requestSort}
          onShowMoreClick={() => setVisibleTrades(prev => prev + 10)}
          visibleTrades={visibleTrades}
          hasMoreTrades={hasMoreTrades}
          hasMultipleSources={hasMultipleSources}
        />
      </motion.div>
    </div>
  );
};

export default CongressionalTradesSection;
