import React from "react";
import { Star, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FeaturedCompaniesProps {
  featuredSymbols: { symbol: string, name: string }[];
  onSelectSymbol: (symbol: string) => void;
}

const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: { 
    y: -8,
    transition: { duration: 0.3 }
  }
};

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  // Random trend indicators for demo purposes
  const getTrendIndicator = (symbol: string) => {
    // Use deterministic randomization based on symbol to keep values consistent
    const hash = symbol.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const isPositive = hash % 3 !== 0; // 2/3 chance of positive trend for demo
    const percentChange = ((hash % 10) + 1) / 10 * (isPositive ? 5 : 3);
    
    return {
      icon: isPositive ? 
        <TrendingUp className="h-5 w-5 text-green-500" /> : 
        <TrendingDown className="h-5 w-5 text-red-500" />,
      value: isPositive ? 
        `+${percentChange.toFixed(2)}%` : 
        `-${percentChange.toFixed(2)}%`,
      color: isPositive ? "text-green-500" : "text-red-500"
    };
  };

  return (
    <div className="relative py-16 overflow-hidden">
      {/* Yellow wave background */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <svg 
          className="absolute top-1/2 left-0 w-full transform -translate-y-1/2"
          viewBox="0 0 1440 320" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            fill="#FDE68A" 
            fillOpacity="0.5" 
            d="M0,96L60,106.7C120,117,240,139,360,133.3C480,128,600,96,720,90.7C840,85,960,107,1080,112C1200,117,1320,107,1380,101.3L1440,96L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          ></path>
        </svg>
      </div>
      
      {/* Subtle moving particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 5 + 2,
            height: Math.random() * 5 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.5 + 0.1
          }}
          animate={{
            x: [0, Math.random() * 50 - 25],
            y: [0, Math.random() * 50 - 25],
            opacity: [0.1, 0.5, 0.1],
          }}
          transition={{
            duration: Math.random() * 8 + 5,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      ))}
      
      <div className="container mx-auto max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="mb-10 relative z-10"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="relative">
              <Star className="h-8 w-8 text-yellow-400 filter drop-shadow-md" />
              <motion.div
                className="absolute inset-0 bg-yellow-400 rounded-full blur-md"
                animate={{ 
                  opacity: [0.3, 0.6, 0.3],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ zIndex: -1 }}
              />
            </div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              Featured Companies
            </h2>
          </div>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-3xl mb-8">
            Explore trending stocks and access in-depth financial analysis with just one click.
          </p>
          
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {featuredSymbols.map((company, index) => {
              const trend = getTrendIndicator(company.symbol);
              
              return (
                <motion.div
                  key={company.symbol}
                  variants={itemAnimation}
                  initial="hidden"
                  animate="show"
                  whileHover="hover"
                  custom={index}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className="cursor-pointer h-full transition-all duration-300 rounded-xl bg-gradient-to-b from-slate-800 to-slate-900 text-white border-none shadow-lg hover:shadow-xl hover:shadow-blue-500/20 backdrop-blur-lg"
                    onClick={() => onSelectSymbol(company.symbol)}
                  >
                    <div className="h-1.5 bg-gradient-to-r from-blue-500 via-blue-400 to-purple-600 rounded-t-xl" />
                    <CardContent className="p-5 relative">
                      {/* Glowing orb background effect */}
                      <div className="absolute -bottom-8 -right-8 w-24 h-24 rounded-full bg-blue-500/10 filter blur-xl" />
                      
                      <div className="flex flex-col h-full justify-between space-y-4">
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-2xl mb-1 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-purple-300">
                              {company.symbol}
                            </span>
                            <motion.div
                              whileHover={{ rotate: 15, scale: 1.1 }}
                              className="p-1 rounded-full bg-blue-500/10"
                            >
                              <ExternalLink className="h-4 w-4 text-blue-300" />
                            </motion.div>
                          </div>
                          <div className="text-sm text-blue-100/70 mb-2 truncate font-medium">
                            {company.name}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-2 backdrop-blur-sm bg-white/5 p-2 rounded-lg">
                          {trend.icon}
                          <span className={`${trend.color} font-semibold`}>
                            {trend.value}
                          </span>
                          <span className="text-xs text-slate-400">24h</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FeaturedCompanies;
