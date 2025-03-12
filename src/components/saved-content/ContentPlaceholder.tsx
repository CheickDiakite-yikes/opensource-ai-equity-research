
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
  // Set default title and description based on type if not provided
  const defaultTitle = type === "prediction" 
    ? "Select a prediction" 
    : "Select a report";
  
  const defaultDescription = type === "prediction"
    ? "Choose a saved prediction from the list to view its details."
    : "Choose a saved report from the list to view its details.";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed rounded-lg border-gray-700/50 bg-gray-900/30">
      <div className="mb-4">
        <InfoIcon size={20} />
      </div>
      <h3 className="text-xl font-medium mb-2">{title || defaultTitle}</h3>
      <p className="text-muted-foreground max-w-md">
        {description || defaultDescription}
      </p>
    </div>
  );
};

export default ContentPlaceholder;
