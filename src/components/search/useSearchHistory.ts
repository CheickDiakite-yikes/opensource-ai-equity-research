
import { useState, useEffect } from 'react';

export const useSearchHistory = (maxHistory: number = 5) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // Load search history immediately on hook initialization
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);
  
  const addToHistory = (symbol: string) => {
    if (!symbol) return;
    
    const upperSymbol = symbol.toUpperCase();
    
    const updatedSearches = [
      upperSymbol,
      ...recentSearches.filter(s => s !== upperSymbol)
    ].slice(0, maxHistory);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };
  
  const clearHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };
  
  return {
    recentSearches,
    addToHistory,
    clearHistory
  };
};
