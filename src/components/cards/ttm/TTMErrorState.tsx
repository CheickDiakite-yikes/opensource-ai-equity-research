
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";

interface TTMErrorStateProps {
  error: string | null;
  className?: string;
}

const TTMErrorState: React.FC<TTMErrorStateProps> = ({ error, className }) => {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">TTM (Latest 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {error || "Could not load TTM data for this symbol."}
        </p>
      </CardContent>
    </Card>
  );
};

export default TTMErrorState;
