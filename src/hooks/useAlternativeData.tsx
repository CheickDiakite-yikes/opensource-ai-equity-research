
import { useState, useEffect, useCallback } from 'react';
import { 
  fetchCompanyNews, 
  fetchSocialSentiment, 
  fetchCongressionalTrading 
} from '@/services/api';
import { 
  CompanyNews, 
  SocialSentimentResponse, 
  CongressionalTradesResponse 
} from '@/types/alternative';
import { toast } from "sonner";

interface AlternativeDataState {
  companyNews: CompanyNews[];
  socialSentiment: SocialSentimentResponse | null;
  congressionalTrading: CongressionalTradesResponse | null;
  loading: {
    news: boolean;
    sentiment: boolean;
    congressional: boolean;
  };
  error: {
    news: string | null;
    sentiment: string | null;
    congressional: string | null;
  };
}

export const useAlternativeData = (symbol: string) => {
  const [data, setData] = useState<AlternativeDataState>({
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

  // Calculate default date ranges
  const getDateRange = () => {
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    
    const threeMonthsAgo = new Date(today);
    threeMonthsAgo.setMonth(today.getMonth() - 3);
    
    return {
      today: today.toISOString().split('T')[0],
      oneMonthAgo: oneMonthAgo.toISOString().split('T')[0],
      threeMonthsAgo: threeMonthsAgo.toISOString().split('T')[0]
    };
  };

  const fetchNewsData = useCallback(async () => {
    if (!symbol) return;
    
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, news: true },
      error: { ...prev.error, news: null }
    }));
    
    try {
      const { oneMonthAgo, today } = getDateRange();
      const newsData = await fetchCompanyNews(symbol, oneMonthAgo, today);
      
      setData(prev => ({
        ...prev,
        companyNews: newsData,
        loading: { ...prev.loading, news: false }
      }));
    } catch (error) {
      console.error("Error fetching company news:", error);
      setData(prev => ({
        ...prev,
        error: { ...prev.error, news: error.message || "Failed to load company news" },
        loading: { ...prev.loading, news: false }
      }));
      
      toast.error("Could not load company news", {
        description: error.message || "An error occurred while fetching company news"
      });
    }
  }, [symbol]);

  const fetchSentimentData = useCallback(async () => {
    if (!symbol) return;
    
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, sentiment: true },
      error: { ...prev.error, sentiment: null }
    }));
    
    try {
      const sentimentData = await fetchSocialSentiment(symbol);
      
      setData(prev => ({
        ...prev,
        socialSentiment: sentimentData,
        loading: { ...prev.loading, sentiment: false }
      }));
    } catch (error) {
      console.error("Error fetching social sentiment:", error);
      setData(prev => ({
        ...prev,
        error: { ...prev.error, sentiment: error.message || "Failed to load social sentiment data" },
        loading: { ...prev.loading, sentiment: false }
      }));
      
      toast.error("Could not load social sentiment data", {
        description: error.message || "An error occurred while fetching social sentiment data"
      });
    }
  }, [symbol]);

  const fetchCongressionalData = useCallback(async () => {
    if (!symbol) return;
    
    setData(prev => ({
      ...prev,
      loading: { ...prev.loading, congressional: true },
      error: { ...prev.error, congressional: null }
    }));
    
    try {
      const { threeMonthsAgo, today } = getDateRange();
      const congressionalData = await fetchCongressionalTrading(symbol, threeMonthsAgo, today);
      
      setData(prev => ({
        ...prev,
        congressionalTrading: congressionalData,
        loading: { ...prev.loading, congressional: false }
      }));
    } catch (error) {
      console.error("Error fetching congressional trading data:", error);
      setData(prev => ({
        ...prev,
        error: { ...prev.error, congressional: error.message || "Failed to load congressional trading data" },
        loading: { ...prev.loading, congressional: false }
      }));
      
      toast.error("Could not load congressional trading data", {
        description: error.message || "An error occurred while fetching congressional trading data"
      });
    }
  }, [symbol]);

  // Load all data
  const loadAllData = useCallback(() => {
    fetchNewsData();
    fetchSentimentData();
    fetchCongressionalData();
  }, [fetchNewsData, fetchSentimentData, fetchCongressionalData]);

  useEffect(() => {
    if (symbol) {
      loadAllData();
    }
  }, [symbol, loadAllData]);

  return {
    ...data,
    isLoading: data.loading.news || data.loading.sentiment || data.loading.congressional,
    refetch: loadAllData
  };
};
