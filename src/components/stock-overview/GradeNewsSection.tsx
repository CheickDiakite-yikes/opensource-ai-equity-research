
import { GradeNews } from "@/types/ratings/ratingTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, TrendingUp, TrendingDown, Minus, AlertCircle, GraduationCap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface GradeNewsSectionProps {
  gradeNews: GradeNews[];
  isLoading: boolean;
}

const GradeNewsSection = ({ gradeNews, isLoading }: GradeNewsSectionProps) => {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Analyst Grade Updates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // If no data but not loading, show placeholder with explanation
  if (!gradeNews || gradeNews.length === 0) {
    return (
      <Card className="border-dashed border-muted-foreground/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span>Analyst Grade Updates</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle size={16} />
            <p>No recent analyst grade updates are available for this stock. This could be due to API limitations or because no ratings have been issued recently.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Helper function to determine the direction of grade change
  const getGradeChangeDirection = (newGrade: string, previousGrade: string) => {
    if (!newGrade || !previousGrade) return 'same';
    
    const grades = ['F', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];
    const newIndex = grades.indexOf(newGrade);
    const prevIndex = grades.indexOf(previousGrade);
    
    if (newIndex === -1 || prevIndex === -1) return 'same';
    if (newIndex > prevIndex) return 'up';
    if (newIndex < prevIndex) return 'down';
    return 'same';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <span>Analyst Grade Updates</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {gradeNews.map((news, index) => {
            const direction = getGradeChangeDirection(news.newGrade, news.previousGrade);
            
            return (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">
                      {news.newsTitle || `${news.symbol} Grade ${news.action || 'Update'} by ${news.gradingCompany}`}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {news.gradingCompany} • {formatDistanceToNow(new Date(news.publishedDate), { addSuffix: true })}
                    </p>
                  </div>
                  <a 
                    href={news.newsURL} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>

                <div className="mt-2 flex items-center gap-4">
                  <div className="flex items-center">
                    <span className="text-sm font-medium">Previous:</span>
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      news.previousGrade?.startsWith('A') ? 'bg-green-100 text-green-800' :
                      news.previousGrade?.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                      news.previousGrade?.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                      news.previousGrade?.startsWith('D') ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {news.previousGrade || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center">
                    {direction === 'up' && <TrendingUp size={18} className="text-green-500" />}
                    {direction === 'down' && <TrendingDown size={18} className="text-red-500" />}
                    {direction === 'same' && <Minus size={18} className="text-gray-500" />}
                  </div>

                  <div className="flex items-center">
                    <span className="text-sm font-medium">New:</span>
                    <span className={`ml-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      news.newGrade?.startsWith('A') ? 'bg-green-100 text-green-800' :
                      news.newGrade?.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                      news.newGrade?.startsWith('C') ? 'bg-yellow-100 text-yellow-800' :
                      news.newGrade?.startsWith('D') ? 'bg-orange-100 text-orange-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {news.newGrade || 'N/A'}
                    </span>
                  </div>
                  
                  {news.priceWhenPosted && (
                    <div className="flex items-center">
                      <span className="text-sm font-medium">Price:</span>
                      <span className="ml-1 text-xs">
                        ${news.priceWhenPosted.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default GradeNewsSection;
