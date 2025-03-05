
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface TTMLoadingStateProps {
  className?: string;
}

const TTMLoadingState: React.FC<TTMLoadingStateProps> = ({ className }) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">TTM (Latest 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="animate-pulse space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TTMLoadingState;
