
import React from "react";
import { motion } from "framer-motion";

const HeroSection: React.FC = () => {
  return (
    <div className="text-center max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold mb-4">AI-Powered Stock Analysis Platform</h2>
        <p className="text-muted-foreground text-lg">
          Utilize advanced AI tools to analyze stocks, generate comprehensive reports, 
          and predict price movements with greater accuracy.
        </p>
      </motion.div>
    </div>
  );
};

export default HeroSection;
