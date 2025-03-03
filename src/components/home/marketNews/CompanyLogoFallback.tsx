
import React, { useState, useEffect } from "react";
import { Building } from "lucide-react";
import { fetchCompanyLogo } from "@/services/api/marketData";

interface CompanyLogoFallbackProps {
  symbol: string;
}

const CompanyLogoFallback: React.FC<CompanyLogoFallbackProps> = ({ symbol }) => {
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const getCompanyLogo = async () => {
      try {
        const url = await fetchCompanyLogo(symbol);
        setLogoUrl(url);
      } catch (error) {
        console.error("Error fetching logo:", error);
        setLogoUrl(null);
      }
    };
    
    getCompanyLogo();
  }, [symbol]);
  
  if (logoUrl) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <img src={logoUrl} alt={symbol} className="max-h-20 max-w-[80%] object-contain" />
      </div>
    );
  }
  
  return (
    <div className="flex items-center justify-center h-full">
      <Building className="h-12 w-12 text-muted-foreground/50" />
      <span className="ml-2 text-xl font-bold text-muted-foreground/70">{symbol}</span>
    </div>
  );
};

export default CompanyLogoFallback;
