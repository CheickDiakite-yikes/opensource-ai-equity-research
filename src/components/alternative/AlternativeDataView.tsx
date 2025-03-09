
import React from 'react';
import { useAlternativeData } from '@/hooks/useAlternativeData';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import CompanyNewsSection from './CompanyNewsSection';
import { Newspaper } from 'lucide-react';

interface AlternativeDataViewProps {
  symbol: string;
}

const AlternativeDataView: React.FC<AlternativeDataViewProps> = ({ symbol }) => {
  const { companyNews, loading, error } = useAlternativeData(symbol);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <Newspaper className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Alternative Data Analysis</h2>
      </motion.div>

      {/* News Section */}
      <Card className="p-6">
        <CompanyNewsSection 
          news={companyNews} 
          isLoading={loading.news} 
          error={error.news} 
        />
      </Card>
    </div>
  );
};

export default AlternativeDataView;
