
import React from 'react';
import { SocialSentimentResponse } from '@/types/alternative/companyNewsTypes';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format } from 'date-fns';
import { Info } from 'lucide-react';

interface SocialSentimentProps {
  data: SocialSentimentResponse | null;
  isLoading: boolean;
  error: string | null;
}

const SocialSentimentSection: React.FC<SocialSentimentProps> = ({ data, isLoading, error }) => {
  if (isLoading) {
    return <SentimentLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">Failed to load social sentiment data</p>
      </div>
    );
  }

  if (!data || !data.data || (!data.data.reddit.length && !data.data.twitter.length)) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No social sentiment data available for this stock</p>
      </div>
    );
  }

  // Combine reddit and twitter data for chart
  const allSentimentData = [...data.data.reddit, ...data.data.twitter];
  
  // Prepare chart data
  const chartData = allSentimentData.map(item => ({
    time: format(new Date(item.atTime), 'MMM d, HH:mm'),
    positiveScore: parseFloat((item.positiveScore * 100).toFixed(2)),
    negativeScore: parseFloat((Math.abs(item.negativeScore) * 100).toFixed(2)),
    positiveMentions: item.positiveMention,
    negativeMentions: item.negativeMention,
    totalMentions: item.mention,
    sentiment: parseFloat((item.score * 100).toFixed(2))
  })).slice(0, 10);  // Only show the 10 most recent data points
  
  // Calculate metrics from both reddit and twitter data
  const totalMentions = allSentimentData.reduce((sum, item) => sum + item.mention, 0);
  const positiveMentions = allSentimentData.reduce((sum, item) => sum + item.positiveMention, 0);
  const negativeMentions = allSentimentData.reduce((sum, item) => sum + item.negativeMention, 0);
  
  // Get most recent sentiment score (from either source)
  const mostRecentSentiment = allSentimentData.length > 0 
    ? (allSentimentData[0]?.score * 100).toFixed(2) 
    : "0.00";
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Social Media Sentiment</h3>
        <div className="flex items-center text-sm text-muted-foreground">
          <Info className="h-4 w-4 mr-1" />
          <span>Data from Reddit and Twitter</span>
        </div>
      </div>
      
      {/* Sentiment Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <SentimentCard 
          title="Most Recent Sentiment"
          value={`${mostRecentSentiment}%`}
          trend={parseFloat(mostRecentSentiment) > 0 ? 'positive' : 'negative'}
        />
        <SentimentCard 
          title="Total Mentions"
          value={totalMentions.toString()}
          trend="neutral"
        />
        <SentimentCard 
          title="Positive vs Negative"
          value={`${positiveMentions} : ${negativeMentions}`}
          trend={positiveMentions > negativeMentions ? 'positive' : 'negative'}
        />
      </div>
      
      {/* Sentiment Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="h-80 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="time" 
              angle={-45} 
              textAnchor="end" 
              height={60} 
              tick={{ fontSize: 12 }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => {
                const formattedName = name === 'positiveScore' ? 'Positive Score (%)' : 
                  name === 'negativeScore' ? 'Negative Score (%)' : 
                  name === 'sentiment' ? 'Overall Sentiment (%)' : name;
                return [`${value}`, formattedName];
              }}
            />
            <Legend />
            <Bar dataKey="positiveScore" name="Positive Score (%)" fill="#4ade80" />
            <Bar dataKey="negativeScore" name="Negative Score (%)" fill="#f87171" />
            <Bar dataKey="sentiment" name="Overall Sentiment (%)" fill="#60a5fa" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
};

const SentimentCard: React.FC<{ title: string; value: string; trend: 'positive' | 'negative' | 'neutral' }> = ({ title, value, trend }) => {
  const getBgColor = () => {
    switch (trend) {
      case 'positive': return 'bg-green-50 dark:bg-green-950';
      case 'negative': return 'bg-red-50 dark:bg-red-950';
      default: return 'bg-gray-50 dark:bg-gray-900';
    }
  };
  
  const getTextColor = () => {
    switch (trend) {
      case 'positive': return 'text-green-600 dark:text-green-400';
      case 'negative': return 'text-red-600 dark:text-red-400';
      default: return 'text-gray-700 dark:text-gray-300';
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`p-4 ${getBgColor()}`}>
        <p className="text-sm font-medium">{title}</p>
        <p className={`text-2xl font-bold mt-2 ${getTextColor()}`}>{value}</p>
      </Card>
    </motion.div>
  );
};

const SentimentLoadingSkeleton = () => (
  <div className="space-y-6">
    <Skeleton className="h-8 w-64" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </Card>
      ))}
    </div>
    <Skeleton className="h-80 w-full" />
  </div>
);

export default SocialSentimentSection;
