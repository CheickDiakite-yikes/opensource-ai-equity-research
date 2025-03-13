
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface SavedContentError {
  message: string;
  source: string;
  details?: any;
  time: Date;
}

export const useSavedContentBase = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastError, setLastError] = useState<SavedContentError | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to check if user is logged in
  const checkUserLoggedIn = () => {
    if (!user) {
      console.log("No user logged in, clearing data");
      setIsLoading(false);
      setError("You must be signed in to access saved content");
      return false;
    }
    return true;
  };

  // Function to safely refresh data
  const refreshData = async (fetchFunction: () => Promise<void>) => {
    try {
      setIsRefreshing(true);
      setError(null);
      await fetchFunction();
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
      setLastError({
        message: "Failed to refresh data",
        source: "refreshData",
        details: err,
        time: new Date()
      });
      toast.error("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Helper function to handle errors consistently
  const handleError = (err: any, source: string, message: string = "An error occurred") => {
    console.error(`Error in ${source}:`, err);
    
    const errorDetails: SavedContentError = {
      message: message,
      source: source,
      details: err,
      time: new Date()
    };
    
    setLastError(errorDetails);
    setError(message);
    
    return errorDetails;
  };

  // Reset loading state when component mounts
  useEffect(() => {
    console.log("useSavedContentBase hook initialized");
  }, []);

  return {
    user,
    isLoading,
    setIsLoading,
    isRefreshing,
    setIsRefreshing,
    error,
    setError,
    lastError,
    setLastError,
    checkUserLoggedIn,
    refreshData,
    handleError
  };
};
