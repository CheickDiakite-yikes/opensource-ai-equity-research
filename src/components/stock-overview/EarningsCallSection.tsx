
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EarningsCall } from "@/types/documentTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, FileText, Calendar, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadEarningsTranscript } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface EarningsCallSectionProps {
  earningsCalls: EarningsCall[];
  allTranscripts?: EarningsCall[];
  isLoading: boolean;
  symbol: string;
}

const EarningsCallSection = ({
  earningsCalls,
  allTranscripts = [],
  isLoading,
  symbol
}: EarningsCallSectionProps) => {
  const handleDownload = async (call: EarningsCall) => {
    try {
      toast({
        title: "Downloading transcript...",
        description: `Preparing ${call.quarter} ${call.year} earnings call transcript for download.`,
      });
      
      await downloadEarningsTranscript({
        symbol,
        quarter: call.quarter,
        year: call.year,
        filename: `${symbol}_${call.quarter}_${call.year}_transcript.txt`
      });
      
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "Could not download the transcript. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const renderTranscriptContent = (call: EarningsCall) => (
    <div key={`${call.quarter}-${call.year}`} className="mb-4 pb-4 border-b last:border-b-0">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <h4 className="font-medium">
            {call.quarter} {call.year} Earnings Call
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {new Date(call.date).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      {call.highlights && call.highlights.length > 0 ? (
        <div className="space-y-2 mt-2 mb-3">
          <h5 className="text-sm font-medium text-muted-foreground">Key Highlights:</h5>
          <ul className="space-y-1 text-sm pl-5 list-disc">
            {call.highlights.slice(0, 4).map((highlight, idx) => (
              <li key={idx}>{highlight}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground my-2">
          Highlights not available for this transcript.
        </p>
      )}
      
      <div className="flex gap-2 mt-3">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          onClick={() => handleDownload(call)}
        >
          <Download className="h-3 w-3 mr-1" /> Download
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs"
          asChild
        >
          <a href={call.url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-1" /> View
          </a>
        </Button>
      </div>
    </div>
  );

  const renderEmptyState = () => (
    <div className="text-center py-6">
      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-30" />
      <h3 className="text-lg font-medium mb-1">No Recent Earnings Calls</h3>
      
      {allTranscripts && allTranscripts.length > 0 ? (
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          No earnings call transcripts available from the past two quarters. The company has {allTranscripts.length} older transcripts from previous periods.
        </p>
      ) : (
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">
          No recent earnings call transcripts are available for this company. Check back later for updates.
        </p>
      )}
      
      {allTranscripts && allTranscripts.length > 0 && (
        <Button variant="outline" size="sm" onClick={() => {
          toast({
            title: "Older Transcripts",
            description: `${symbol} has ${allTranscripts.length} older earnings call transcripts from: ${allTranscripts.slice(0, 3).map(call => `${call.quarter} ${call.year}`).join(', ')}${allTranscripts.length > 3 ? '...' : ''}`,
          });
        }}>
          View Older Transcripts Info
        </Button>
      )}
    </div>
  );

  const renderLoadingState = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-5 w-24" />
      </div>
      <Skeleton className="h-20 w-full" />
      <div className="flex gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Earnings Call Transcripts
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          renderLoadingState()
        ) : earningsCalls && earningsCalls.length > 0 ? (
          <ScrollArea className="h-[400px] pr-4">
            {earningsCalls.map(renderTranscriptContent)}
          </ScrollArea>
        ) : (
          renderEmptyState()
        )}
      </CardContent>
    </Card>
  );
};

export default EarningsCallSection;
