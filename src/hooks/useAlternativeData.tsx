
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
