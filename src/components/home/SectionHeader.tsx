
import React from "react";
import { Star } from "lucide-react";
import { motion } from "framer-motion";

interface SectionHeaderProps {
  title: string;
  description: string;
  icon?: React.ReactNode; // Add the icon prop as optional
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, description, icon }) => {
  return (
    <>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          {icon ? icon : <Star className="h-7 w-7 text-blue-500" />}
          <motion.div
            className="absolute inset-0 bg-blue-500/30 rounded-full blur-md"
            animate={{ 
              opacity: [0.2, 0.4, 0.2],
              scale: [0.8, 1.1, 0.8]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            style={{ zIndex: -1 }}
          />
        </div>
        <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
          {title}
        </h2>
      </div>
      
      <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl mb-8">
        {description}
      </p>
    </>
  );
};

export default SectionHeader;
