
import { StockProfile, StockQuote } from "@/types/profile/companyTypes";
import { EarningsCall, SECFiling } from "@/types/documentTypes";
import CompanyHeader from "./CompanyHeader";
import InfoCards from "./InfoCards";
import CompanyDescription from "./CompanyDescription";
import EarningsCallSection from "./EarningsCallSection";
import SECFilingsSection from "./SECFilingsSection";

interface StockOverviewContentProps {
  profile: StockProfile;
  quote: StockQuote;
  rating: string | null;
  earningsCalls: EarningsCall[];
  secFilings: SECFiling[];
  documentsLoading: boolean;
  symbol: string;
}

const StockOverviewContent = ({
  profile,
  quote,
  rating,
  earningsCalls,
  secFilings,
  documentsLoading,
  symbol
}: StockOverviewContentProps) => {
  // Process earnings calls to identify if they're recent
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
  
  // Consider a transcript recent if it's from the current or previous two quarters
  const isRecentTranscript = (call: EarningsCall) => {
    const callYear = parseInt(call.year);
    const callQuarter = parseInt(call.quarter.replace('Q', ''));
    
    if (callYear > currentYear) return true;
    if (callYear === currentYear && callQuarter >= currentQuarter - 2) return true;
    if (callYear === currentYear - 1 && callQuarter >= 4 - (2 - currentQuarter)) return true;
    
    return false;
  };
  
  // Filter to recent transcripts only
  const recentTranscripts = earningsCalls.filter(isRecentTranscript);
  
  return (
    <div className="space-y-6">
      <CompanyHeader profile={profile} quote={quote} />
      
      <InfoCards profile={profile} quote={quote} rating={rating} />
      
      <CompanyDescription description={profile.description} />
      
      <EarningsCallSection 
        earningsCalls={recentTranscripts} 
        allTranscripts={earningsCalls}
        isLoading={documentsLoading} 
        symbol={symbol}
      />
      
      <SECFilingsSection 
        secFilings={secFilings} 
        isLoading={documentsLoading} 
        symbol={symbol}
        companyName={profile.companyName}
      />
    </div>
  );
};

export default StockOverviewContent;
