import { nanoid } from 'nanoid';
import { supabase } from '@/integrations/supabase/client';

// Define categories for analytics events
export enum AnalyticsCategory {
  USER = 'user',
  SEARCH = 'search',
  CONTENT = 'content',
  FEATURE = 'feature',
  ERROR = 'error',
  AUTH = 'auth',
  PREFERENCE = 'preference'
}

// Interface for analytics events
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  user_id?: string | null;
  session_id: string;
}

// Generate or retrieve session ID
const getSessionId = (): string => {
  let sessionId = localStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = nanoid();
    localStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

// Initialize analytics
export const initializeAnalytics = (): void => {
  // Generate a new session ID if one doesn't exist
  const sessionId = getSessionId();
  
  // Record application start
  trackEvent(
    AnalyticsCategory.USER,
    'session_start',
    window.location.href,
    undefined,
    {
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`,
      referrer: document.referrer || undefined,
      language: navigator.language
    }
  );
  
  // Track session details
  console.log('Analytics initialized with session ID:', sessionId);
};

// Buffer for batching analytics events
let eventBuffer: AnalyticsEvent[] = [];
let bufferTimeout: NodeJS.Timeout | null = null;

// Flush the event buffer
const flushEventBuffer = async (): Promise<void> => {
  if (eventBuffer.length === 0) return;
  
  const events = [...eventBuffer];
  eventBuffer = [];
  
  try {
    // Convert events to the format expected by the database
    const formattedEvents = events.map(event => ({
      category: event.category,
      action: event.action,
      label: event.label,
      value: event.value,
      metadata: event.metadata ? JSON.stringify(event.metadata) : null,
      user_id: event.user_id,
      session_id: event.session_id
    }));
    
    // Insert events into the database
    const { error } = await supabase
      .from('user_analytics')
      .insert(formattedEvents);
    
    if (error) {
      console.error('Error logging analytics events:', error);
    }
  } catch (error) {
    console.error('Failed to send analytics batch:', error);
  }
};

// Schedule a buffer flush
const scheduleBufferFlush = (): void => {
  if (bufferTimeout) clearTimeout(bufferTimeout);
  
  bufferTimeout = setTimeout(() => {
    flushEventBuffer();
    bufferTimeout = null;
  }, 5000); // Flush every 5 seconds
};

// Base track event function
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number,
  metadata?: Record<string, any>
): void => {
  // Get current user ID
  const user = supabase.auth.getUser();
  const userId = user ? (user as any).data?.user?.id : null;
  
  // Create event
  const event: AnalyticsEvent = {
    category,
    action,
    label,
    value,
    metadata,
    user_id: userId,
    session_id: getSessionId()
  };
  
  // Add to buffer
  eventBuffer.push(event);
  scheduleBufferFlush();
  
  // Log for debugging
  console.log(`Analytics: ${category} > ${action}${label ? ` > ${label}` : ''}${value !== undefined ? ` (${value})` : ''}`);
};

// Track page views
export const trackPageView = (pageName: string, path: string): void => {
  trackEvent(
    AnalyticsCategory.CONTENT,
    'page_view',
    pageName,
    undefined,
    { path }
  );
};

// Track search queries
export const trackSearch = (query: string, resultCount?: number): void => {
  trackEvent(
    AnalyticsCategory.SEARCH,
    'search_query',
    query,
    resultCount,
    { resultCount }
  );
};

// Track stock views
export const trackStockView = (symbol: string, tab?: string): void => {
  trackEvent(
    AnalyticsCategory.CONTENT,
    'view_stock',
    symbol,
    undefined,
    { tab }
  );
};

// Track report generation
export const trackReportGeneration = (
  symbol: string,
  reportType?: string,
  isAuthenticated?: boolean
): void => {
  trackEvent(
    AnalyticsCategory.FEATURE,
    'generate_report',
    symbol,
    undefined,
    { reportType, isAuthenticated }
  );
};

// Track prediction generation
export const trackPredictionGeneration = (
  symbol: string,
  isAuthenticated?: boolean,
  remainingPredictions?: number
): void => {
  trackEvent(
    AnalyticsCategory.FEATURE,
    'generate_prediction',
    symbol,
    undefined,
    { isAuthenticated, remainingPredictions }
  );
};

// Track saving content
export const trackContentSave = (
  contentType: 'report' | 'prediction',
  symbol: string
): void => {
  trackEvent(
    AnalyticsCategory.FEATURE,
    `save_${contentType}`,
    symbol
  );
};

// Track feature usage
export const trackFeatureUsage = (
  feature: string,
  action: string,
  metadata?: Record<string, any>
): void => {
  trackEvent(
    AnalyticsCategory.FEATURE,
    action,
    feature,
    undefined,
    metadata
  );
};

// Track errors
export const trackError = (
  source: string,
  message: string,
  metadata?: Record<string, any>
): void => {
  trackEvent(
    AnalyticsCategory.ERROR,
    source,
    message,
    undefined,
    metadata
  );
};

// Track authentication events
export const trackAuthEvent = (
  action: 'login' | 'logout' | 'signup' | 'password_reset',
  method?: string
): void => {
  trackEvent(
    AnalyticsCategory.AUTH,
    action,
    method,
    undefined,
    { method }
  );
};

// Track preference changes
export const trackPreferenceChange = (
  preference: string,
  value: any
): void => {
  trackEvent(
    AnalyticsCategory.PREFERENCE,
    'update_preference',
    preference,
    undefined,
    { [preference]: value }
  );
};

// Get analytics insights
export const getAnalyticsInsights = async (timeframe: string = '7d'): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('get_analytics_insights', { timeframe });
    
    if (error) {
      console.error('Error fetching analytics insights:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get analytics insights:', error);
    return null;
  }
};
