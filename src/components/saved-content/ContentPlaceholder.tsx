
import React from "react";
import { FileText, TrendingUp, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentPlaceholderProps {
  type: "report" | "prediction";
}

const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({ type }) => {
  const Icon = type === "report" ? FileText : TrendingUp;
  const title = `Select a ${type}`;
  const description = `Click on a ${type} from the list to view its details here`;

  return (
    <div className="flex items-center justify-center h-full p-12 border rounded-lg border-dashed text-muted-foreground">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <ArrowLeft className="h-6 w-6 mr-2 opacity-50 animate-pulse" />
        </div>
        
        <Icon className={cn(
          "h-12 w-12 mx-auto",
          type === "report" ? "text-primary/20" : "text-amber-500/20"
        )} />
        
        <div>
          <h3 className="text-lg font-medium">{title}</h3>
          <p className="text-sm max-w-md mx-auto mt-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ContentPlaceholder;
