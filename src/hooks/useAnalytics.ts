
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import * as Analytics from '@/services/analytics/analyticsService';

/**
 * Custom hook for tracking analytics throughout the application
 */
export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Initialize analytics on first load
  useEffect(() => {
    Analytics.initializeAnalytics();
  }, []);
  
  // Track page views whenever the location changes
  useEffect(() => {
    // Extract page name from path
    const getPageNameFromPath = (path: string): string => {
      if (path === '/') return 'Home';
      if (path === '/auth') return 'Authentication';
      if (path === '/profile') return 'Profile';
      if (path === '/saved-content') return 'Saved Content';
      
      // Extract path parts
      const pathParts = path.split('/').filter(Boolean);
      if (pathParts.length === 0) return 'Home';
      
      // Capitalize each part and join
      return pathParts.map(part => 
        part.charAt(0).toUpperCase() + part.slice(1)
      ).join(' ');
    };
    
    const pageName = getPageNameFromPath(location.pathname);
    const path = location.pathname + location.search;
    
    // Track page view
    Analytics.trackPageView(pageName, path);
  }, [location]);
  
  // Track when user authentication status changes
  useEffect(() => {
    if (user) {
      // Track only when component first mounts and user is already logged in
      Analytics.trackEvent(
        Analytics.AnalyticsCategory.USER,
        'user_active',
        undefined,
        undefined,
        { isAuthenticated: true }
      );
    }
  }, [user]);
  
  return {
    trackSearch: Analytics.trackSearch,
    trackStockView: Analytics.trackStockView,
    trackReportGeneration: Analytics.trackReportGeneration,
    trackPredictionGeneration: Analytics.trackPredictionGeneration,
    trackContentSave: Analytics.trackContentSave,
    trackFeatureUsage: Analytics.trackFeatureUsage,
    trackError: Analytics.trackError,
    trackAuthEvent: Analytics.trackAuthEvent,
    trackPreferenceChange: Analytics.trackPreferenceChange
  };
};
