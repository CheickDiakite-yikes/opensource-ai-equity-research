
import { Card, CardContent } from "@/components/ui/card";
import { StockProfile, StockQuote } from "@/types/profile/companyTypes";
import { formatLargeNumber, formatCurrency } from "@/lib/utils";
import { Briefcase, TrendingUp, Globe } from "lucide-react";
import StockRatingIndicator from "./StockRatingIndicator";

interface InfoCardsProps {
  profile: StockProfile;
  quote: StockQuote;
  rating: string | null;
}

const InfoCards = ({ profile, quote, rating }: InfoCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center">
            <Briefcase className="h-4 w-4 mr-1.5" />
            Company Info
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">Market Cap</p>
              <p className="font-medium">{formatLargeNumber(quote.marketCap)} <span className="text-xs text-muted-foreground">(USD)</span></p>
            </div>
            <div>
              <p className="text-muted-foreground">P/E Ratio</p>
              <p className="font-medium">{quote.pe ? quote.pe.toFixed(2) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Beta</p>
              <p className="font-medium">{profile.beta ? profile.beta.toFixed(2) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Dividend</p>
              <p className="font-medium">{profile.lastDiv ? profile.lastDiv.toFixed(2) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Shares Outstanding</p>
              <p className="font-medium">{quote.sharesOutstanding ? formatLargeNumber(quote.sharesOutstanding) : 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Stock Grade</p>
              <StockRatingIndicator rating={rating || profile.rating} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center">
            <TrendingUp className="h-4 w-4 mr-1.5" />
            Trading Data
          </h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">52W High</p>
              <p className="font-medium">{formatCurrency(quote.yearHigh)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">52W Low</p>
              <p className="font-medium">{formatCurrency(quote.yearLow)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Avg Volume</p>
              <p className="font-medium">{formatLargeNumber(quote.avgVolume)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Volume</p>
              <p className="font-medium">{formatLargeNumber(quote.volume)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4 space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center">
            <Globe className="h-4 w-4 mr-1.5" />
            About
          </h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div>
              <p className="text-muted-foreground">CEO</p>
              <p className="font-medium">{profile.ceo || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Employees</p>
              <p className="font-medium">{profile.fullTimeEmployees || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Location</p>
              <p className="font-medium">
                {[profile.city, profile.state, profile.country].filter(Boolean).join(', ') || 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Website</p>
              <a 
                href={profile.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline truncate block"
              >
                {profile.website?.replace(/^https?:\/\//, '') || 'N/A'}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InfoCards;
