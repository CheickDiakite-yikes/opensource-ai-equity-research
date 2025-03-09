
import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TradesSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

const TradesSearchBar: React.FC<TradesSearchBarProps> = ({
  searchTerm,
  onSearchChange,
  placeholder = "Search by name, position, or asset..."
}) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <motion.div 
      className="relative"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-8 pr-8"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      {searchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-0 top-0 h-9 w-9"
          onClick={handleClear}
          title="Clear search"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </motion.div>
  );
};

export default TradesSearchBar;
