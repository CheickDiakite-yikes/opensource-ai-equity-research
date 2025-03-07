
import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface SavedContentHeaderProps {
  userEmail: string | null;
  isRefreshing: boolean;
  onRefresh: () => void;
}

const SavedContentHeader: React.FC<SavedContentHeaderProps> = ({
  userEmail,
  isRefreshing,
  onRefresh
}) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-primary/5 to-primary/10 p-5 rounded-xl">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">Saved Content</h1>
        <p className="text-muted-foreground mt-1">Your research reports and price predictions</p>
      </div>
      
      <div className="flex items-center gap-4">
        <Button 
          onClick={onRefresh} 
          variant="outline"
          size="sm"
          disabled={isRefreshing}
          className="flex items-center gap-1.5 hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
        </Button>
        
        {userEmail && (
          <div className="text-sm bg-primary/10 text-primary px-3 py-1.5 rounded-full">
            <span>Logged in as: {userEmail}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedContentHeader;
