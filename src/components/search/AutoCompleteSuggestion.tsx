
import React from "react";

interface AutoCompleteSuggestionProps {
  query: string;
  suggestion: string;
  isOpen: boolean;
}

const AutoCompleteSuggestion = ({ query, suggestion, isOpen }: AutoCompleteSuggestionProps) => {
  const displaySuggestion = suggestion && query && 
    suggestion.toLowerCase().startsWith(query.toLowerCase()) ? 
    suggestion.substring(query.length) : '';

  if (!displaySuggestion || !isOpen) return null;

  return (
    <div 
      className="absolute left-[calc(10px+0.55ch*var(--length))] top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
      style={{ "--length": query.length } as React.CSSProperties}
    >
      {displaySuggestion}
    </div>
  );
};

export default AutoCompleteSuggestion;
