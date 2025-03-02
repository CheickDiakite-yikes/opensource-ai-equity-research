
import React, { useEffect, useRef } from "react";
import { Star, Sparkles, Rocket } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

interface FeaturedCompaniesProps {
  featuredSymbols: { symbol: string, name: string }[];
  onSelectSymbol: (symbol: string) => void;
}

const itemAnimation = {
  hidden: { opacity: 0, scale: 0.8, rotate: Math.random() * 10 - 5 },
  show: { 
    opacity: 1, 
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  hover: { 
    scale: 1.05, 
    rotate: Math.random() * 4 - 2,
    transition: { duration: 0.3 }
  }
};

const FeaturedCompanies: React.FC<FeaturedCompaniesProps> = ({ 
  featuredSymbols, 
  onSelectSymbol 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    // Create asteroids that move across the container
    const createAsteroid = () => {
      const asteroid = document.createElement('div');
      asteroid.className = 'asteroid';
      
      // Random size between 2 and 8px
      const size = Math.random() * 6 + 2;
      asteroid.style.width = `${size}px`;
      asteroid.style.height = `${size}px`;
      
      // Start from random position on the left
      asteroid.style.left = '-10px';
      asteroid.style.top = `${Math.random() * 100}%`;
      
      // Random opacity
      asteroid.style.opacity = `${Math.random() * 0.7 + 0.3}`;
      
      // Add animation
      asteroid.style.transition = `transform ${Math.random() * 10 + 10}s linear, opacity 0.5s ease`;
      
      // Append to container
      container.appendChild(asteroid);
      
      // Start animation after a small delay
      setTimeout(() => {
        asteroid.style.transform = `translateX(${container.offsetWidth + 20}px) translateY(${Math.random() * 200 - 100}px)`;
      }, 10);
      
      // Remove after animation completes
      setTimeout(() => {
        asteroid.remove();
      }, 20000);
    };
    
    // Create asteroids periodically
    const interval = setInterval(createAsteroid, 1000);
    
    // Initial asteroids
    for (let i = 0; i < 10; i++) {
      setTimeout(createAsteroid, i * 200);
    }
    
    return () => clearInterval(interval);
  }, []);
  
  // Random trend indicators for demo purposes
  const getTrendIndicator = () => {
    return Math.random() > 0.5 ? 
      { icon: <Sparkles className="h-4 w-4 text-yellow-400" />, value: `+${(Math.random() * 5).toFixed(2)}%` } :
      { icon: <Rocket className="h-4 w-4 text-blue-500" />, value: `-${(Math.random() * 5).toFixed(2)}%` };
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* Animated stars in the background */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            opacity: Math.random() * 0.7 + 0.3
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1]
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 5
          }}
        />
      ))}
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-12 pt-8 relative z-10"
      >
        <div className="flex items-center gap-2 mb-8">
          <Star className="h-6 w-6 text-yellow-400" />
          <h2 className="text-2xl font-bold cosmic-text">
            Featured Companies
          </h2>
        </div>
        
        <div className="grid gap-8 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
          {featuredSymbols.map((company, index) => {
            const trend = getTrendIndicator();
            
            return (
              <motion.div
                key={company.symbol}
                variants={itemAnimation}
                initial="hidden"
                animate="show"
                whileHover="hover"
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Comet/asteroid tail effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/10 to-purple-400/20 rounded-lg -z-10"
                  animate={{
                    x: ['-100%', '100%'],
                    opacity: [0, 0.3, 0]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: 'loop',
                    delay: index * 0.5,
                    ease: 'linear'
                  }}
                />
                
                <Card 
                  className="cosmic-card cursor-pointer overflow-hidden border-blue-500/30 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  onClick={() => onSelectSymbol(company.symbol)}
                >
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-purple-500" />
                  <CardContent className="p-5 text-center">
                    <div className="font-bold text-xl mb-1 cosmic-text">
                      {company.symbol}
                    </div>
                    <div className="text-sm text-blue-100/80 mb-3 truncate">
                      {company.name}
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm">
                      {trend.icon}
                      <span className={trend.value.includes('+') ? 'text-green-400' : 'text-red-400'}>
                        {trend.value}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Orbiting small stars */}
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={`orbit-${company.symbol}-${i}`}
                    className="absolute w-1 h-1 bg-white rounded-full"
                    style={{ 
                      top: '50%',
                      left: '50%',
                      boxShadow: '0 0 4px 1px rgba(255, 255, 255, 0.6)'
                    }}
                    animate={{
                      x: Math.cos(i * (2 * Math.PI / 3)) * 50,
                      y: Math.sin(i * (2 * Math.PI / 3)) * 50
                    }}
                    transition={{
                      duration: 3 + i,
                      repeat: Infinity,
                      ease: "linear"
                    }}
                  />
                ))}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default FeaturedCompanies;
