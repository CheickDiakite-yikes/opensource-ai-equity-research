import { useState, useCallback } from "react";
import { SavedPrediction, UsePredictionsState } from "../types/predictionTypes";
import { getConnectionStatus } from "@/services/api/userContent/baseService";

export const usePredictionsState = (): [
  UsePredictionsState,
  {
    setPredictions: (predictions: SavedPrediction[] | ((prev: SavedPrediction[]) => SavedPrediction[])) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    setLastError: (lastError: string | null) => void;
    setDebugInfo: (debugInfo: any) => void;
    setConnectionStatus: (status: 'connected' | 'disconnected' | 'unknown') => void;
    setRetryCount: (count: number | ((prev: number) => number)) => void;
    clearErrors: () => void;
  }
] => {
  const [state, setState] = useState<UsePredictionsState>({
    predictions: [],
    isLoading: true,
    error: null,
    lastError: null,
    debugInfo: null,
    connectionStatus: getConnectionStatus(),
    retryCount: 0,
  });

  const setPredictions = useCallback((predictions: SavedPrediction[] | ((prev: SavedPrediction[]) => SavedPrediction[])) => {
    setState(prev => ({
      ...prev,
      predictions: typeof predictions === 'function' 
        ? predictions(prev.predictions) 
        : predictions
    }));
  }, []);

  const setIsLoading = useCallback((isLoading: boolean) => {
    setState(prev => ({ ...prev, isLoading }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const setLastError = useCallback((lastError: string | null) => {
    setState(prev => ({ ...prev, lastError }));
  }, []);

  const setDebugInfo = useCallback((debugInfo: any) => {
    setState(prev => ({ ...prev, debugInfo }));
  }, []);

  const setConnectionStatus = useCallback((connectionStatus: 'connected' | 'disconnected' | 'unknown') => {
    setState(prev => ({ ...prev, connectionStatus }));
  }, []);

  const setRetryCount = useCallback((count: number | ((prev: number) => number)) => {
    setState(prev => ({ 
      ...prev, 
      retryCount: typeof count === 'function' ? count(prev.retryCount) : count 
    }));
  }, []);

  const clearErrors = useCallback(() => {
    setState(prev => ({ ...prev, error: null, lastError: null, debugInfo: null }));
  }, []);

  return [
    state,
    { 
      setPredictions, 
      setIsLoading, 
      setError, 
      setLastError, 
      setDebugInfo,
      setConnectionStatus,
      setRetryCount,
      clearErrors
    }
  ];
};
