
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
      toast.error("You must be logged in to access saved content");
      return false;
    }
    return true;
  };

  // Reset loading state when component mounts or user changes
  useEffect(() => {
    console.log("useSavedContentBase hook initialized", { isUserLoggedIn: !!user });
    
    // If user changes, update loading state
    if (!user) {
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
