
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSavedContentBase = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
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

  // Reset loading state when component mounts or user changes
  useEffect(() => {
    console.log("useSavedContentBase hook initialized or user changed:", user?.id);
    // Don't automatically set loading to true on every user change
    // This was causing infinite loading because user might be null initially
    // and then become available later
    if (user === null) {
      setIsLoading(false);
    }
  }, [user]);

  return {
    user,
    isLoading,
    setIsLoading,
    error,
    setError,
    checkUserLoggedIn
  };
};
