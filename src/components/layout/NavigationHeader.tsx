
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, FileText, TrendingUp, User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

const NavigationHeader: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="border-b border-border/40 py-3 px-6 bg-gradient-to-r from-background to-secondary/10 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center"
        >
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/288626b2-84b1-4aca-9399-864c39d76976.png" 
              alt="DiDi Equity Research" 
              className="h-8"
            />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 text-xl font-bold hidden sm:inline-block">
              Equity Research
            </span>
          </Link>
        </motion.div>
        
        <motion.nav 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <Link to="/">
            <Button 
              variant={isActive("/") ? "secondary" : "ghost"} 
              size="sm" 
              className="gap-1.5"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
          
          <Link to="/saved-content">
            <Button 
              variant={isActive("/saved-content") ? "secondary" : "ghost"} 
              size="sm" 
              className="gap-1.5"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Saved Content</span>
            </Button>
          </Link>
          
          {user && (
            <Link to="/profile">
              <Button 
                variant={isActive("/profile") ? "secondary" : "ghost"} 
                size="sm" 
                className="gap-1.5"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          )}
          
          <div className="hidden sm:flex items-center text-xs text-muted-foreground ml-3">
            <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3 mx-1" />
            <span className="text-primary font-medium">Saved Content</span>
          </div>
        </motion.nav>
      </div>
    </header>
  );
};

export default NavigationHeader;
