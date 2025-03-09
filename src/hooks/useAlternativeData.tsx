
import { useState, useEffect, useCallback } from 'react';
import { invokeSupabaseFunction } from '@/services/api/base';
import { 
  AlternativeDataState, 
  CompanyNews, 
  SocialSentimentResponse 
} from '@/types/alternative/companyNewsTypes';
import { toast } from 'sonner';

type DataType = 'news' | 'sentiment' | 'all';

export const useAlternativeData = (symbol: string) => {
  const [state, setState] = useState<AlternativeDataState>({
    companyNews: [],
    socialSentiment: null,
    loading: {
      news: true,
      sentiment: true
    },
    error: {
      news: null,
      sentiment: null
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

  const fetchAllData = useCallback(async () => {
    await Promise.all([
      fetchCompanyNews(),
      fetchSocialSentiment()
    ]);
  }, [fetchCompanyNews, fetchSocialSentiment]);

  const refreshData = useCallback((dataType: DataType = 'all') => {
    if (dataType === 'all') {
      fetchAllData();
      return;
    }
    
    if (dataType === 'news') {
      fetchCompanyNews();
    } else if (dataType === 'sentiment') {
      fetchSocialSentiment();
    }
  }, [fetchAllData, fetchCompanyNews, fetchSocialSentiment]);

  useEffect(() => {
    if (!symbol) return;
    fetchAllData();
  }, [symbol, fetchAllData]);

  return {
    ...state,
    refreshData
  };
};
