
import React from 'react';
import { SocialSentimentResponse } from '@/types/alternative';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, TrendingUp, TrendingDown, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';

interface SentimentSectionProps {
  sentiment: SocialSentimentResponse | null;
  loading: boolean;
  error: string | null;
}

const SentimentSection: React.FC<SentimentSectionProps> = ({ sentiment, loading, error }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-red-600 dark:text-red-400">Failed to load sentiment data</h3>
        <p className="text-sm text-red-500 mt-1">{error}</p>
      </div>
    );
  }

  if (!sentiment || !sentiment.data || sentiment.data.length === 0) {
    return (
      <div className="text-center p-6 bg-muted/50 rounded-lg">
        <p className="text-muted-foreground">No social sentiment data available for this company.</p>
      </div>
    );
  }

  // Prepare chart data
  const chartData = sentiment.data.map(item => ({
    time: item.atTime,
    timeFormatted: format(new Date(item.atTime), 'MMM dd, HH:mm'),
    score: Number(item.score?.toFixed(3)) || 0,
    mentions: item.mention,
    positiveMentions: item.positiveMention,
    negativeMentions: item.negativeMention,
  })).slice(0, 20).reverse(); // Get the most recent 20 data points

  // Calculate overall sentiment
  const overallSentiment = chartData.reduce((sum, item) => sum + item.score, 0) / chartData.length;
  const totalMentions = chartData.reduce((sum, item) => sum + item.mentions, 0);
  const positiveMentions = chartData.reduce((sum, item) => sum + item.positiveMentions, 0);
  const negativeMentions = chartData.reduce((sum, item) => sum + item.negativeMentions, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Sentiment</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              {overallSentiment > 0 ? (
                <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className={`text-2xl font-bold ${overallSentiment > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {overallSentiment.toFixed(3)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Score range: -1 to 1
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Mentions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">{totalMentions}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {positiveMentions} positive, {negativeMentions} negative
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Sentiment Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="h-4 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500"
                  style={{ width: `${totalMentions > 0 ? (positiveMentions / totalMentions * 100) : 0}%` }}
                ></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalMentions > 0 ? Math.round(positiveMentions / totalMentions * 100) : 0}% positive sentiment
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Sentiment Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="timeFormatted" 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[-1, 1]}
                  label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft' }}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[0, 'dataMax + 5']}
                  label={{ value: 'Mentions', angle: 90, position: 'insideRight' }}
                />
                <Tooltip 
                  formatter={(value, name) => {
                    if (name === 'Score') return [value, 'Sentiment Score'];
                    if (name === 'Mentions') return [value, 'Total Mentions'];
                    return [value, name];
                  }}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Legend />
                <ReferenceLine y={0} yAxisId="left" stroke="#888" />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="score" 
                  name="Score"
                  stroke="#8884d8" 
                  activeDot={{ r: 8 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="mentions" 
                  name="Mentions"
                  stroke="#82ca9d" 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SentimentSection;
