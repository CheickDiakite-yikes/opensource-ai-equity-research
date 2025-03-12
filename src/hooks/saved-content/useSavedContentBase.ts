
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSavedContentBase = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check if user is logged in
  const checkUserLoggedIn = useCallback(() => {
    if (!user) {
      console.log("No user logged in, clearing data");
      setIsLoading(false);
      return false;
    }
    return true;
  }, [user]);

  // Reset error state when component mounts
  useEffect(() => {
    console.log("useSavedContentBase hook initialized with user:", user?.id);
    setError(null);
    
    // Don't set loading to true on mount, let the fetch functions control this
  }, [user]);

  return {
    user,
    authLoading,
    isLoading,
    setIsLoading,
    error,
    setError,
    checkUserLoggedIn
  };
};
