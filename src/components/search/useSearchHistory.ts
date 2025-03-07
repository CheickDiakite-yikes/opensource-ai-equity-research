
import { useState, useEffect } from 'react';

export const useSearchHistory = (maxHistory: number = 5) => {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);
  
  const addToHistory = (symbol: string) => {
    const updatedSearches = [
      symbol,
      ...recentSearches.filter(s => s !== symbol)
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
