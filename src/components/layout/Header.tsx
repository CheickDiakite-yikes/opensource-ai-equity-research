
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Search, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/components/theme-provider';
import { SearchBar } from '@/components/search';
import { cn } from '@/lib/utils';
import UserMenu from './UserMenu';
import { featuredSymbols } from '@/constants/featuredSymbols';

interface HeaderProps {
  symbol?: string;
  setSymbol?: (symbol: string) => void;
  handleSearch?: () => void;
  isLoading?: boolean;
  handleKeyDown?: (e: React.KeyboardEvent) => void;
}

const Header: React.FC<HeaderProps> = ({
  symbol,
  setSymbol,
  handleSearch,
  isLoading,
  handleKeyDown
}) => {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-sm border-b shadow-sm">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-bold hidden sm:block text-xl">Equity Research</span>
          </Link>
        </div>

        <div className={cn(
          "md:flex items-center md:space-x-4",
          "fixed md:static inset-0 flex-col justify-start pt-16 px-4 md:pt-0 md:flex-row",
          "bg-background/95 md:bg-transparent backdrop-blur-sm md:backdrop-blur-none",
          "transform transition-transform duration-300 ease-in-out",
          isMenuOpen ? "flex translate-x-0" : "hidden md:flex -translate-x-full md:translate-x-0",
          "z-40 md:z-auto"
        )}>
          <nav className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-8 md:mb-0">
            <Link to="/" className="text-foreground/90 hover:text-foreground font-medium">Home</Link>
            <Link to="/saved-content" className="text-foreground/90 hover:text-foreground font-medium">Saved Content</Link>
          </nav>
          
          <div className="w-full md:w-auto md:ml-4">
            <SearchBar 
              featuredSymbols={featuredSymbols}
              className="w-full md:w-[300px] lg:w-[320px]"
            />
          </div>
          
          <button onClick={toggleTheme} className="mt-6 md:mt-0 md:ml-2 p-2 rounded-full hover:bg-muted">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <UserMenu />
          
          <button 
            className="md:hidden p-2 rounded-md hover:bg-muted"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
