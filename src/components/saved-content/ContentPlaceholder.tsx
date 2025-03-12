
import React from "react";
import InfoIcon from "@/components/home/card-components/InfoIcon";

interface ContentPlaceholderProps {
  title?: string;
  description?: string;
  type?: "report" | "prediction";
}

const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({
  title,
  description,
  type
}) => {
  // Set default values based on type if title and description aren't provided
  const defaultTitle = type === "prediction" 
    ? "Select a Prediction" 
    : "Select a Report";
  
  const defaultDescription = type === "prediction"
    ? "Click on a saved prediction from the list to view its detailed AI analysis with GPT-4o reasoning technology."
    : "Click on a saved report from the list to view its comprehensive financial analysis powered by GPT-4o AI.";

  const displayTitle = title || defaultTitle;
  const displayDescription = description || defaultDescription;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed rounded-lg border-gray-700/50 bg-gray-900/30">
      <div className="mb-4">
        <InfoIcon size={20} />
      </div>
      <h3 className="text-xl font-medium mb-2">{displayTitle}</h3>
      <p className="text-muted-foreground max-w-md">
        {displayDescription}
      </p>
    </div>
  );
};

export default ContentPlaceholder;
