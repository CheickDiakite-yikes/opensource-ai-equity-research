
import React from "react";
import { FileText, TrendingUp, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

interface ContentPlaceholderProps {
  type: "report" | "prediction";
}

const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({ type }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center p-10 text-center rounded-xl border border-dashed border-primary/20 bg-primary/5 h-[60vh] backdrop-blur-sm"
    >
      <div className="flex flex-col items-center space-y-6">
        {type === "report" ? (
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
        ) : (
          <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-xl font-medium">
            Select a {type === "report" ? "research report" : "price prediction"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {type === "report" 
              ? "Choose a report from the list to view detailed analysis and insights."
              : "Choose a prediction from the list to view price forecasts and market trends."
            }
          </p>
        </div>
        
        <div className="flex items-center text-primary/70 text-sm mt-4">
          <ArrowLeft className="h-4 w-4 mr-2 animate-pulse" />
          <span>Select from the list on the left</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ContentPlaceholder;
