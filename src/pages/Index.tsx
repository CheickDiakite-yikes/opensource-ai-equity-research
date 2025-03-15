
import { useState, useEffect, useCallback } from "react";
import Header from "@/components/layout/Header";
import LandingView from "@/components/home/LandingView";
import StockView from "@/components/stocks/StockView";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMediaQuery } from "@/hooks/use-mobile";
import { Starfield } from "@/components/ui/starfield";

const Index = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [searchedSymbol, setSearchedSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [featuredSymbols] = useState<{symbol: string, name: string}[]>([
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corporation" },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "GOOG", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "TSLA", name: "Tesla Inc." },
    { symbol: "NVDA", name: "NVIDIA Corporation" },
    { symbol: "JPM", name: "JPMorgan Chase & Co." },
    { symbol: "V", name: "Visa Inc." },
    { symbol: "MA", name: "Mastercard Inc." },
    { symbol: "PYPL", name: "PayPal Holdings, Inc." },
    { symbol: "NFLX", name: "Netflix, Inc." }
  ]);

  useEffect(() => {
    // Load recent searches from localStorage
    try {
      const savedSearches = localStorage.getItem('recentSearches');
      if (savedSearches) {
        setRecentSearches(JSON.parse(savedSearches));
      }
    } catch (error) {
      console.error("Failed to load recent searches:", error);
    }
    
    // Set symbol from URL param if available
    const symbolParam = searchParams.get('symbol');
    if (symbolParam) {
      setSymbol(symbolParam);
      setSearchedSymbol(symbolParam);
    }
    
    // Listen for the custom clear event
    const handleClearSearch = () => {
      setSearchedSymbol("");
      setSymbol("");
    };
    
    window.addEventListener('clearSearchedSymbol', handleClearSearch);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('clearSearchedSymbol', handleClearSearch);
    };
  }, [searchParams]);

  const handleSearch = useCallback(() => {
    if (!symbol.trim()) return;
    
    const symbolUpperCase = symbol.toUpperCase();
    setIsLoading(true);
    setSearchedSymbol(symbolUpperCase);
    
    // Update recent searches
    try {
      const updatedSearches = [
        symbolUpperCase,
        ...recentSearches.filter(s => s !== symbolUpperCase)
      ].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Failed to save recent searches:", error);
    }
    
    // Default to report tab when searching
    setSearchParams({ symbol: symbolUpperCase, tab: "report" });
    
    // Simulate loading for better UX
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Successfully loaded data for ${symbolUpperCase}`, {
        duration: 3000,
      });
    }, isMobile ? 600 : 800); // Shorter loading time on mobile
  }, [symbol, recentSearches, setSearchParams, isMobile]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  const clearSearch = useCallback(() => {
    setSearchedSymbol("");
    setSymbol("");
    navigate('/');
    toast.info("Returned to home view", {
      duration: 2000,
    });
  }, [navigate]);

  const searchSymbol = useCallback((sym: string) => {
    setSymbol(sym);
    setSearchedSymbol(sym);
    
    // Update recent searches
    try {
      const updatedSearches = [
        sym,
        ...recentSearches.filter(s => s !== sym)
      ].slice(0, 5);
      
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("Failed to save recent searches:", error);
    }
    
    // Always set tab to "report" when selecting from featured companies
    setSearchParams({ symbol: sym, tab: "report" });
    
    toast.success(`Loading research data for ${sym}`, {
      duration: 3000,
    });
  }, [recentSearches, setSearchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 dark:bg-gradient-to-br dark:from-gray-900 dark:to-slate-900 safe-area-padding transition-colors duration-300">
      <Starfield starsCount={isMobile ? 100 : 150} />
      <Header 
        symbol={symbol}
        setSymbol={setSymbol}
        handleSearch={handleSearch}
        isLoading={isLoading}
        handleKeyDown={handleKeyDown}
      />

      <main className="container mx-auto px-2 sm:px-4 md:px-6 max-w-[1400px]">
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
