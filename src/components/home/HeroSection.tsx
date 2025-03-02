
import React from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <div className="text-center max-w-4xl mx-auto py-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8"
      >
        <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
          AI-Powered Stock Analysis
        </h1>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto leading-relaxed">
          Utilize advanced AI tools to analyze stocks, generate comprehensive reports, 
          and predict price movements with greater accuracy.
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="flex justify-center mt-10"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDownCircle className="h-10 w-10 text-primary/70" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection;
