
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import LandingView from "@/components/home/LandingView";
import StockView from "@/components/stocks/StockView";

const Index = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [searchedSymbol, setSearchedSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [featuredSymbols] = useState<{symbol: string, name: string}[]>([
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "GOOG", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "TSLA", name: "Tesla Inc." }
  ]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = () => {
    if (!symbol.trim()) return;
    
    const symbolUpperCase = symbol.toUpperCase();
    setIsLoading(true);
    setSearchedSymbol(symbolUpperCase);
    
    // Update recent searches
    const updatedSearches = [
      symbolUpperCase,
      ...recentSearches.filter(s => s !== symbolUpperCase)
    ].slice(0, 5); // Keep only the 5 most recent
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchedSymbol("");
    setSymbol("");
  };

  const searchSymbol = (sym: string) => {
    setSymbol(sym);
    setSearchedSymbol(sym);
    
    // Update recent searches
    const updatedSearches = [
      sym,
      ...recentSearches.filter(s => s !== sym)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        symbol={symbol}
        setSymbol={setSymbol}
        handleSearch={handleSearch}
        isLoading={isLoading}
        handleKeyDown={handleKeyDown}
      />

      <main className="container mx-auto p-6">
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
