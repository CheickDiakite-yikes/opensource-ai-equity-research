
import { StockProfile, StockQuote, EarningsCall, SECFiling } from "@/types";
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
  return (
    <div className="space-y-6">
      <CompanyHeader profile={profile} quote={quote} />
      
      <InfoCards profile={profile} quote={quote} rating={rating} />
      
      <CompanyDescription description={profile.description} />
      
      <EarningsCallSection 
        earningsCalls={earningsCalls} 
        isLoading={documentsLoading} 
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
