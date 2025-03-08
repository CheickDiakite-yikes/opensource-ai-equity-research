
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ClearButton } from "./ClearButton";
import AutoCompleteSuggestion from "./AutoCompleteSuggestion";
import React, { KeyboardEvent, RefObject } from "react";

interface SearchInputContainerProps {
  query: string;
  suggestion: string;
  isOpen: boolean;
  isLoading: boolean;
  placeholder: string;
  searchInputRef: RefObject<HTMLInputElement>;
  onClear: () => void;
  onChange: (value: string) => void;
  onFocus: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void;
}

const SearchInputContainer = ({
  query,
  suggestion,
  isOpen,
  isLoading,
  placeholder,
  searchInputRef,
  onClear,
  onChange,
  onFocus,
  onKeyDown
}: SearchInputContainerProps) => {
  return (
    <div className="relative flex items-center">
      <div className="absolute left-3 z-10 text-primary">
        <Search size={18} strokeWidth={2} />
      </div>
      
      <div className="relative w-full">
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          className="w-full h-11 pl-10 pr-10 rounded-lg border-input bg-background text-foreground transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary/50 animate-cursor"
          autoComplete="off"
        />
        
        <AutoCompleteSuggestion 
          query={query} 
          suggestion={suggestion} 
          isOpen={isOpen} 
        />
      </div>
      
      <ClearButton 
        query={query} 
        isLoading={isLoading} 
        onClear={onClear} 
      />
    </div>
  );
};

export default SearchInputContainer;
