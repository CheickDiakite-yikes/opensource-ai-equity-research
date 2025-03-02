
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import LandingView from "@/components/home/LandingView";
import StockView from "@/components/stocks/StockView";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
    
    // Create space theme elements
    createSpaceElements();
  }, []);
  
  // Create space elements (stars, cosmic dust, nebulae)
  const createSpaceElements = () => {
    // Clear existing elements
    const existingElements = document.querySelectorAll('.star, .cosmic-dust, .nebula, .shooting-star, .planet');
    existingElements.forEach(el => el.remove());
    
    const container = document.getElementById('space-container');
    if (!container) return;
    
    // Create stars
    for (let i = 0; i < 100; i++) {
      createStar(container);
    }
    
    // Create cosmic dust
    for (let i = 0; i < 50; i++) {
      createCosmicDust(container);
    }
    
    // Create nebulae
    createNebula(container, 'nebula-blue', '30%', '20%', 300);
    createNebula(container, 'nebula-purple', '70%', '60%', 250);
    createNebula(container, 'nebula-pink', '20%', '70%', 200);
    
    // Create planets
    createPlanet(container, '85%', '15%', 80);
    createPlanet(container, '10%', '85%', 60);
    
    // Create shooting stars
    createShootingStar(container);
    setInterval(() => createShootingStar(container), 8000);
  };
  
  const createStar = (container: HTMLElement) => {
    const star = document.createElement('div');
    const size = Math.random() > 0.9 ? 'star-large' : Math.random() > 0.6 ? 'star-medium' : 'star-small';
    star.className = `star ${size}`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationName = 'twinkle';
    star.style.animationDuration = `${2 + Math.random() * 3}s`;
    star.style.animationDelay = `${Math.random() * 5}s`;
    star.style.animationIterationCount = 'infinite';
    container.appendChild(star);
  };
  
  const createCosmicDust = (container: HTMLElement) => {
    const dust = document.createElement('div');
    dust.className = 'cosmic-dust';
    dust.style.left = `${Math.random() * 100}%`;
    dust.style.top = `${Math.random() * 100}%`;
    dust.style.opacity = `${Math.random() * 0.5 + 0.1}`;
    container.appendChild(dust);
  };
  
  const createNebula = (container: HTMLElement, className: string, left: string, top: string, size: number) => {
    const nebula = document.createElement('div');
    nebula.className = `nebula ${className}`;
    nebula.style.left = left;
    nebula.style.top = top;
    nebula.style.width = `${size}px`;
    nebula.style.height = `${size}px`;
    container.appendChild(nebula);
  };
  
  const createPlanet = (container: HTMLElement, left: string, top: string, size: number) => {
    const planet = document.createElement('div');
    planet.className = 'planet';
    planet.style.left = left;
    planet.style.top = top;
    planet.style.width = `${size}px`;
    planet.style.height = `${size}px`;
    container.appendChild(planet);
  };
  
  const createShootingStar = (container: HTMLElement) => {
    const star = document.createElement('div');
    star.className = 'shooting-star';
    star.style.left = `${Math.random() * 50}%`;
    star.style.top = `${Math.random() * 50}%`;
    star.style.transform = `rotate(${Math.random() * 45 + 22.5}deg)`;
    star.style.animation = `shooting-star ${Math.random() * 3 + 2}s linear`;
    
    container.appendChild(star);
    
    // Remove after animation
    setTimeout(() => {
      star.remove();
    }, 5000);
  };

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
    toast.info("Returned to home view", {
      duration: 2000,
    });
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
    
    toast.success(`Loading data for ${sym}`, {
      duration: 3000,
    });
  };

  return (
    <div id="space-container" className="space-theme min-h-screen">
      <Header 
        symbol={symbol}
        setSymbol={setSymbol}
        handleSearch={handleSearch}
        isLoading={isLoading}
        handleKeyDown={handleKeyDown}
      />

      <main className="container mx-auto p-6 relative z-10">
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
