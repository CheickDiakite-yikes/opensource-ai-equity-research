
// Constants
const STORAGE_KEY = 'freePredictionCount';
const MAX_FREE_PREDICTIONS = 5;

/**
 * Get the number of free predictions used by anonymous users
 */
export const getUsedPredictions = (): number => {
  try {
    const count = localStorage.getItem(STORAGE_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error('Error getting used predictions count:', error);
    return 0;
  }
};

/**
 * Get the number of remaining free predictions for anonymous users
 */
export const getRemainingPredictions = (): number => {
  const used = getUsedPredictions();
  return Math.max(0, MAX_FREE_PREDICTIONS - used);
};

/**
 * Check if user has reached the free limit
 */
export const hasReachedFreeLimit = (): boolean => {
  return getUsedPredictions() >= MAX_FREE_PREDICTIONS;
};

/**
 * Increment the count of used predictions
 */
export const incrementUsedPredictions = (): void => {
  try {
    const currentCount = getUsedPredictions();
    localStorage.setItem(STORAGE_KEY, (currentCount + 1).toString());
  } catch (error) {
    console.error('Error incrementing used predictions count:', error);
  }
};

/**
 * Reset the count of used predictions (e.g., when user logs in)
 */
export const resetUsedPredictions = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting used predictions count:', error);
  }
};

/**
 * Check if a user can generate a report
 * @param isAuthenticated Whether the user is authenticated or not
 */
export const canGenerateReport = (isAuthenticated: boolean): boolean => {
  return isAuthenticated;
};

/**
 * Check if a user can generate a prediction
 * @param isAuthenticated Whether the user is authenticated or not
 */
export const canGeneratePrediction = (isAuthenticated: boolean): boolean => {
  // Authenticated users always can, anonymous users only if they haven't reached the limit
  return isAuthenticated || !hasReachedFreeLimit();
};
