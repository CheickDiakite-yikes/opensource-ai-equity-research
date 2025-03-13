
import React from "react";
import InfoIcon from "@/components/home/card-components/InfoIcon";

interface ContentPlaceholderProps {
  title?: string;
  description?: string;
  type?: string;
}

const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({
  title,
  description,
  type
}) => {
  // Set default title and description based on type if not provided
  const placeholderTitle = title || 
    (type === "report" ? "Select a report" : 
     type === "prediction" ? "Select a prediction" : 
     "No content selected");
  
  const placeholderDescription = description || 
    (type === "report" ? "Choose a report from the list to view its contents" : 
     type === "prediction" ? "Choose a prediction from the list to view its details" : 
     "Select an item from the list to view its details");

  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed rounded-lg border-gray-700/50 bg-gray-900/30">
      <div className="mb-4">
        <InfoIcon size={20} />
      </div>
      <h3 className="text-xl font-medium mb-2">{placeholderTitle}</h3>
      <p className="text-muted-foreground max-w-md">
        {placeholderDescription}
      </p>
    </div>
  );
};

export default ContentPlaceholder;
