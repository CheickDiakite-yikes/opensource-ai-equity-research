
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EarningsCall } from "@/types";
import { MessageCircle, ExternalLink } from "lucide-react";

interface EarningsCallSectionProps {
  earningsCalls: EarningsCall[];
  isLoading: boolean;
}

const EarningsCallSection = ({ earningsCalls, isLoading }: EarningsCallSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MessageCircle className="h-5 w-5 mr-2 text-primary" />
          Earnings Call Transcripts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : earningsCalls.length > 0 ? (
          <div className="space-y-6">
            {earningsCalls.map((call, index) => (
              <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium flex items-center">
                    {call.quarter} {call.year} Earnings Call
                    <Badge variant="outline" className="ml-2">{new Date(call.date).toLocaleDateString()}</Badge>
                  </h4>
                  <Button variant="outline" size="sm" className="gap-1" asChild>
                    <a href={call.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>Full Transcript</span>
                    </a>
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <h5 className="font-medium text-foreground mb-1">Key Highlights: <span className="text-xs text-muted-foreground">(AI Generated)</span></h5>
                  <ul className="list-disc list-inside space-y-1">
                    {call.highlights && call.highlights.length > 0 ? (
                      call.highlights.map((highlight, i) => (
                        <li key={i}>{highlight}</li>
                      ))
                    ) : (
                      <li>No highlights available</li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            No earnings call transcripts available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EarningsCallSection;
