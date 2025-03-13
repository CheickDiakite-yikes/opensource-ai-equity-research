
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
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected'|'disconnected'|'checking'>('checking');

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

  // Check Supabase connection status
  const checkConnection = async () => {
    try {
      setDebugInfo(prev => `${prev || ''}\nChecking connection to Supabase...`);
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setConnectionStatus('disconnected');
        setDebugInfo(prev => `${prev}\nConnection error: ${error.message}`);
        return false;
      }
      
      setConnectionStatus('connected');
      setDebugInfo(prev => `${prev}\nSuccessfully connected to Supabase`);
      return true;
    } catch (err) {
      setConnectionStatus('disconnected');
      setDebugInfo(prev => `${prev}\nConnection check failed: ${err instanceof Error ? err.message : String(err)}`);
      return false;
    }
  };

  // Function to safely refresh data
  const refreshData = async (fetchFunction: () => Promise<void>) => {
    try {
      setIsRefreshing(true);
      setError(null);
      setDebugInfo("Starting refresh operation");
      
      // Check connection first
      await checkConnection();
      
      if (connectionStatus === 'disconnected') {
        throw new Error("Cannot refresh data: disconnected from database");
      }
      
      await fetchFunction();
      setDebugInfo(prev => `${prev}\nRefresh completed successfully`);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setError("Failed to refresh data");
      setLastError({
        message: "Failed to refresh data",
        source: "refreshData",
        details: err,
        time: new Date()
      });
      setDebugInfo(prev => `${prev}\nRefresh failed with error: ${err instanceof Error ? err.message : String(err)}`);
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
    setDebugInfo(prev => `${prev ? prev + '\n' : ''}Error in ${source}: ${message}\nDetails: ${JSON.stringify(err)}`);
    
    return errorDetails;
  };

  // Clear errors function
  const clearErrors = () => {
    setError(null);
    setLastError(null);
    setDebugInfo(null);
  };

  // Reset loading state when component mounts
  useEffect(() => {
    console.log("useSavedContentBase hook initialized");
    setDebugInfo("Hook initialized. Waiting for data operations.");
    checkConnection();
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
    debugInfo,
    setDebugInfo,
    connectionStatus,
    checkUserLoggedIn,
    checkConnection,
    refreshData,
    handleError,
    clearErrors
  };
};
