
import React from 'react';
import { CompanyNews } from '@/types/alternative/companyNewsTypes';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface CompanyNewsSectionProps {
  news: CompanyNews[];
  isLoading: boolean;
  error: string | null;
}

const CompanyNewsSection: React.FC<CompanyNewsSectionProps> = ({ news, isLoading, error }) => {
  if (isLoading) {
    return <NewsLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">Failed to load news data</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">Latest Company News</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {news.slice(0, 9).map((article, index) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <NewsCard article={article} />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const NewsCard: React.FC<{ article: CompanyNews }> = ({ article }) => {
  return (
    <Card className="hover:scale-105 transition-transform duration-200">
      <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
        <div className="aspect-video relative overflow-hidden rounded-t-lg">
          <img 
            src={article.image || '/placeholder.svg'} 
            alt={article.headline}
            className="object-cover w-full h-full"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder.svg';
            }}
          />
        </div>
        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-2">
            {format(new Date(article.datetime * 1000), 'MMM d, yyyy')}
          </p>
          <h4 className="font-medium line-clamp-2 mb-2">{article.headline}</h4>
          <p className="text-sm text-muted-foreground line-clamp-2">{article.summary}</p>
        </div>
      </a>
    </Card>
  );
};

const NewsLoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="h-48 w-full" />
        <div className="p-4 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    ))}
  </div>
);

export default CompanyNewsSection;
