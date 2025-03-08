
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useSearchHistory } from "../useSearchHistory";

export const useSearchInteractions = (onSelectCallback?: (symbol: string) => void) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { recentSearches, addToHistory } = useSearchHistory();
  const commandRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (commandRef.current && !commandRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [isOpen, setIsOpen] = useState(false);
  
  // Show dropdown immediately when input is focused
  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleSelectStock = (symbol: string) => {
    if (!symbol) return;
    
    setIsOpen(false);
    addToHistory(symbol);
    
    if (onSelectCallback) {
      // Use custom callback if provided
      onSelectCallback(symbol);
    } else {
      // Default behavior - update URL parameters and force navigation to ensure page reload
      const params = new URLSearchParams();
      params.set('symbol', symbol);
      params.set('tab', 'overview');
      
      // Use navigate instead of setSearchParams to ensure proper route update
      navigate(`/?${params.toString()}`);
    }
    
    // Focus back on search input after selection for better UX
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    
    toast.success(`Loading research data for ${symbol}`, {
      duration: 2000,
    });
  };

  return {
    isOpen,
    setIsOpen,
    handleFocus,
    handleSelectStock,
    commandRef,
    searchInputRef,
    recentSearches
  };
};
