
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface SavedContentHeaderProps {
  userEmail: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const SavedContentHeader: React.FC<SavedContentHeaderProps> = ({
  userEmail,
  isRefreshing,
  onRefresh
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-xl"
    >
      <div>
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
        >
          My Docs
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-muted-foreground mt-1"
        >
          Your research reports and price predictions
        </motion.p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={onRefresh} 
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          className="flex items-center gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors relative overflow-hidden group"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : 'group-hover:animate-pulse'}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={isRefreshing ? { scale: 2, opacity: 0 } : { scale: 0, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 bg-primary/10 rounded-full"
          />
        </Button>
        
        {userEmail && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full"
          >
            <span>Logged in as: {userEmail}</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SavedContentHeader;
