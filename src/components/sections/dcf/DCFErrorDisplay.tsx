
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface DCFErrorDisplayProps {
  errors: string[];
}

const DCFErrorDisplay: React.FC<DCFErrorDisplayProps> = ({ errors }) => {
  if (errors.length === 0) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error Calculating DCF</AlertTitle>
      <AlertDescription>
        <ul className="list-disc pl-4 mt-2 space-y-1">
          {errors.map((error, i) => (
            <li key={i}>{error}</li>
          ))}
        </ul>
        <p className="mt-2">Using estimated values for the DCF calculation.</p>
      </AlertDescription>
    </Alert>
  );
};

export default DCFErrorDisplay;
