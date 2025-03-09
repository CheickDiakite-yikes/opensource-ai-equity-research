
import { useState, useEffect, useCallback } from 'react';
import { invokeSupabaseFunction } from '@/services/api/base';
import { 
  AlternativeDataState, 
  CompanyNews, 
  SocialSentimentResponse 
} from '@/types/alternative/companyNewsTypes';
import { 
  AcquisitionOwnershipResponse,
  InsiderTradingStatsResponse 
} from '@/types/alternative/ownershipTypes';
import { toast } from 'sonner';

type DataType = 'news' | 'sentiment' | 'ownership' | 'insiderTrading' | 'all';

export const useAlternativeData = (symbol: string) => {
  const [state, setState] = useState<AlternativeDataState>({
    companyNews: [],
    socialSentiment: null,
    acquisitionOwnership: null,
    insiderTradingStats: null,
    loading: {
      news: true,
      sentiment: true,
      ownership: true,
      insiderTrading: true,
    },
    error: {
      news: null,
      sentiment: null,
      ownership: null,
      insiderTrading: null,
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

  const fetchAcquisitionOwnership = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, ownership: true },
        error: { ...prev.error, ownership: null }
      }));
      
      const ownershipData = await invokeSupabaseFunction<AcquisitionOwnershipResponse>(
        'get-fmp-acquisition-ownership', 
        { symbol, limit: 100 }
      );
      
      setState(prev => ({
        ...prev,
        acquisitionOwnership: ownershipData,
        loading: { ...prev.loading, ownership: false }
      }));
    } catch (error) {
      console.error('Error fetching acquisition ownership data:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, ownership: error.message },
        loading: { ...prev.loading, ownership: false }
      }));
      toast.error('Failed to load acquisition ownership data');
    }
  }, [symbol]);

  const fetchInsiderTradingStats = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        loading: { ...prev.loading, insiderTrading: true },
        error: { ...prev.error, insiderTrading: null }
      }));
      
      const tradingStatsData = await invokeSupabaseFunction<InsiderTradingStatsResponse>(
        'get-fmp-insider-trading-stats', 
        { symbol }
      );
      
      setState(prev => ({
        ...prev,
        insiderTradingStats: tradingStatsData,
        loading: { ...prev.loading, insiderTrading: false }
      }));
    } catch (error) {
      console.error('Error fetching insider trading statistics:', error);
      setState(prev => ({
        ...prev,
        error: { ...prev.error, insiderTrading: error.message },
        loading: { ...prev.loading, insiderTrading: false }
      }));
      toast.error('Failed to load insider trading statistics');
    }
  }, [symbol]);

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchCompanyNews(),
      fetchSocialSentiment(),
      fetchAcquisitionOwnership(),
      fetchInsiderTradingStats()
    ]);
  }, [fetchCompanyNews, fetchSocialSentiment, fetchAcquisitionOwnership, fetchInsiderTradingStats]);

  const refreshData = useCallback((dataType: DataType = 'all') => {
    if (dataType === 'all') {
      fetchAllData();
      return;
    }
    
    if (dataType === 'news') {
      fetchCompanyNews();
    } else if (dataType === 'sentiment') {
      fetchSocialSentiment();
    } else if (dataType === 'ownership') {
      fetchAcquisitionOwnership();
    } else if (dataType === 'insiderTrading') {
      fetchInsiderTradingStats();
    }
  }, [fetchAllData, fetchCompanyNews, fetchSocialSentiment, fetchAcquisitionOwnership, fetchInsiderTradingStats]);

  useEffect(() => {
    if (!symbol) return;
    fetchAllData();
  }, [symbol, fetchAllData]);

  return {
    ...state,
    refreshData
  };
};
