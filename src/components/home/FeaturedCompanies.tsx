
import React from "react";
import { motion } from "framer-motion";
import CompanyCard from "./CompanyCard";
import SectionHeader from "./SectionHeader";
import { AlertCircle } from "lucide-react";
import { useMediaQuery } from "@/hooks/use-mobile";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";

interface FeaturedCompaniesProps {
  featuredSymbols: { symbol: string, name: string }[];
  onSelectSymbol: (symbol: string) => void;
}

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  // Check if we're on mobile screen
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Function to handle company selection
  const handleSelectCompany = (symbol: string) => {
    onSelectSymbol(symbol);
  };

  // If there are no companies to display
  if (featuredSymbols.length === 0) {
    return (
      <div className="relative py-8">
        <div className="container mx-auto px-4 sm:px-6 md:px-0 max-w-[1400px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="mb-8 relative z-10"
          >
            <SectionHeader 
              title="Featured Companies"
              description="Explore trending stocks with AI-powered analysis and in-depth financial research."
            />
            
            <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <AlertCircle className="mx-auto h-10 w-10 text-amber-500 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Featured Companies</h3>
              <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                There are no featured companies to display at this time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative py-8">
      <div className="container mx-auto px-4 sm:px-6 md:px-0 max-w-[1400px]">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-8 relative z-10"
        >
          <SectionHeader 
            title="Featured Companies"
            description="Explore trending stocks with AI-powered analysis and in-depth financial research."
          />
          
          {isMobile ? (
            // Mobile view: Enhanced Carousel
            <Carousel 
              className="w-full"
              opts={{
                align: "center", // Changed from "start" to "center"
                loop: true,
              }}
            >
              <CarouselContent className="-ml-1 md:-ml-2">
                {featuredSymbols.map((company) => (
                  <CarouselItem key={company.symbol} className="pl-1 md:pl-2 basis-[95%] sm:basis-[85%]">
                    <div className="p-1">
                      <CompanyCard 
                        company={company}
                        onSelect={handleSelectCompany}
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="flex justify-center items-center mt-6 gap-4">
                <CarouselPrevious className="static translate-y-0 h-10 w-10 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border-blue-300/30 dark:border-blue-500/30" />
                <CarouselNext className="static translate-y-0 h-10 w-10 rounded-full bg-blue-500/10 hover:bg-blue-500/20 border-blue-300/30 dark:border-blue-500/30" />
              </div>
            </Carousel>
          ) : (
            // Desktop view: Grid
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 w-full">
              {featuredSymbols.map((company) => (
                <CompanyCard 
                  key={company.symbol}
                  company={company}
                  onSelect={handleSelectCompany}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedCompanies;
