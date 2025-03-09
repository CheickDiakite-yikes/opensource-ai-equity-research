
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, TrendingUp, Activity } from 'lucide-react';
import NewsSection from './NewsSection';
import SentimentSection from './SentimentSection';
import CongressionalTradingSection from './CongressionalTradingSection';
import { 
  CompanyNews, 
  SocialSentimentResponse, 
  CongressionalTradesResponse 
} from '@/types/alternative';

interface AlternativeDataTabsProps {
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

const AlternativeDataTabs: React.FC<AlternativeDataTabsProps> = ({
  companyNews,
  socialSentiment,
  congressionalTrading,
  loading,
  error
}) => {
  const [activeTab, setActiveTab] = useState<string>("news");

  return (
    <Tabs defaultValue="news" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger 
          value="news" 
          className="flex items-center gap-2 py-3"
        >
          <FileText className="h-4 w-4" />
          <span>Company News</span>
        </TabsTrigger>
        <TabsTrigger 
          value="sentiment"
          className="flex items-center gap-2 py-3"
        >
          <Activity className="h-4 w-4" />
          <span>Social Sentiment</span>
        </TabsTrigger>
        <TabsTrigger 
          value="congressional"
          className="flex items-center gap-2 py-3"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Congressional Trading</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="news" className="space-y-6">
        <NewsSection 
          news={companyNews} 
          loading={loading.news} 
          error={error.news} 
        />
      </TabsContent>
      
      <TabsContent value="sentiment" className="space-y-6">
        <SentimentSection 
          sentiment={socialSentiment} 
          loading={loading.sentiment} 
          error={error.sentiment} 
        />
      </TabsContent>
      
      <TabsContent value="congressional" className="space-y-6">
        <CongressionalTradingSection 
          trading={congressionalTrading} 
          loading={loading.congressional} 
          error={error.congressional} 
        />
      </TabsContent>
    </Tabs>
  );
};

export default AlternativeDataTabs;
