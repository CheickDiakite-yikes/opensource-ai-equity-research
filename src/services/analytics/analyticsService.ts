
/**
 * Analytics Service
 * 
 * Tracks user interactions and usage patterns throughout the application
 * to help improve the product and understand user behavior.
 */

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Event categories for analytics
export enum AnalyticsCategory {
  SEARCH = 'search',
  REPORT = 'report',
  PREDICTION = 'prediction',
  NAVIGATION = 'navigation',
  USER = 'user',
  CONTENT = 'content',
  FEATURE = 'feature',
  ERROR = 'error'
}

// Analytics event type
interface AnalyticsEvent {
  category: AnalyticsCategory;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: string;
  userId?: string;
  sessionId: string;
}

// Session management
let sessionId = '';
const SESSION_ID_KEY = 'equi_session_id';

/**
 * Initialize analytics and create a new session if needed
 */
export const initializeAnalytics = (): string => {
  // Check for existing session
  let existingSessionId = localStorage.getItem(SESSION_ID_KEY);
  
  if (!existingSessionId) {
    // Create new session ID (UUID v4)
    existingSessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, existingSessionId);
  }
  
  sessionId = existingSessionId;
  return sessionId;
};

/**
 * Track an analytics event
 */
export const trackEvent = async (
  category: AnalyticsCategory,
  action: string,
  label?: string,
  value?: number,
  metadata?: Record<string, any>
): Promise<void> => {
  if (!sessionId) {
    initializeAnalytics();
  }

  try {
    // Get current user ID if logged in
    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id;

    const event: AnalyticsEvent = {
      category,
      action,
      label,
      value,
      metadata,
      timestamp: new Date().toISOString(),
      userId,
      sessionId
    };

    // Log event to the database
    const { error } = await supabase
      .from('user_analytics')
      .insert([event]);

    if (error) {
      console.error('Error logging analytics event:', error);
    }
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

/**
 * Track page view
 */
export const trackPageView = (pageName: string, path: string): void => {
  trackEvent(
    AnalyticsCategory.NAVIGATION,
    'page_view',
    pageName,
    undefined,
    { path }
  );
};

/**
 * Track search queries
 */
export const trackSearch = (query: string, resultsCount: number): void => {
  trackEvent(
    AnalyticsCategory.SEARCH,
    'search_query',
    query,
    resultsCount
  );
};

/**
 * Track stock view
 */
export const trackStockView = (symbol: string, companyName?: string): void => {
  trackEvent(
    AnalyticsCategory.CONTENT,
    'view_stock',
    symbol,
    undefined,
    { companyName }
  );
};

/**
 * Track report generation
 */
export const trackReportGeneration = (
  symbol: string, 
  reportType: string,
  isAuthenticated: boolean
): void => {
  trackEvent(
    AnalyticsCategory.REPORT,
    'generate_report',
    symbol,
    undefined,
    { 
      reportType,
      isAuthenticated
    }
  );
};

/**
 * Track prediction generation
 */
export const trackPredictionGeneration = (
  symbol: string,
  isAuthenticated: boolean,
  remainingPredictions?: number
): void => {
  trackEvent(
    AnalyticsCategory.PREDICTION,
    'generate_prediction',
    symbol,
    undefined,
    { 
      isAuthenticated,
      remainingPredictions
    }
  );
};

/**
 * Track save content (report/prediction)
 */
export const trackContentSave = (
  contentType: 'report' | 'prediction',
  symbol: string
): void => {
  trackEvent(
    AnalyticsCategory.CONTENT,
    `save_${contentType}`,
    symbol
  );
};

/**
 * Track feature usage (like toggles, filters, etc.)
 */
export const trackFeatureUsage = (
  featureName: string,
  action: string,
  metadata?: Record<string, any>
): void => {
  trackEvent(
    AnalyticsCategory.FEATURE,
    action,
    featureName,
    undefined,
    metadata
  );
};

/**
 * Track errors encountered by users
 */
export const trackError = (
  errorType: string,
  errorMessage: string,
  metadata?: Record<string, any>
): void => {
  trackEvent(
    AnalyticsCategory.ERROR,
    errorType,
    errorMessage,
    undefined,
    metadata
  );
};

/**
 * Track authentication events
 */
export const trackAuthEvent = (
  action: 'sign_in' | 'sign_up' | 'sign_out' | 'password_reset',
  method?: string
): void => {
  trackEvent(
    AnalyticsCategory.USER,
    action,
    method
  );
};

/**
 * Track user preference changes
 */
export const trackPreferenceChange = (
  preference: string,
  value: string
): void => {
  trackEvent(
    AnalyticsCategory.USER,
    'preference_change',
    preference,
    undefined,
    { value }
  );
};

/**
 * Get analytics insights for admin users
 * This would be expanded in a real implementation
 */
export const getAnalyticsInsights = async (timeframe: string = '7d') => {
  try {
    // This would be a proper backend function in production
    const { data, error } = await supabase
      .rpc('get_analytics_insights', { timeframe });
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching analytics insights:', error);
    toast.error('Failed to load analytics insights');
    return null;
  }
};
