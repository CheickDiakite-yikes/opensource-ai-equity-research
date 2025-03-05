
import { useState, useEffect } from "react";

interface RetryStrategyParams {
  onRetry: () => Promise<any>;
  autoFetch: boolean;
  maxRetries?: number;
}

/**
 * Hook to implement retry strategy for failed operations
 */
export const useRetryStrategy = ({ 
  onRetry, 
  autoFetch, 
  maxRetries = 2 
}: RetryStrategyParams) => {
  const [retryCount, setRetryCount] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  
  // Auto-retry on failure if within retry limits
  useEffect(() => {
    if (error && autoFetch && retryCount < maxRetries) {
      const retryDelay = 3000 * (retryCount + 1); // Exponential backoff
      
      console.log(`Retrying in ${retryDelay/1000}s (attempt ${retryCount + 1}/${maxRetries})`);
      
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        onRetry().catch(err => {
          console.error(`Retry attempt ${retryCount + 1} failed:`, err);
        });
      }, retryDelay);
      
      return () => clearTimeout(timer);
    }
  }, [error, autoFetch, retryCount, maxRetries, onRetry]);

  return {
    retryCount,
    setRetryCount,
    error,
    setError
  };
};
