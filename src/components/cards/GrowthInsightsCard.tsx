
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EarningsCall, SECFiling } from "@/types";
import { Lightbulb, TrendingUp, AlertTriangle, LineChart, Clock, Loader2 } from "lucide-react";
import { analyzeGrowthInsights } from "@/services/api/analysisService";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { GrowthInsight } from "@/types/aiAnalysisTypes";

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
  const { toast } = useToast();

  useEffect(() => {
    const fetchInsights = async () => {
      if (!symbol) {
        setError("No ticker symbol provided");
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Get the most recent transcript and filing
        const recentTranscripts = transcripts && transcripts.length > 0 
          ? transcripts.slice(0, 2) 
          : [];
          
        const recentFilings = filings && filings.length > 0
          ? filings
              .filter(filing => filing.form === "10-Q" || filing.form === "10-K")
              .slice(0, 2)
          : [];
        
        // Only proceed if we have data to analyze
        if (recentTranscripts.length === 0 && recentFilings.length === 0) {
          setError("No transcripts or SEC filings available for analysis");
          setIsLoading(false);
          return;
        }
        
        console.log(`Analyzing growth insights for ${symbol} with ${recentTranscripts.length} transcripts and ${recentFilings.length} filings`);
        
        const result = await analyzeGrowthInsights(
          symbol, 
          recentTranscripts, 
          recentFilings
        );
        
        if (result && Array.isArray(result)) {
          setInsights(result as GrowthInsight[]);
          console.log("Growth insights:", result);
        } else {
          console.warn("Invalid growth insights response:", result);
          setError("Failed to generate growth insights");
        }
      } catch (err) {
        console.error("Error analyzing growth insights:", err);
        setError("An error occurred while analyzing growth data");
        toast({
          title: "Analysis Failed",
          description: "Unable to generate growth insights. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchInsights();
    }
  }, [symbol, transcripts, filings, toast]);

  const renderIcon = (type: string) => {
    switch (type) {
      case "positive":
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case "negative":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "neutral":
      default:
        return <LineChart className="h-5 w-5 text-blue-500" />;
    }
  };

  const renderSourceBadge = (source: string, date: string) => {
    return (
      <div className="inline-flex items-center rounded-full bg-secondary px-2 py-1 text-xs">
        <Clock className="mr-1 h-3 w-3" />
        {source === "earnings" 
          ? "Earnings Call" 
          : source === "filing" 
            ? "SEC Filing" 
            : "Analysis"} 
        {date && ` (${date})`}
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
            <div className="flex items-center gap-2 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Analyzing growth data...</p>
            </div>
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
                      {renderSourceBadge(insight.source, insight.sourceDate || '')}
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
