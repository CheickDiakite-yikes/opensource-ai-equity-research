
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EarningsCall } from "@/types";
import { MessageCircle, ExternalLink, Download } from "lucide-react";
import { downloadEarningsTranscript } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface EarningsCallSectionProps {
  earningsCalls: EarningsCall[];
  isLoading: boolean;
}

const EarningsCallSection = ({ earningsCalls, isLoading }: EarningsCallSectionProps) => {
  const [downloadingIds, setDownloadingIds] = useState<Set<number | undefined>>(new Set());
  
  const handleDownloadTranscript = async (call: EarningsCall) => {
    try {
      if (call.id) setDownloadingIds(prev => new Set(prev).add(call.id));
      
      const content = await downloadEarningsTranscript(call.symbol, call.quarter, call.year);
      
      if (!content) {
        toast({
          title: "Error",
          description: "Could not download transcript. Please try again later.",
          variant: "destructive",
        });
        return;
      }
      
      // Create a blob and download link
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${call.symbol}_${call.quarter}_${call.year}_earnings_call.txt`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Transcript downloaded successfully",
      });
    } catch (error) {
      console.error("Error downloading transcript:", error);
      toast({
        title: "Error",
        description: "Failed to download transcript. Please try again later.",
        variant: "destructive",
      });
    } finally {
      if (call.id) setDownloadingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(call.id);
        return newSet;
      });
    }
  };

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
            {earningsCalls.slice(0, 2).map((call, index) => (
              <div key={call.id || index} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between mb-2 gap-2">
                  <h4 className="font-medium flex items-center flex-wrap gap-2">
                    {call.quarter} {call.year} Earnings Call
                    <Badge variant="outline">{new Date(call.date).toLocaleDateString()}</Badge>
                  </h4>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 hover:text-primary-foreground hover:bg-primary" 
                      asChild
                    >
                      <a href={call.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>View</span>
                      </a>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="gap-1 hover:text-primary-foreground hover:bg-primary" 
                      onClick={() => handleDownloadTranscript(call)}
                      disabled={downloadingIds.has(call.id)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>{downloadingIds.has(call.id) ? 'Downloading...' : 'Download'}</span>
                    </Button>
                  </div>
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
