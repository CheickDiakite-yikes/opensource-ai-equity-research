
import React from "react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface InfoIconProps {
  className?: string;
  size?: number;
}

const InfoIcon: React.FC<InfoIconProps> = ({ 
  className,
  size = 24
}) => {
  return (
    <div className={cn(
      "flex items-center justify-center rounded-full bg-gray-700/50 border border-gray-600/50 p-1",
      className
    )}>
      <Info className="text-gray-300" size={size} />
    </div>
  );
};

export default InfoIcon;
