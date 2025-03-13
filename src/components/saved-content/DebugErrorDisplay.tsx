
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BugIcon, 
  XIcon, 
  TerminalIcon, 
  RefreshCwIcon, 
  AlertCircleIcon, 
  WifiIcon, 
  WifiOffIcon 
} from "lucide-react";
import { SavedContentError } from "@/hooks/saved-content/useSavedContentBase";

interface DebugErrorDisplayProps {
  error: string | null;
  lastError: SavedContentError | null;
  debugInfo: string | null;
  connectionStatus?: 'connected' | 'disconnected' | 'checking';
  onRefresh?: () => Promise<void>;
  onClear?: () => void;
  onCheckConnection?: () => Promise<void>;
}

const DebugErrorDisplay: React.FC<DebugErrorDisplayProps> = ({
  error,
  lastError,
  debugInfo,
  connectionStatus = 'connected',
  onRefresh,
  onClear,
  onCheckConnection
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  // If there's no error or debug info, don't render anything
  if (!error && !lastError && !debugInfo && connectionStatus !== 'disconnected') {
    return null;
  }

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    try {
      setIsRefreshing(true);
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleClear = () => {
    if (onClear) {
      onClear();
    }
  };

  const handleCheckConnection = async () => {
    if (!onCheckConnection) return;
    
    try {
      setIsChecking(true);
      await onCheckConnection();
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Card className="mt-4 border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
            {error ? (
              <AlertCircleIcon className="h-5 w-5 text-red-500" />
            ) : connectionStatus === 'disconnected' ? (
              <WifiOffIcon className="h-5 w-5 text-red-500" />
            ) : (
              <BugIcon className="h-5 w-5" />
            )}
            <h3 className="font-medium">
              {error ? "Error Detected" : 
               connectionStatus === 'disconnected' ? "Connection Error" : 
               "Debug Information"}
            </h3>
            
            {/* Connection status indicator */}
            <div className="ml-2 flex items-center">
              {connectionStatus === 'connected' ? (
                <span className="text-green-600 text-xs flex items-center">
                  <WifiIcon className="h-3 w-3 mr-1" />Connected
                </span>
              ) : connectionStatus === 'disconnected' ? (
                <span className="text-red-600 text-xs flex items-center">
                  <WifiOffIcon className="h-3 w-3 mr-1" />Disconnected
                </span>
              ) : (
                <span className="text-yellow-600 text-xs">Checking...</span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onCheckConnection && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 border-yellow-300 dark:border-yellow-700"
                onClick={handleCheckConnection}
                disabled={isChecking}
              >
                <WifiIcon className={`h-4 w-4 mr-1 ${isChecking ? 'animate-pulse' : ''}`} />
                Test Connection
              </Button>
            )}
            {onRefresh && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 border-yellow-300 dark:border-yellow-700"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCwIcon className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Retry
              </Button>
            )}
            {onClear && (
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 border-yellow-300 dark:border-yellow-700"
                onClick={handleClear}
              >
                <XIcon className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-2 border-yellow-300 dark:border-yellow-700"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <TerminalIcon className="h-4 w-4 mr-1" />
              {isExpanded ? "Hide Details" : "Show Details"}
            </Button>
          </div>
        </div>
        
        {error && (
          <div className="mt-2 text-red-600 dark:text-red-400 font-medium">
            {error}
          </div>
        )}
        
        {connectionStatus === 'disconnected' && !error && (
          <div className="mt-2 text-red-600 dark:text-red-400 font-medium">
            Database connection error. Please try refreshing the page or check your internet connection.
          </div>
        )}
        
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {lastError && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Last Error:</h4>
                <div className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-3 text-xs font-mono overflow-auto max-h-40">
                  <p><strong>Time:</strong> {lastError.time.toLocaleString()}</p>
                  <p><strong>Source:</strong> {lastError.source}</p>
                  <p><strong>Message:</strong> {lastError.message}</p>
                  {lastError.details && (
                    <div className="mt-2">
                      <p><strong>Details:</strong></p>
                      <pre className="whitespace-pre-wrap overflow-auto mt-1 max-h-32">
                        {JSON.stringify(lastError.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {debugInfo && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Debug Info:</h4>
                <pre className="bg-yellow-100 dark:bg-yellow-900/40 rounded p-3 text-xs font-mono overflow-auto whitespace-pre-wrap max-h-40">
                  {debugInfo}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

export default DebugErrorDisplay;
