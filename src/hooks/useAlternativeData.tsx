
import { useState, useEffect, useCallback } from 'react';
import { invokeSupabaseFunction } from '@/services/api/base';
import { AlternativeDataState, CompanyNews, SocialSentimentResponse, CongressionalTradesResponse } from '@/types/alternative/companyNewsTypes';
import { toast } from 'sonner';

type DataType = 'news' | 'sentiment' | 'congressional' | 'fmpHouseTrades' | 'fmpSenateTrades' | 'all';

export const useAlternativeData = (symbol: string) => {
  const [state, setState] = useState<AlternativeDataState>({
    companyNews: [],
    socialSentiment: null,
    congressionalTrading: null,
    fmpHouseTrades: null,
    fmpSenateTrades: null,
    loading: {
      news: true,
      sentiment: true,
      congressional: true,
      fmpHouseTrades: true,
      fmpSenateTrades: true
    },
    error: {
      news: null,
      sentiment: null,
      congressional: null,
      fmpHouseTrades: null,
      fmpSenateTrades: null
    }
  });

  const fetchCompanyNews = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, news: true },
        error: { ...prev.error, news: null }
      }));
      
      const newsData = await invokeSupabaseFunction<CompanyNews[]>('get-finnhub-company-news', { symbol });
      
      setState(prev => ({
        ...prev,
        companyNews: newsData || [],
        loading: { ...prev.loading, news: false }
      }));
    } catch (error) {
      console.error('Error fetching company news:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, news: error.message },
        loading: { ...prev.loading, news: false }
      }));
      toast.error('Failed to load company news data');
    }
  }, [symbol]);

  const fetchSocialSentiment = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, sentiment: true },
        error: { ...prev.error, sentiment: null }
      }));
      
      const sentimentData = await invokeSupabaseFunction<SocialSentimentResponse>(
        'get-finnhub-social-sentiment', 
        { symbol }
      );
      
      setState(prev => ({
        ...prev,
        socialSentiment: sentimentData,
        loading: { ...prev.loading, sentiment: false }
      }));
    } catch (error) {
      console.error('Error fetching social sentiment data:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, sentiment: error.message },
        loading: { ...prev.loading, sentiment: false }
      }));
      toast.error('Failed to load social sentiment data');
    }
  }, [symbol]);

  const fetchCongressionalTrading = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, congressional: true },
        error: { ...prev.error, congressional: null }
      }));
      
      // Get current date and three years ago for better results with more data
      const now = new Date();
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(now.getFullYear() - 3);
      
      const from = Math.floor(threeYearsAgo.getTime() / 1000);
      const to = Math.floor(now.getTime() / 1000);
      
      console.log(`Fetching congressional trading data for ${symbol} from ${new Date(from * 1000).toLocaleDateString()} to ${new Date(to * 1000).toLocaleDateString()}`);
      
      const congressionalData = await invokeSupabaseFunction<CongressionalTradesResponse>(
        'get-finnhub-congressional-trading', 
        { symbol, from, to }
      );
      
      setState(prev => ({
        ...prev,
        congressionalTrading: congressionalData,
        loading: { ...prev.loading, congressional: false }
      }));
      
      if (!congressionalData?.data?.length) {
        console.log(`No congressional trading data found for ${symbol} from Finnhub`);
      } else {
        console.log(`Received ${congressionalData.data.length} congressional trading records from Finnhub`);
      }
    } catch (error) {
      console.error('Error fetching congressional trading data:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, congressional: error.message },
        loading: { ...prev.loading, congressional: false }
      }));
      toast.error('Failed to load congressional trading data from Finnhub');
    }
  }, [symbol]);

  const fetchFmpHouseTrades = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, fmpHouseTrades: true },
        error: { ...prev.error, fmpHouseTrades: null }
      }));
      
      console.log(`Fetching FMP House trades data for ${symbol}`);
      
      const houseTradesData = await invokeSupabaseFunction<CongressionalTradesResponse>(
        'get-fmp-house-trades', 
        { symbol }
      );
      
      setState(prev => ({
        ...prev,
        fmpHouseTrades: houseTradesData,
        loading: { ...prev.loading, fmpHouseTrades: false }
      }));
      
      if (!houseTradesData?.data?.length) {
        console.log(`No house trades data found for ${symbol} from FMP`);
      } else {
        console.log(`Received ${houseTradesData.data.length} house trades records from FMP`);
      }
    } catch (error) {
      console.error('Error fetching FMP house trades data:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, fmpHouseTrades: error.message },
        loading: { ...prev.loading, fmpHouseTrades: false }
      }));
      toast.error('Failed to load FMP house trades data');
    }
  }, [symbol]);

  const fetchFmpSenateTrades = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, fmpSenateTrades: true },
        error: { ...prev.error, fmpSenateTrades: null }
      }));
      
      console.log(`Fetching FMP Senate trades data for ${symbol}`);
      
      const senateTradesData = await invokeSupabaseFunction<CongressionalTradesResponse>(
        'get-fmp-senate-trades', 
        { symbol }
      );
      
      setState(prev => ({
        ...prev,
        fmpSenateTrades: senateTradesData,
        loading: { ...prev.loading, fmpSenateTrades: false }
      }));
      
      if (!senateTradesData?.data?.length) {
        console.log(`No senate trades data found for ${symbol} from FMP`);
      } else {
        console.log(`Received ${senateTradesData.data.length} senate trades records from FMP`);
      }
    } catch (error) {
      console.error('Error fetching FMP senate trades data:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, fmpSenateTrades: error.message },
        loading: { ...prev.loading, fmpSenateTrades: false }
      }));
      toast.error('Failed to load FMP senate trades data');
    }
  }, [symbol]);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchCompanyNews(),
      fetchSocialSentiment(),
      fetchCongressionalTrading(),
      fetchFmpHouseTrades(),
      fetchFmpSenateTrades()
    ]);
  }, [fetchCompanyNews, fetchSocialSentiment, fetchCongressionalTrading, fetchFmpHouseTrades, fetchFmpSenateTrades]);

  const refreshData = useCallback((dataType: DataType = 'all') => {
    if (dataType === 'all') {
      fetchAllData();
      return;
    }
    
    if (dataType === 'news') {
      fetchCompanyNews();
    } else if (dataType === 'sentiment') {
      fetchSocialSentiment();
    } else if (dataType === 'congressional') {
      fetchCongressionalTrading();
    } else if (dataType === 'fmpHouseTrades') {
      fetchFmpHouseTrades();
    } else if (dataType === 'fmpSenateTrades') {
      fetchFmpSenateTrades();
    }
  }, [fetchAllData, fetchCompanyNews, fetchSocialSentiment, fetchCongressionalTrading, fetchFmpHouseTrades, fetchFmpSenateTrades]);

  useEffect(() => {
    if (!symbol) return;
    fetchAllData();
  }, [symbol, fetchAllData]);

  // Combine congressional trading data from all sources
  const combinedCongressionalTrading = useCallback(() => {
    if (!state.congressionalTrading && !state.fmpHouseTrades && !state.fmpSenateTrades) {
      return null;
    }

    const finnhubData = state.congressionalTrading?.data || [];
    const fmpHouseData = state.fmpHouseTrades?.data || [];
    const fmpSenateData = state.fmpSenateTrades?.data || [];
    
    // Mark the source of each trade
    const markedFinnhubData = finnhubData.map(trade => ({
      ...trade,
      source: 'finnhub' as const
    }));
    
    const markedFmpHouseData = fmpHouseData.map(trade => ({
      ...trade,
      source: 'fmp' as const,
      position: trade.position + (trade.position ? ' (House)' : 'House')
    }));
    
    const markedFmpSenateData = fmpSenateData.map(trade => ({
      ...trade,
      source: 'fmp' as const,
      position: trade.position + (trade.position ? ' (Senate)' : 'Senate') 
    }));
    
    console.log(`Combining ${markedFinnhubData.length} Finnhub records with ${markedFmpHouseData.length} FMP House records and ${markedFmpSenateData.length} FMP Senate records`);
    
    // Combine all datasets
    return {
      symbol: symbol,
      data: [...markedFinnhubData, ...markedFmpHouseData, ...markedFmpSenateData]
    };
  }, [state.congressionalTrading, state.fmpHouseTrades, state.fmpSenateTrades, symbol]);

  // Loading state for congressional trades (all sources)
  const isCongressionalLoading = state.loading.congressional || state.loading.fmpHouseTrades || state.loading.fmpSenateTrades;
  
  // Error state for congressional trades (if all sources fail)
  const congressionalError = 
    state.error.congressional && state.error.fmpHouseTrades && state.error.fmpSenateTrades
      ? "Failed to load congressional trading data from all sources"
      : null;

  return {
    ...state,
    combinedCongressionalTrading: combinedCongressionalTrading(),
    isCongressionalLoading,
    congressionalError,
    refreshData
  };
};
