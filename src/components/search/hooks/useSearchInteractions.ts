
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { useSearchHistory } from "../useSearchHistory";

export const useSearchInteractions = (onSelectCallback?: (symbol: string) => void) => {
  const [, setSearchParams] = useSearchParams();
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
    setIsOpen(false);
    addToHistory(symbol);
    
    if (onSelectCallback) {
      onSelectCallback(symbol);
    } else {
      setSearchParams({ symbol, tab: "report" });
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
