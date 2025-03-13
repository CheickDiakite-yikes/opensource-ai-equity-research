
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSavedContentBase = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Helper function to check if user is logged in
  const checkUserLoggedIn = () => {
    if (!user) {
      console.log("No user logged in, clearing data");
      setIsLoading(false);
      return false;
    }
    return true;
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
    checkUserLoggedIn
  };
};
