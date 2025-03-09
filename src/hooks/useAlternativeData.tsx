
import { useState, useEffect, useCallback } from 'react';
import { invokeSupabaseFunction } from '@/services/api/base';
import { AlternativeDataState, CompanyNews, SocialSentimentResponse, CongressionalTradesResponse } from '@/types/alternative/companyNewsTypes';
import { toast } from 'sonner';

type DataType = 'news' | 'sentiment' | 'congressional' | 'fmpHouseTrades' | 'all';

export const useAlternativeData = (symbol: string) => {
  const [state, setState] = useState<AlternativeDataState>({
    companyNews: [],
    socialSentiment: null,
    congressionalTrading: null,
    fmpHouseTrades: null,
    loading: {
      news: true,
      sentiment: true,
      congressional: true,
      fmpHouseTrades: true
    },
    error: {
      news: null,
      sentiment: null,
      congressional: null,
      fmpHouseTrades: null
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
      
      // Get current date and one year ago for better results
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);
      
      const from = Math.floor(oneYearAgo.getTime() / 1000);
      const to = Math.floor(now.getTime() / 1000);
      
      const congressionalData = await invokeSupabaseFunction<CongressionalTradesResponse>(
        'get-finnhub-congressional-trading', 
        { symbol, from, to }
      );
      
      setState(prev => ({
        ...prev,
        congressionalTrading: congressionalData,
        loading: { ...prev.loading, congressional: false }
      }));
    } catch (error) {
      console.error('Error fetching congressional trading data:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, congressional: error.message },
        loading: { ...prev.loading, congressional: false }
      }));
      toast.error('Failed to load congressional trading data');
    }
  }, [symbol]);

  const fetchFmpHouseTrades = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, fmpHouseTrades: true },
        error: { ...prev.error, fmpHouseTrades: null }
      }));
      
      const houseTradesData = await invokeSupabaseFunction<CongressionalTradesResponse>(
        'get-fmp-house-trades', 
        { symbol }
      );
      
      setState(prev => ({
        ...prev,
        fmpHouseTrades: houseTradesData,
        loading: { ...prev.loading, fmpHouseTrades: false }
      }));
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

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchCompanyNews(),
      fetchSocialSentiment(),
      fetchCongressionalTrading(),
      fetchFmpHouseTrades()
    ]);
  }, [fetchCompanyNews, fetchSocialSentiment, fetchCongressionalTrading, fetchFmpHouseTrades]);

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
    }
  }, [fetchAllData, fetchCompanyNews, fetchSocialSentiment, fetchCongressionalTrading, fetchFmpHouseTrades]);

  useEffect(() => {
    if (!symbol) return;
    fetchAllData();
  }, [symbol, fetchAllData]);

  // Combine congressional trading data from both sources
  const combinedCongressionalTrading = useCallback(() => {
    if (!state.congressionalTrading && !state.fmpHouseTrades) {
      return null;
    }

    const finnhubData = state.congressionalTrading?.data || [];
    const fmpData = state.fmpHouseTrades?.data || [];
    
    // Mark the source of each trade
    const markedFinnhubData = finnhubData.map(trade => ({
      ...trade,
      source: 'finnhub' as const
    }));
    
    const markedFmpData = fmpData.map(trade => ({
      ...trade,
      source: 'fmp' as const
    }));
    
    // Combine both datasets
    return {
      symbol: symbol,
      data: [...markedFinnhubData, ...markedFmpData],
      sources: ['finnhub', 'fmp']
    };
  }, [state.congressionalTrading, state.fmpHouseTrades, symbol]);

  // Loading state for congressional trades (both sources)
  const isCongressionalLoading = state.loading.congressional || state.loading.fmpHouseTrades;
  
  // Error state for congressional trades (if both sources fail)
  const congressionalError = 
    state.error.congressional && state.error.fmpHouseTrades
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
