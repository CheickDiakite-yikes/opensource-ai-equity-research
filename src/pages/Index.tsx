
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import LandingView from "@/components/home/LandingView";
import StockView from "@/components/stocks/StockView";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { featuredSymbols as defaultFeaturedSymbols } from "@/constants/featuredSymbols";
import SearchBar from "@/components/search/SearchBar";
import AppHeader from "@/components/layout/AppHeader";

const Index = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [searchedSymbol, setSearchedSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [featuredSymbols] = useState<{symbol: string, name: string}[]>(defaultFeaturedSymbols);

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
    
    // Update recent searches
    const updatedSearches = [
      symbolUpperCase,
      ...recentSearches.filter(s => s !== symbolUpperCase)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Preserve current tab if it exists, otherwise default to overview
    const currentTab = searchParams.get('tab');
    const newParams = new URLSearchParams();
    newParams.set('symbol', symbolUpperCase);
    newParams.set('tab', currentTab || 'overview');
    setSearchParams(newParams);
    
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
    // Clear symbol from URL
    searchParams.delete('symbol');
    setSearchParams(searchParams);
    toast.info("Returned to home view", {
      duration: 2000,
    });
  };

  const searchSymbol = (sym: string) => {
    if (!sym || sym.trim() === '') return;
    
    const upperSym = sym.toUpperCase();
    setSymbol(upperSym);
    setSearchedSymbol(upperSym);
    
    // Update recent searches
    const updatedSearches = [
      upperSym,
      ...recentSearches.filter(s => s !== upperSym)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    // Set up URL parameters for the stock view
    const newParams = new URLSearchParams();
    newParams.set('symbol', upperSym);
    
    // Preserve the current tab or default to overview
    const currentTab = searchParams.get('tab');
    newParams.set('tab', currentTab || 'overview');
    
    setSearchParams(newParams);
    
    toast.success(`Loading research data for ${upperSym}`, {
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {!searchedSymbol ? (
        <AppHeader featuredSymbols={featuredSymbols} />
      ) : (
        <Header 
          symbol={symbol}
          setSymbol={setSymbol}
          handleSearch={handleSearch}
          isLoading={isLoading}
          handleKeyDown={handleKeyDown}
        />
      )}

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
