
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { trackFeatureUsage } from "@/services/analytics/analyticsService";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  const handleToggleTheme = () => {
    toggleTheme();
    
    // Track theme toggle action
    trackFeatureUsage('theme', 'toggle', { 
      from: theme,
      to: theme === 'dark' ? 'light' : 'dark'
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleToggleTheme}
      className="rounded-full w-10 h-10 transition-all duration-300"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-yellow-300 hover:text-yellow-200 transition-colors" />
      ) : (
        <Moon className="h-5 w-5 text-indigo-600 hover:text-indigo-500 transition-colors" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
};
