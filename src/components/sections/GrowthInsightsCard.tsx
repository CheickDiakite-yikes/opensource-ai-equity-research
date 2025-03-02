
import React from "react";
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { Sparkles, FileText, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

interface InsightItem {
  type: "positive" | "risk" | "neutral";
  content: string;
}

interface GrowthInsightsCardProps {
  insights: InsightItem[];
  isLoading: boolean;
  error: string | null;
  transcriptDate?: string;
  filingDate?: string;
}

const GrowthInsightsCard: React.FC<GrowthInsightsCardProps> = ({
  insights,
  isLoading,
  error,
  transcriptDate,
  filingDate
}) => {
  const getIconForType = (type: string) => {
    switch (type) {
      case "positive":
        return <span className="h-2 w-2 rounded-full bg-green-500 mr-1.5 inline-block" />;
      case "risk":
        return <span className="h-2 w-2 rounded-full bg-red-500 mr-1.5 inline-block" />;
      default:
        return <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5 inline-block" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card className="overflow-hidden border-border/50 shadow-md">
        <CardHeader className="bg-gradient-to-r from-didi.darkBlue/5 to-didi.lightBlue/5 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-didi.darkBlue" />
              <CardTitle className="text-lg">Growth Insights from Recent Reports</CardTitle>
            </div>
            {(transcriptDate || filingDate) && (
              <div className="flex items-center text-xs text-muted-foreground">
                <FileText className="h-3.5 w-3.5 mr-1" />
                {transcriptDate && <span>Earnings: {transcriptDate}</span>}
                {transcriptDate && filingDate && <span className="mx-1">|</span>}
                {filingDate && <span>10Q: {filingDate}</span>}
              </div>
            )}
          </div>
          <CardDescription>
            AI-powered analysis of recent earnings calls and SEC filings
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-4">
          {isLoading ? (
            <div className="flex flex-col gap-3 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-5 bg-muted rounded-md w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="flex items-center text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          ) : insights.length === 0 ? (
            <div className="text-center text-muted-foreground py-6">
              No growth insights available for this company
            </div>
          ) : (
            <ul className="space-y-3">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex text-sm">
                  {getIconForType(insight.type)}
                  <span>{insight.content}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GrowthInsightsCard;
