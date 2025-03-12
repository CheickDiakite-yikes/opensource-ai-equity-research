
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export const useSavedContentBase = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to check if user is logged in
  const checkUserLoggedIn = () => {
    if (!user) {
      console.log("No user logged in, clearing data");
      setIsLoading(false);
      return false;
    }
    return true;
  };

  // Reset loading state when component mounts or user changes
  useEffect(() => {
    console.log("useSavedContentBase hook initialized or user changed:", user?.id);
    setIsLoading(true); // Reset loading state when user changes
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
