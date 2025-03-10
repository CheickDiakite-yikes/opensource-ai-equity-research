
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Brain, ChartLine, Lightbulb, LineChart, Search, TrendingUp, BarChart4, PieChart, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search";

interface HeroSectionProps {
  featuredSymbols: { symbol: string; name: string }[];
}

const HeroSection: React.FC<HeroSectionProps> = ({ featuredSymbols }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants for the floating elements
  const floatingIcons = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const iconVariant = {
    hidden: { opacity: 0, scale: 0 },
    visible: { 
      opacity: [0, 1, 0.8],
      scale: [0, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse" as const
      }
    }
  };

  return (
    <div className="relative overflow-hidden pt-6 md:pt-10 pb-6 md:pb-10">
      <div className="max-w-screen-xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 items-center px-4">
          {/* Left side - Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="order-2 md:order-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight tracking-tight">
                <span className="block text-foreground">Your AI Analyst for</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
                  Investment Professionals
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-muted-foreground mb-6 max-w-xl leading-relaxed">
                DiDi Data delivers institutional-quality financial analysis for PE, VC, investment banking, 
                hedge funds, equity research, and consulting firms.
              </p>
              
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">TechStars-backed</span>
                <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-medium">AI-Powered</span>
                <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-medium">Financial Analysis</span>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-8">
                  Get Started <ArrowRight className="ml-1" />
                </Button>
                <Button size="lg" variant="outline" className="border-blue-500/50 text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300 rounded-full px-8">
                  Learn More
                </Button>
              </div>
              
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-indigo-600/20 rounded-xl blur-md"></div>
                <div className="relative bg-card/95 backdrop-blur-sm shadow-xl rounded-xl p-4">
                  <h3 className="text-lg font-medium mb-3">Search for a Company or Symbol</h3>
                  <SearchBar 
                    featuredSymbols={featuredSymbols}
                    className="shadow-sm"
                    placeholder="Enter a company name or ticker symbol..."
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Right side - Visual element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-1 md:order-2"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 rounded-3xl -z-10" />
            
            <div className="relative h-[350px] md:h-[450px] w-full rounded-3xl overflow-hidden bg-gradient-to-br from-blue-900/5 to-indigo-900/10 dark:from-blue-400/5 dark:to-indigo-400/10 border border-blue-100/30 dark:border-blue-700/20 shadow-xl">
              {/* Background elements */}
              <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
              <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl" />
              
              {/* Animated chart lines */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 1 }}
                  d="M0,200 Q50,100 100,200 T200,200 T300,150 T400,200"
                  fill="none"
                  stroke="rgba(59, 130, 246, 0.5)"
                  strokeWidth="3"
                />
                <motion.path
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, delay: 1.5 }}
                  d="M0,250 Q50,180 100,250 T200,220 T300,180 T400,250"
                  fill="none"
                  stroke="rgba(99, 102, 241, 0.4)"
                  strokeWidth="2"
                />
              </svg>
              
              {/* Animated icons */}
              <motion.div
                className="absolute inset-0"
                variants={floatingIcons}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
              >
                <motion.div variants={iconVariant} className="absolute top-[15%] left-[12%] text-blue-500 dark:text-blue-400">
                  <ChartLine size={32} />
                </motion.div>
                <motion.div variants={iconVariant} className="absolute top-[25%] right-[15%] text-indigo-500 dark:text-indigo-400">
                  <LineChart size={36} />
                </motion.div>
                <motion.div variants={iconVariant} className="absolute bottom-[30%] left-[20%] text-purple-500 dark:text-purple-400">
                  <Search size={28} />
                </motion.div>
                <motion.div variants={iconVariant} className="absolute bottom-[15%] right-[25%] text-blue-500 dark:text-blue-400">
                  <TrendingUp size={32} />
                </motion.div>
                <motion.div variants={iconVariant} className="absolute top-[45%] right-[30%] text-indigo-500 dark:text-indigo-400">
                  <Brain size={34} />
                </motion.div>
                <motion.div variants={iconVariant} className="absolute top-[60%] left-[15%] text-purple-500 dark:text-purple-400">
                  <Lightbulb size={30} />
                </motion.div>
                <motion.div variants={iconVariant} className="absolute top-[40%] left-[30%] text-green-500 dark:text-green-400">
                  <BarChart4 size={34} />
                </motion.div>
                <motion.div variants={iconVariant} className="absolute bottom-[45%] right-[18%] text-orange-500 dark:text-orange-400">
                  <PieChart size={30} />
                </motion.div>
                <motion.div variants={iconVariant} className="absolute bottom-[20%] left-[40%] text-blue-500 dark:text-blue-400">
                  <Landmark size={32} />
                </motion.div>
              </motion.div>
              
              {/* Data points */}
              <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-blue-500/50 dark:bg-blue-400/50"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ 
                      opacity: [0, 0.8, 0], 
                      scale: [0, 1, 0],
                    }}
                    transition={{
                      duration: 3,
                      delay: Math.random() * 5,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
