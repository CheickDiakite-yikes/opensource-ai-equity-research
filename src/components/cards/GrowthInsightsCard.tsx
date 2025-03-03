
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EarningsCall, SECFiling } from "@/types";
import { Lightbulb, TrendingUp, AlertTriangle, LineChart, Clock } from "lucide-react";
import { analyzeGrowthInsights } from "@/services/api/analysisService";
import { Skeleton } from "@/components/ui/skeleton";

interface GrowthInsight {
  type: "positive" | "negative" | "neutral";
  source: "earnings" | "filing";
  sourceDate: string;
  content: string;
}

interface GrowthInsightsCardProps {
  symbol: string;
  transcripts: EarningsCall[];
  filings: SECFiling[];
}

const GrowthInsightsCard: React.FC<GrowthInsightsCardProps> = ({ 
  symbol, 
  transcripts, 
  filings 
}) => {
  const [insights, setInsights] = useState<GrowthInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInsights = async () => {
      if (!transcripts.length && !filings.length) {
        setError("No transcripts or filings available for analysis");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get the most recent transcript and filing
        const recentTranscripts = transcripts.slice(0, 2);
        const recentFilings = filings
          .filter(filing => filing.form === "10-Q" || filing.form === "10-K")
          .slice(0, 2);
        
        const result = await analyzeGrowthInsights(
          symbol, 
          recentTranscripts, 
          recentFilings
        );
        
        if (result) {
          setInsights(result);
        } else {
          setError("Failed to generate growth insights");
        }
      } catch (err) {
        console.error("Error analyzing growth insights:", err);
        setError("An error occurred while analyzing growth data");
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol && (transcripts.length > 0 || filings.length > 0)) {
      fetchInsights();
    }
  }, [symbol, transcripts, filings]);

  const renderIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "negative":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "neutral":
        return <LineChart className="h-5 w-5 text-blue-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-500" />;
    }
  };

  const renderSourceBadge = (source: string, date: string) => {
    return (
      <div className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
        <Clock className="mr-1 h-3 w-3" />
        {source === "earnings" ? "Earnings Call" : "SEC Filing"} ({date})
      </div>
    );
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          AI Growth Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : insights.length === 0 ? (
          <p className="text-center text-muted-foreground py-6">
            No insights available at this time
          </p>
        ) : (
          <div className="space-y-4">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border ${
                  insight.type === "positive" 
                    ? "bg-green-50 border-green-200" 
                    : insight.type === "negative"
                      ? "bg-red-50 border-red-200"
                      : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex-shrink-0">
                    {renderIcon(insight.type)}
                  </div>
                  <div className="space-y-1">
                    <div>
                      {renderSourceBadge(insight.source, insight.sourceDate)}
                    </div>
                    <p className="text-sm">
                      {insight.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrowthInsightsCard;
