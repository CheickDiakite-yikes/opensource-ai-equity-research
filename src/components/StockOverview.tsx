
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatCurrency, formatLargeNumber, formatPercentage, getPercentStyle } from "@/lib/utils";
import { StockProfile, StockQuote } from "@/types";
import { TrendingUp, TrendingDown, Briefcase, Globe, Users } from "lucide-react";

interface StockOverviewProps {
  profile: StockProfile;
  quote: StockQuote;
  className?: string;
}

const StockOverview = ({ profile, quote, className }: StockOverviewProps) => {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-4">
          {profile.image && (
            <div className="h-16 w-16 rounded-lg overflow-hidden border bg-white p-1 flex items-center justify-center">
              <img 
                src={profile.image} 
                alt={profile.companyName} 
                className="max-h-full max-w-full object-contain"
              />
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
                <p className="font-medium">{formatLargeNumber(quote.marketCap)}</p>
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
      
      <Card>
        <CardContent className="p-4">
          <h3 className="text-sm font-medium mb-2">Company Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {profile.description || "No description available."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockOverview;
