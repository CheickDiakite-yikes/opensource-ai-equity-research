
import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
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
