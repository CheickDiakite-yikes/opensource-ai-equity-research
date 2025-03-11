
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import InfoIcon from "@/components/home/card-components/InfoIcon";

interface EmptyContentStateProps {
  title?: string;
  description?: string;
  type: "reports" | "predictions";
}

const EmptyContentState: React.FC<EmptyContentStateProps> = ({
  title = "No saved content",
  description = "You haven't saved any content yet.",
  type
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center border border-dashed rounded-lg border-gray-700/50 bg-gray-900/30">
      <div className="mb-4">
        <InfoIcon size={20} />
      </div>
      <h3 className="text-xl font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">
        {description}
      </p>
      
      <Link to="/">
        <Button 
          variant="outline"
          className={type === "reports" 
            ? "bg-primary/10 text-primary hover:bg-primary/20 border-primary/30" 
            : "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/30"
          }
        >
          Search for stocks
        </Button>
      </Link>
    </div>
  );
};

export default EmptyContentState;
