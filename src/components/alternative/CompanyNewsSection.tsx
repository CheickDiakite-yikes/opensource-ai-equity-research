
import React, { useState } from 'react';
import { CompanyNews } from '@/types/alternative/companyNewsTypes';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ExternalLink, Calendar, Search, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import ErrorDisplay from '../reports/ErrorDisplay';

interface CompanyNewsSectionProps {
  news: CompanyNews[];
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const CompanyNewsSection: React.FC<CompanyNewsSectionProps> = ({ news, isLoading, error, onRetry }) => {
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return <NewsLoadingSkeleton />;
  }

  if (error) {
    return <ErrorDisplay error={error} onRetry={onRetry} />;
  }

  if (!news || news.length === 0) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No company news available</p>
        {onRetry && (
          <Button onClick={onRetry} className="mt-4" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Filter news based on search term
  const filteredNews = searchTerm 
    ? news.filter(item => 
        item.headline.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.source.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : news;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Company News</h3>
      
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search news..."
          className="pl-8"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* News list */}
      <div className="space-y-6">
        {filteredNews.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">No news matching your search</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredNews.map((item, index) => (
              <NewsCard 
                key={item.id} 
                news={item} 
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const NewsCard: React.FC<{ news: CompanyNews; index: number }> = ({ news, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
        <div className="flex flex-col h-full">
          {/* Image */}
          {news.image && (
            <div className="h-40 overflow-hidden">
              <img 
                src={news.image} 
                alt={news.headline} 
                className="w-full h-full object-cover transition-transform hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Content */}
          <div className="p-4 flex flex-col flex-grow">
            <h4 className="font-semibold mb-2 line-clamp-2">{news.headline}</h4>
            
            <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{news.summary}</p>
            
            <div className="mt-auto flex justify-between items-center text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(news.datetime * 1000), 'MMM d, yyyy')}</span>
              </div>
              <span className="text-xs font-medium">{news.source}</span>
            </div>
            
            <a 
              href={news.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-4 text-sm text-primary flex items-center gap-1 hover:underline"
            >
              Read more <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const NewsLoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-10 w-full mb-6" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="w-full h-40" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

export default CompanyNewsSection;
