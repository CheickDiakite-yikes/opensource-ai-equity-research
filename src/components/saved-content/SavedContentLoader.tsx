
import React from "react";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const SavedContentLoader: React.FC = () => {
  return (
    <motion.div 
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center min-h-[calc(100vh-80px)]"
    >
      <motion.div
        animate={{ 
          rotate: 360,
          transition: { duration: 1, repeat: Infinity, ease: "linear" }
        }}
        className="relative"
      >
        <Loader2 className="h-8 w-8 text-primary" />
      </motion.div>
      <motion.span 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="ml-3 text-muted-foreground"
      >
        Loading content...
      </motion.span>
    </motion.div>
  );
};

export default SavedContentLoader;
