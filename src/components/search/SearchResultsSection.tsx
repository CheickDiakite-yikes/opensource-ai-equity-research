
import { ReactNode } from "react";
import { CommandGroup, CommandSeparator } from "@/components/ui/command";
import { LucideIcon } from "lucide-react";

interface SearchResultsSectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  showSeparator?: boolean;
}

export const SearchResultsSection = ({ 
  icon: Icon, 
  title, 
  children, 
  showSeparator = false 
}: SearchResultsSectionProps) => {
  return (
    <>
      {showSeparator && <CommandSeparator />}
      <CommandGroup heading={
        <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Icon size={14} />
          <span>{title}</span>
        </div>
      }>
        {children}
      </CommandGroup>
    </>
  );
};
