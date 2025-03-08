
import { LucideIcon } from "lucide-react";

interface SearchSectionHeadingProps {
  icon: LucideIcon;
  title: string;
}

const SearchSectionHeading = ({ icon: Icon, title }: SearchSectionHeadingProps) => {
  return (
    <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
      <Icon size={14} />
      <span>{title}</span>
    </div>
  );
};

export default SearchSectionHeading;
