
import { StockProfile, StockQuote } from "@/types/profile/companyTypes";
import { EarningsCall, SECFiling } from "@/types/documentTypes";
import { OwnershipData } from "@/types/profile/ownershipTypes";
import CompanyHeader from "./CompanyHeader";
import InfoCards from "./InfoCards";
import CompanyDescription from "./CompanyDescription";
import OwnershipSection from "./OwnershipSection";
import EarningsCallSection from "./EarningsCallSection";
import SECFilingsSection from "./SECFilingsSection";

interface StockOverviewContentProps {
  profile: StockProfile;
  quote: StockQuote;
  rating: string | null;
  earningsCalls: EarningsCall[];
  secFilings: SECFiling[];
  ownershipData: OwnershipData | null;
  documentsLoading: boolean;
  ownershipLoading: boolean;
  symbol: string;
}

const StockOverviewContent = ({
  profile,
  quote,
  rating,
  earningsCalls,
  secFilings,
  ownershipData,
  documentsLoading,
  ownershipLoading,
  symbol
}: StockOverviewContentProps) => {
  return (
    <div className="space-y-6">
      <CompanyHeader profile={profile} quote={quote} />
      
      <InfoCards profile={profile} quote={quote} rating={rating} />
      
      <CompanyDescription description={profile.description} />
      
      <OwnershipSection 
        ownershipData={ownershipData} 
        isLoading={ownershipLoading} 
        symbol={symbol}
      />
      
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
