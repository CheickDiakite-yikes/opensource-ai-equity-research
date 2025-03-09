
import React from 'react';
import { useAlternativeData } from '@/hooks/useAlternativeData';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import CompanyNewsSection from './CompanyNewsSection';
import SocialSentimentSection from './SocialSentimentSection';
import CongressionalTradesSection from './CongressionalTradesSection';
import { Newspaper, BarChart, FileText, Layers } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AlternativeDataViewProps {
  symbol: string;
}

const AlternativeDataView: React.FC<AlternativeDataViewProps> = ({ symbol }) => {
  const { companyNews, socialSentiment, congressionalTrading, loading, error } = useAlternativeData(symbol);

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
          <TabsTrigger value="congressional" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Congressional Trading</span>
          </TabsTrigger>
        </TabsList>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <TabsContent value="news">
            <Card className="p-6">
              <CompanyNewsSection 
                news={companyNews} 
                isLoading={loading.news} 
                error={error.news} 
              />
            </Card>
          </TabsContent>

          <TabsContent value="sentiment">
            <Card className="p-6">
              <SocialSentimentSection 
                data={socialSentiment} 
                isLoading={loading.sentiment} 
                error={error.sentiment} 
              />
            </Card>
          </TabsContent>

          <TabsContent value="congressional">
            <Card className="p-6">
              <CongressionalTradesSection 
                data={congressionalTrading} 
                isLoading={loading.congressional} 
                error={error.congressional} 
              />
            </Card>
          </TabsContent>
        </motion.div>
      </Tabs>
    </div>
  );
};

export default AlternativeDataView;
