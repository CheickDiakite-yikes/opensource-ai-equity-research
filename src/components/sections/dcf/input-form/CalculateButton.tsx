
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, RefreshCw } from "lucide-react";

interface CalculateButtonProps {
  isCalculating: boolean;
  onCalculate: () => void;
}

const CalculateButton: React.FC<CalculateButtonProps> = ({
  isCalculating,
  onCalculate
}) => {
  return (
    <Button 
      className="w-full mt-4" 
      onClick={onCalculate}
      disabled={isCalculating}
    >
      {isCalculating ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Calculating...
        </>
      ) : (
        <>
          Calculate Custom DCF
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
};

export default CalculateButton;
