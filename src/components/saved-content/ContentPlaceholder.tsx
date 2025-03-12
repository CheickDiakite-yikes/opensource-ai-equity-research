
import React from "react";
import InfoIcon from "@/components/home/card-components/InfoIcon";

interface ContentPlaceholderProps {
  title: string;
  description: string;
}

const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({
  title,
  description
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed rounded-lg border-gray-700/50 bg-gray-900/30">
      <div className="mb-4">
        <InfoIcon size={20} />
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md">
        {description}
      </p>
    </div>
  );
};

export default ContentPlaceholder;
