
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import LandingView from "@/components/home/LandingView";
import StockView from "@/components/stocks/StockView";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";

const Index = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [searchedSymbol, setSearchedSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [featuredSymbols] = useState<{symbol: string, name: string}[]>([
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "GOOG", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." }
  ]);

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
    
    const symbolParam = searchParams.get('symbol');
    if (symbolParam) {
      setSymbol(symbolParam);
      setSearchedSymbol(symbolParam);
    }
  }, [searchParams]);

  const handleSearch = () => {
    if (!symbol.trim()) return;
    
    const symbolUpperCase = symbol.toUpperCase();
    setIsLoading(true);
    setSearchedSymbol(symbolUpperCase);
    
    const updatedSearches = [
      symbolUpperCase,
      ...recentSearches.filter(s => s !== symbolUpperCase)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Default to report tab when searching
    setSearchParams({ symbol: symbolUpperCase, tab: "report" });
    
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Successfully loaded data for ${symbolUpperCase}`, {
        duration: 3000,
      });
    }, 800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchedSymbol("");
    setSymbol("");
    navigate('/');
    toast.info("Returned to home view", {
      duration: 2000,
    });
  };

  const searchSymbol = (sym: string) => {
    setSymbol(sym);
    setSearchedSymbol(sym);
    
    const updatedSearches = [
      sym,
      ...recentSearches.filter(s => s !== sym)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Always set tab to "report" when selecting from featured companies
    setSearchParams({ symbol: sym, tab: "report" });
    
    toast.success(`Loading research data for ${sym}`, {
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      <Header 
        symbol={symbol}
        setSymbol={setSymbol}
        handleSearch={handleSearch}
        isLoading={isLoading}
        handleKeyDown={handleKeyDown}
      />

      <main className="container mx-auto px-4 sm:px-6 md:px-0 max-w-[1400px]">
        {!searchedSymbol ? (
          <LandingView 
            recentSearches={recentSearches}
            featuredSymbols={featuredSymbols}
            onSelectSymbol={searchSymbol}
          />
        ) : (
          <StockView 
            symbol={searchedSymbol} 
            onClear={clearSearch} 
          />
        )}
      </main>
    </div>
  );
};

export default Index;
