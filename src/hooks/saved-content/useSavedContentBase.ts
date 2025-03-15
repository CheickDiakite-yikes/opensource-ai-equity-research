
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
      setError("Please log in to view saved content.");
      toast.error("You must be logged in to view saved content");
      return false;
    }
    return true;
  };

  // Reset loading state when component mounts
  useEffect(() => {
    console.log("useSavedContentBase hook initialized", user ? "User authenticated" : "No user");
    setIsLoading(true);
    setError(null);
    
    if (!user) {
      setIsLoading(false);
      setError("Please log in to view saved content.");
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
