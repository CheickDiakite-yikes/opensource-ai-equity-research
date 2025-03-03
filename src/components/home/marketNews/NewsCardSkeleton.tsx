
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const NewsCardSkeleton: React.FC = () => {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-muted animate-pulse hover-card-highlight">
      <CardContent className="p-0">
        <div className="h-48 bg-muted/60 rounded-t-lg"></div>
        <div className="p-5 space-y-3">
          <div className="h-4 w-16 bg-muted/60 rounded"></div>
          <div className="h-6 w-full bg-muted/80 rounded"></div>
          <div className="h-6 w-3/4 bg-muted/80 rounded"></div>
          <div className="h-4 w-24 bg-muted/60 rounded mt-4"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NewsCardSkeleton;
