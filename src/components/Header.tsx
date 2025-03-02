
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="relative h-8 w-8">
      <div className="absolute h-8 w-4 bg-didi-blue rounded-l-full transform -translate-x-1"></div>
      <div className="absolute h-8 w-4 bg-didi-darkBlue rounded-r-full right-0"></div>
      <div className="absolute h-2 w-2 bg-didi-lightBlue rounded-full top-0 right-0"></div>
    </div>
    <span className="font-bold text-2xl text-didi-darkBlue">DiDi</span>
  </div>
);

interface HeaderProps {
  className?: string;
}

const Header = ({ className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Add scroll event listener
  useState(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  });

  return (
    <header
      className={cn(
        "fixed top-0 w-full z-40 transition-all duration-200",
        isScrolled ? "bg-white/80 backdrop-blur-md border-b shadow-sm" : "bg-transparent",
        className
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <Logo />
        </Link>
        <nav className="flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            Home
          </Link>
          <Button asChild variant="default" size="sm">
            <Link to="/search">
              Research
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
