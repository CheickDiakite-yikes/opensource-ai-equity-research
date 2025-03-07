
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, Brain, ChartLine, Lightbulb, LineChart, Search, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
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
    <div className="relative overflow-hidden py-16 md:py-24 rounded-3xl">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-indigo-50/20 to-purple-50/30 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/30 -z-10" />
      
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 opacity-60" />
      
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-400/10 dark:bg-blue-400/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 bg-indigo-400/10 dark:bg-indigo-400/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/5 w-56 h-56 bg-purple-400/10 dark:bg-purple-400/5 rounded-full blur-3xl" />
      </div>
      
      {/* Decorative elements - floating icons */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        variants={floatingIcons}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <motion.div variants={iconVariant} className="absolute top-[15%] left-[12%] text-blue-500/40 dark:text-blue-400/30">
          <ChartLine size={32} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute top-[10%] right-[15%] text-indigo-500/40 dark:text-indigo-400/30">
          <LineChart size={36} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute bottom-[25%] left-[8%] text-purple-500/40 dark:text-purple-400/30">
          <Search size={28} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute bottom-[20%] right-[10%] text-blue-500/40 dark:text-blue-400/30">
          <TrendingUp size={32} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute top-[35%] right-[25%] text-indigo-500/40 dark:text-indigo-400/30">
          <Brain size={34} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute top-[60%] left-[20%] text-purple-500/40 dark:text-purple-400/30">
          <Lightbulb size={30} />
        </motion.div>
      </motion.div>
      
      {/* Main content with animations */}
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 tracking-tight"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400">
              AI-Powered Equity Research
            </span>
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mb-10"
          >
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Leverage advanced AI algorithms to generate institutional-quality research, 
              perform deep fundamental analysis, and discover alpha-generating insights across markets.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white border-0 shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-8">
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-blue-500/50 text-foreground hover:bg-blue-50 dark:hover:bg-blue-950/50 transition-all duration-300 rounded-full px-8">
              Learn More
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Animated underline */}
        <motion.div 
          className="h-0.5 w-0 bg-gradient-to-r from-blue-400/60 via-indigo-500/60 to-purple-400/60 mx-auto rounded-full my-12"
          initial={{ width: 0 }}
          animate={{ width: "60%" }}
          transition={{ delay: 1.2, duration: 1.5, ease: "easeInOut" }}
        />
        
        {/* Bottom arrow animation */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="flex justify-center mt-4"
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            whileHover={{ scale: 1.1 }}
            className="cursor-pointer"
          >
            <ArrowDownCircle className="h-10 w-10 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
