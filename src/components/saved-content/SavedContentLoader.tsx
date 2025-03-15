
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
      className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4"
    >
      <div className="text-center">
        <motion.div
          animate={{ 
            rotate: 360,
            transition: { duration: 1, repeat: Infinity, ease: "linear" }
          }}
          className="inline-block mb-2"
        >
          <Loader2 className="h-8 w-8 text-primary" />
        </motion.div>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-sm sm:text-base"
        >
          Loading content...
        </motion.p>
      </div>
    </motion.div>
  );
};

export default React.memo(SavedContentLoader);
