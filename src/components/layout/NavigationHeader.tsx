
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, User, LogOut, SaveAll, Home } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import { motion } from "framer-motion";

interface NavigationHeaderProps {
  symbol?: string;
  setSymbol?: (symbol: string) => void;
  handleSearch?: () => void;
  isLoading?: boolean;
  handleKeyDown?: (e: React.KeyboardEvent) => void;
  featuredSymbols?: {symbol: string, name: string}[];
}

const NavigationHeader = ({ 
  symbol = "",
  setSymbol,
  handleSearch,
  isLoading = false,
  handleKeyDown,
  featuredSymbols = []
}: NavigationHeaderProps) => {
  const { user, signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const getInitials = (email: string | null) => {
    if (!email) return "U";
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  const handleSignOut = async () => {
    if (!signOut) return;
    setIsSigningOut(true);
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm"
    >
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-[1400px]">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <img src="/public/lovable-uploads/d4b760ac-7eda-4dd6-976b-71a9a5c48e59.png" alt="Logo" className="w-6 h-6" />
            <span className="text-xl font-bold text-primary">Equity Research</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/" className="flex items-center gap-1.5">
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
            </Button>
            
            {user && (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/saved-content" className="flex items-center gap-1.5">
                  <SaveAll className="w-4 h-4" />
                  <span>Saved</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {setSymbol && handleSearch && (
            <SearchBar
              value={symbol}
              onChange={setSymbol}
              onSearch={handleSearch}
              onKeyDown={handleKeyDown}
              isLoading={isLoading}
              className="max-w-sm"
              featuredSymbols={featuredSymbols}
            />
          )}
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(user.email)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user.email && (
                      <p className="font-medium text-sm text-muted-foreground truncate">
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/saved-content" className="flex items-center gap-2 cursor-pointer">
                    <SaveAll className="w-4 h-4" />
                    <span>Saved Content</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                  disabled={isSigningOut}
                  onClick={handleSignOut}
                >
                  {isSigningOut ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="w-4 h-4" />
                  )}
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" size="sm" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default NavigationHeader;
