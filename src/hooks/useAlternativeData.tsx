
import { useState, useEffect } from 'react';
import { invokeSupabaseFunction } from '@/services/api/base';
import { AlternativeDataState, CompanyNews, SocialSentimentResponse, CongressionalTradesResponse } from '@/types/alternative/companyNewsTypes';
import { toast } from 'sonner';

export const useAlternativeData = (symbol: string) => {
  const [state, setState] = useState<AlternativeDataState>({
    companyNews: [],
    socialSentiment: null,
    congressionalTrading: null,
    loading: {
      news: true,
      sentiment: true,
      congressional: true
    },
    error: {
      news: null,
      sentiment: null,
      congressional: null
    }
  });

  useEffect(() => {
    if (!symbol) return;

    const fetchData = async () => {
      try {
        // Fetch company news
        const newsData = await invokeSupabaseFunction<CompanyNews[]>('get-finnhub-company-news', { symbol });
        
        setState(prev => ({
          ...prev,
          companyNews: newsData || [],
          loading: { ...prev.loading, news: false },
          error: { ...prev.error, news: null }
        }));

        // Fetch social sentiment data
        try {
          const sentimentData = await invokeSupabaseFunction<SocialSentimentResponse>('get-finnhub-social-sentiment', { symbol });
          
          setState(prev => ({
            ...prev,
            socialSentiment: sentimentData,
            loading: { ...prev.loading, sentiment: false },
            error: { ...prev.error, sentiment: null }
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

        // Fetch congressional trading data
        try {
          const congressionalData = await invokeSupabaseFunction<CongressionalTradesResponse>('get-finnhub-congressional-trading', { symbol });
          
          setState(prev => ({
            ...prev,
            congressionalTrading: congressionalData,
            loading: { ...prev.loading, congressional: false },
            error: { ...prev.error, congressional: null }
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

      } catch (error) {
        console.error('Error fetching alternative data:', error);
        setState(prev => ({
          ...prev,
          error: { ...prev.error, news: error.message },
          loading: { ...prev.loading, news: false }
        }));
        toast.error('Failed to load news data');
      }
    };

    fetchData();
  }, [symbol]);

  return state;
};
