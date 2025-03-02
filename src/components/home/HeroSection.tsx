
import React from "react";
import { motion } from "framer-motion";
import { ArrowDownCircle } from "lucide-react";

const HeroSection: React.FC = () => {
  return (
    <div className="text-center max-w-4xl mx-auto py-12 relative">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`hero-nebula-${i}`}
            className="absolute rounded-full opacity-20"
            style={{
              background: `radial-gradient(circle, rgba(56, 189, 248, 0.6) 0%, rgba(59, 130, 246, 0.2) 60%, transparent 100%)`,
              width: 300 + i * 100,
              height: 300 + i * 100,
              left: `calc(50% - ${150 + i * 50}px)`,
              top: `calc(50% - ${150 + i * 50}px)`,
              filter: 'blur(40px)',
            }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{
              duration: 8 + i * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="mb-8 cosmic-container p-8 rounded-2xl"
      >
        <h1 className="text-5xl font-bold mb-6 cosmic-text">
          AI-Powered Stock Analysis
        </h1>
        <p className="text-blue-100 text-xl max-w-3xl mx-auto leading-relaxed">
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
          className="cosmic-glow"
        >
          <ArrowDownCircle className="h-10 w-10 text-blue-300" />
        </motion.div>
      </motion.div>
      
      {/* Add floating stars around the hero section */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`hero-star-${i}`}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 3 + 1,
            height: Math.random() * 3 + 1,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 5px 1px rgba(255, 255, 255, 0.8)',
          }}
          animate={{
            opacity: [0.3, 1, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 3 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

export default HeroSection;
