
import { StockProfile, StockQuote } from "@/types/profile/companyTypes";
import { SECFiling } from "@/types/documentTypes";
import { RatingSnapshot, GradeNews } from "@/types/ratings/ratingTypes";
import CompanyHeader from "./CompanyHeader";
import InfoCards from "./InfoCards";
import CompanyDescription from "./CompanyDescription";
import SECFilingsSection from "./SECFilingsSection";
import RatingsSnapshotSection from "./RatingsSnapshotSection";
import GradeNewsSection from "./GradeNewsSection";

interface StockOverviewContentProps {
  profile: StockProfile;
  quote: StockQuote;
  rating: string | null;
  secFilings: SECFiling[];
  documentsLoading: boolean;
  symbol: string;
  ratingSnapshot: RatingSnapshot | null;
  gradeNews: GradeNews[];
  ratingsLoading: boolean;
}

const StockOverviewContent = ({
  profile,
  quote,
  rating,
  secFilings,
  documentsLoading,
  symbol,
  ratingSnapshot,
  gradeNews,
  ratingsLoading
}: StockOverviewContentProps) => {
  return (
    <div className="space-y-6">
      <CompanyHeader profile={profile} quote={quote} />
      
      <InfoCards profile={profile} quote={quote} rating={rating} />
      
      <CompanyDescription description={profile.description} />
      
      {/* Ratings section - Ensure these appear before SEC Filings */}
      <RatingsSnapshotSection 
        ratingSnapshot={ratingSnapshot} 
        isLoading={ratingsLoading} 
      />
      
      <GradeNewsSection 
        gradeNews={gradeNews} 
        isLoading={ratingsLoading} 
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
