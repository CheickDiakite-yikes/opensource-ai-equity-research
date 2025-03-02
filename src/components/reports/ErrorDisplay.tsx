
import React from "react";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorDisplayProps {
  error: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  return (
    <Card className="p-6">
      <div className="text-center py-8">
        <AlertCircle className="mx-auto h-12 w-12 text-red-600 mb-4" />
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </Card>
  );
};

export default ErrorDisplay;
