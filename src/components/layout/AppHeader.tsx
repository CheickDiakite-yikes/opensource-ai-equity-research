
import React from 'react';
import { Link } from 'react-router-dom';
import { Moon, Sun, Menu } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useTheme } from '@/components/theme-provider';
import UserMenu from './UserMenu';
import { SearchBar } from '@/components/search';
import { cn } from '@/lib/utils';
import { featuredSymbols } from '@/constants/featuredSymbols';

interface AppHeaderProps {
  featuredSymbols?: { symbol: string; name: string }[];
}

const AppHeader: React.FC<AppHeaderProps> = ({ 
  featuredSymbols: customFeaturedSymbols = featuredSymbols 
}) => {
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/90 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between mx-auto px-4 md:px-8">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-bold text-lg sm:text-xl">Equity Research</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-4">
          <SearchBar 
            featuredSymbols={customFeaturedSymbols}
            className="w-[300px] lg:w-[320px]" 
          />
          
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-foreground">
              Home
            </Link>
            <Link to="/saved-content" className="text-sm font-medium text-foreground/80 hover:text-foreground">
              Saved Content
            </Link>
          </nav>
          
          <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-primary/10">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <UserMenu />
        </div>

        <div className="flex md:hidden items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="px-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu size={24} />
          </Button>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={cn(
        "md:hidden fixed inset-x-0 top-16 bg-background/95 backdrop-blur-sm border-b shadow-lg z-40 transition-transform duration-300 ease-in-out transform",
        mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
      )}>
        <div className="container px-4 py-4 space-y-4">
          <SearchBar 
            featuredSymbols={customFeaturedSymbols}
            className="w-full"
          />
          
          <nav className="flex flex-col space-y-2">
            <Link 
              to="/" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground p-2 rounded-md hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/saved-content" 
              className="text-sm font-medium text-foreground/80 hover:text-foreground p-2 rounded-md hover:bg-primary/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              Saved Content
            </Link>
          </nav>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <button 
              onClick={toggleTheme} 
              className="p-2 rounded-full hover:bg-primary/10"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
