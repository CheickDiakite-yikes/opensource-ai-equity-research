
import React from 'react';
import { useAlternativeData } from '@/hooks/useAlternativeData';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/card';
import CompanyNewsSection from './CompanyNewsSection';
import SocialSentimentSection from './SocialSentimentSection';
import { Newspaper, BarChart, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ErrorDisplay from '../reports/ErrorDisplay';
import { useMediaQuery } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface AlternativeDataViewProps {
  symbol: string;
}

const AlternativeDataView: React.FC<AlternativeDataViewProps> = ({ symbol }) => {
  const { 
    companyNews, 
    socialSentiment,
    loading, 
    error,
    refreshData 
  } = useAlternativeData(symbol);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Layers className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Alternative Data Analysis</h2>
      </motion.div>

      {/* Tabs for different alternative data types */}
      <Tabs defaultValue="news" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="news" className="flex items-center gap-2">
            <Newspaper className="h-4 w-4" />
            <span>Company News</span>
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            <span>Social Sentiment</span>
          </TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TabsContent value="news">
              <Card className="p-6">
                <CompanyNewsSection 
                  news={companyNews} 
                  isLoading={loading.news} 
                  error={error.news} 
                  onRetry={() => refreshData('news')}
                />
              </Card>
            </TabsContent>

            <TabsContent value="sentiment">
              <Card className="p-6">
                {error.sentiment ? (
                  <ErrorDisplay 
                    error={error.sentiment} 
                    title="Social Sentiment Data Unavailable"
                    onRetry={() => refreshData('sentiment')}
                  />
                ) : (
                  <SocialSentimentSection 
                    data={socialSentiment} 
                    isLoading={loading.sentiment} 
                    error={error.sentiment} 
                  />
                )}
              </Card>
            </TabsContent>
          </motion.div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};

export default AlternativeDataView;
