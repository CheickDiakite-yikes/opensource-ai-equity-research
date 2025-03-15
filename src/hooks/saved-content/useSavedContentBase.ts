
import { useState } from "react";
import { useAuth } from "@/hooks/auth/useAuth";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useSavedContentBase = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Improved debug logging
  console.log("useSavedContentBase hook initialized");
  console.log("Current user state:", user ? `Authenticated (${user.id})` : "Not authenticated");

  // Enhanced auth check
  const checkUserLoggedIn = async () => {
    if (!user) {
      console.log("No user object in context");
      setError("You must be signed in to view saved content");
      
      // Double-check with Supabase directly
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session?.user) {
          console.log("Session found but user context not updated. Session user:", sessionData.session.user.id);
          return true; // Session exists even if context isn't updated
        } else {
          console.log("No active session found in direct check");
          toast.error("Please sign in to view your saved content");
          return false;
        }
      } catch (err) {
        console.error("Error checking session:", err);
        return false;
      }
    }
    
    return true;
  };

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
