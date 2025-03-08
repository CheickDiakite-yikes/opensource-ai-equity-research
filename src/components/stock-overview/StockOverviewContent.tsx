
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
  // Determine if we should show the earnings calls section
  // Only show it if we have at least one valid earnings call with content or highlights
  const hasValidEarningsCalls = earningsCalls.length > 0 && 
    earningsCalls.some(call => 
      (call.content && call.content.length > 50) || 
      (call.highlights && call.highlights.length > 0)
    );

  return (
    <div className="space-y-6">
      <CompanyHeader profile={profile} quote={quote} />
      
      <InfoCards profile={profile} quote={quote} rating={rating} />
      
      <CompanyDescription description={profile.description} />
      
      {/* Only render the EarningsCallSection if we have valid data */}
      {hasValidEarningsCalls && (
        <EarningsCallSection 
          earningsCalls={earningsCalls} 
          isLoading={documentsLoading} 
        />
      )}
      
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
