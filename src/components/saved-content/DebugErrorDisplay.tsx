
import React from 'react';
import { ConnectionStatus } from '@/services/api/userContent/baseService';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DebugErrorDisplayProps {
  error: string | null;
  lastError: string | null;
  debugInfo: any;
  connectionStatus: ConnectionStatus;
  onRefresh: () => Promise<void>;
  onClear: () => void;
  onCheckConnection: () => Promise<boolean>;
}

const DebugErrorDisplay: React.FC<DebugErrorDisplayProps> = ({
  error,
  lastError,
  debugInfo,
  connectionStatus,
  onRefresh,
  onClear,
  onCheckConnection
}) => {
  if (!error && !lastError) return null;

  return (
    <div className="mt-4 space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          {error || 'An error occurred loading your content'}
          {lastError && <div className="text-xs mt-1">Details: {lastError}</div>}
        </AlertDescription>
      </Alert>

      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear Errors
        </Button>
        
        <Button variant="outline" size="sm" onClick={onCheckConnection}>
          Test Connection
        </Button>
        
        <div className="flex items-center ml-4">
          <span className="text-sm mr-2">Connection:</span>
          {connectionStatus === 'connected' ? (
            <Wifi className="h-4 w-4 text-green-500" />
          ) : connectionStatus === 'disconnected' ? (
            <WifiOff className="h-4 w-4 text-red-500" />
          ) : (
            <Wifi className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </div>

      {debugInfo && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono overflow-x-auto">
          <div>Connection Status: {debugInfo.connected ? 'Connected' : 'Disconnected'}</div>
          <div>Auth Status: {debugInfo.authStatus}</div>
          {debugInfo.latency && <div>Latency: {debugInfo.latency}ms</div>}
          {debugInfo.lastError && <div>Last Error: {debugInfo.lastError}</div>}
        </div>
      )}
    </div>
  );
};

export default DebugErrorDisplay;
