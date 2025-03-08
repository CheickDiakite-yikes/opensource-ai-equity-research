
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradeNews } from "@/types/ratings/ratingTypes";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpIcon, ArrowDownIcon, MinusIcon, HelpCircleIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GradeNewsSectionProps {
  gradeNews: GradeNews[];
  isLoading: boolean;
}

const GradeNewsSection = ({ gradeNews, isLoading }: GradeNewsSectionProps) => {
  if (isLoading) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Skeleton className="h-6 w-[180px]" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!gradeNews || gradeNews.length === 0) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Analyst Ratings & Upgrades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-muted-foreground text-center py-6">
            <HelpCircleIcon className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
            <p>No analyst ratings or grade changes available for this stock.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to safely parse date strings and handle invalid dates
  const safeFormatDate = (dateString: string) => {
    try {
      // Check if the date string is valid
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return "Date unavailable";
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.warn("Error formatting date:", dateString, error);
      return "Date unavailable";
    }
  };

  // Get grade change icon and color
  const getGradeChangeInfo = (newGrade: string, oldGrade?: string) => {
    if (!oldGrade) {
      return { 
        icon: <HelpCircleIcon className="h-5 w-5 text-yellow-500" />, 
        colorClass: "text-yellow-500" 
      };
    }

    // Simple comparison logic - can be expanded for more nuanced grade comparison
    if (newGrade.toLowerCase().includes('buy') && !oldGrade.toLowerCase().includes('buy')) {
      return { 
        icon: <ArrowUpIcon className="h-5 w-5 text-green-500" />, 
        colorClass: "text-green-500" 
      };
    } 
    else if (newGrade.toLowerCase().includes('sell') && !oldGrade.toLowerCase().includes('sell')) {
      return { 
        icon: <ArrowDownIcon className="h-5 w-5 text-red-500" />, 
        colorClass: "text-red-500" 
      };
    }
    
    return { 
      icon: <MinusIcon className="h-5 w-5 text-muted-foreground" />, 
      colorClass: "text-muted-foreground" 
    };
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-xl">Analyst Ratings & Upgrades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gradeNews.map((item, index) => {
            const { icon, colorClass } = getGradeChangeInfo(
              item.newGrade || "", 
              item.previousGrade
            );
            
            return (
              <div key={index} className="border-b border-border pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{item.gradingCompany || "Unknown Analyst"}</h4>
                    <p className="text-sm text-muted-foreground">
                      {safeFormatDate(item.publishedDate || "")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {icon}
                    <span className={`font-semibold ${colorClass}`}>
                      {item.newGrade || "N/A"}
                    </span>
                    {item.previousGrade && (
                      <span className="text-sm text-muted-foreground">
                        from {item.previousGrade}
                      </span>
                    )}
                  </div>
                </div>
                {item.action && (
                  <p className="mt-2 text-sm">{item.action}</p>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeNewsSection;
