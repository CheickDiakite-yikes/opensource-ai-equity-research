
import React, { useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import * as Analytics from '@/services/analytics/analyticsService';

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that sets up application-wide analytics tracking
 */
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { theme } = useTheme();
  useAnalytics(); // This sets up page view tracking
  
  // Track theme preference
  useEffect(() => {
    Analytics.trackPreferenceChange('theme', theme);
  }, [theme]);
  
  // Track authentication status changes
  useEffect(() => {
    if (user) {
      // User has logged in during this session
      Analytics.trackEvent(
        Analytics.AnalyticsCategory.USER,
        'session_authenticated',
        undefined,
        undefined,
        { userId: user.id }
      );
    }
  }, [user]);
  
  // Track session duration on component unmount
  useEffect(() => {
    const sessionStartTime = Date.now();
    
    return () => {
      const sessionDuration = (Date.now() - sessionStartTime) / 1000; // in seconds
      Analytics.trackEvent(
        Analytics.AnalyticsCategory.USER,
        'session_ended',
        undefined,
        sessionDuration,
        { isAuthenticated: !!user }
      );
    };
  }, [user]);

  return <>{children}</>;
};
