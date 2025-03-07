
import React from "react";
import { FileText, TrendingUp } from "lucide-react";

interface ContentPlaceholderProps {
  type: "report" | "prediction";
}

const ContentPlaceholder: React.FC<ContentPlaceholderProps> = ({ type }) => {
  const Icon = type === "report" ? FileText : TrendingUp;
  const title = `Select a ${type}`;
  const description = `Click on a ${type} from the list to view its details here`;

  return (
    <div className="flex items-center justify-center h-full p-12 border rounded-lg border-dashed text-muted-foreground">
      <div className="text-center">
        <Icon className="h-12 w-12 mx-auto mb-4 opacity-20" />
        <h3 className="text-lg font-medium">{title}</h3>
        <p className="text-sm max-w-md mx-auto mt-2">
          {description}
        </p>
      </div>
    </div>
  );
};

export default ContentPlaceholder;
