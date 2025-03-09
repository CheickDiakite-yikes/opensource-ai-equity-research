
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface TradesSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const TradesSearchBar: React.FC<TradesSearchBarProps> = ({
  searchTerm,
  onSearchChange
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder="Search by name, position, or asset..."
        className="pl-8"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
  );
};

export default TradesSearchBar;
