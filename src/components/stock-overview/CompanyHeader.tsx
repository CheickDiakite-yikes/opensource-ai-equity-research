
import { Badge } from "@/components/ui/badge";
import { StockProfile, StockQuote } from "@/types";
import { cn, formatCurrency, formatPercentage } from "@/lib/utils";
import { TrendingUp, TrendingDown, Building } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCompanyLogo } from "@/services/api/marketData";

interface CompanyHeaderProps {
  profile: StockProfile;
  quote: StockQuote;
}

const CompanyHeader = ({ profile, quote }: CompanyHeaderProps) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(profile.image || null);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    // If profile doesn't have an image or the image fails to load, try to fetch a logo
    if (!profile.image || logoError) {
      fetchCompanyLogo(profile.symbol)
        .then(url => {
          if (url) setLogoUrl(url);
        })
        .catch(console.error);
    }
  }, [profile.symbol, profile.image, logoError]);

  const handleLogoError = () => {
    setLogoError(true);
    // Try to fetch logo as fallback
    if (!logoUrl?.includes('financialmodelingprep.com')) {
      fetchCompanyLogo(profile.symbol)
        .then(url => {
          if (url) setLogoUrl(url);
        })
        .catch(console.error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div className="flex items-center space-x-4">
        {logoUrl ? (
          <div className="h-16 w-16 rounded-lg overflow-hidden border bg-white p-1 flex items-center justify-center">
            <img 
              src={logoUrl} 
              alt={profile.companyName} 
              className="max-h-full max-w-full object-contain"
              onError={handleLogoError}
            />
          </div>
        ) : (
          <div className="h-16 w-16 rounded-lg overflow-hidden border bg-muted/30 p-1 flex items-center justify-center">
            <Building className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            {profile.companyName}
            <Badge variant="outline" className="ml-2">
              {profile.symbol}
            </Badge>
          </h1>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>{profile.exchange}</span>
            <span className="mx-1">•</span>
            <span>{profile.sector}</span>
            <span className="mx-1">•</span>
            <span>{profile.industry}</span>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-start md:items-end">
        <div className="text-3xl font-bold">{formatCurrency(quote.price)}</div>
        <div className="flex items-center space-x-2">
          <span 
            className={cn(
              "flex items-center",
              quote.change > 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {quote.change > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {formatCurrency(quote.change)}
          </span>
          <span 
            className={cn(
              "px-1.5 py-0.5 rounded-md text-xs font-medium",
              quote.changesPercentage > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
            )}
          >
            {formatPercentage(quote.changesPercentage)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CompanyHeader;
