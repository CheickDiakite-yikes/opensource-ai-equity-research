
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle, BarChart4, Brain, ChartLine, Search, TrendingUp } from "lucide-react";

const HeroSection: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants for the floating icons
  const floatingIcons = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: {
        staggerChildren: 0.3
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
    <div className="relative max-w-5xl mx-auto py-16 px-4">
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40 rounded-xl -z-10 blur-xl" />
      
      {/* Decorative floating elements */}
      <motion.div
        className="absolute inset-0 overflow-hidden"
        variants={floatingIcons}
        initial="hidden"
        animate={isVisible ? "visible" : "hidden"}
      >
        <motion.div variants={iconVariant} className="absolute top-[20%] left-[15%] text-primary/20">
          <ChartLine size={32} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute top-[10%] right-[20%] text-blue-400/20">
          <BarChart4 size={36} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute bottom-[30%] left-[10%] text-indigo-500/20">
          <Search size={28} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute bottom-[20%] right-[15%] text-didi-blue/20">
          <TrendingUp size={32} />
        </motion.div>
        <motion.div variants={iconVariant} className="absolute top-[40%] right-[10%] text-primary/20">
          <Brain size={34} />
        </motion.div>
      </motion.div>
      
      {/* Main content with enhanced animations */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-10 relative z-10 text-center"
      >
        <motion.h1 
          className="text-5xl sm:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          AI-Powered Equity Research
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
            Leverage advanced AI algorithms to generate institutional-quality research, 
            perform deep fundamental analysis, and discover alpha-generating insights across markets.
          </p>
        </motion.div>
      </motion.div>
      
      {/* Animated underline */}
      <motion.div 
        className="h-0.5 w-0 bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50 mx-auto rounded-full"
        initial={{ width: 0 }}
        animate={{ width: "60%" }}
        transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
      />
      
      {/* Bottom arrow animation */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.6 }}
        className="flex justify-center mt-12"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          whileHover={{ scale: 1.1 }}
          className="cursor-pointer"
        >
          <ArrowDownCircle className="h-12 w-12 text-primary hover:text-primary/90 transition-colors" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
