
import React from "react";
import { CommandGroup, CommandList } from "@/components/ui/command";
import { Sparkles, LucideIcon } from "lucide-react";

interface SearchResultsSectionProps {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  showSeparator?: boolean;
}

export const SearchResultsSection: React.FC<SearchResultsSectionProps> = ({
  title,
  icon: Icon,
  children,
  showSeparator = false
}) => {
  return (
    <>
      {showSeparator && (
        <div className="h-px bg-border my-1" />
      )}
      <CommandGroup heading={
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          <span>{title}</span>
        </div>
      }>
        {children}
      </CommandGroup>
    </>
  );
};
