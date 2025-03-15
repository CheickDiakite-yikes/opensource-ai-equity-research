
const LOCAL_STORAGE_KEY = 'anonymous_prediction_count';

/**
 * Increment the count of predictions used by anonymous users
 * and return the new count
 */
export const incrementUsedPredictions = (): number => {
  try {
    const currentCount = getUsedPredictionsCount();
    const newCount = currentCount + 1;
    
    localStorage.setItem(LOCAL_STORAGE_KEY, newCount.toString());
    return newCount;
  } catch (e) {
    // If localStorage is not available, fallback to 1
    return 1;
  }
};

/**
 * Get the count of predictions used by anonymous users
 */
export const getUsedPredictionsCount = (): number => {
  try {
    const count = localStorage.getItem(LOCAL_STORAGE_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (e) {
    // If localStorage is not available, fallback to 0
    return 0;
  }
};

/**
 * Check if anonymous user can still generate predictions
 * (limit to 3 predictions for anonymous users)
 */
export const canGenerateMorePredictions = (): boolean => {
  const MAX_FREE_PREDICTIONS = 3;
  return getUsedPredictionsCount() < MAX_FREE_PREDICTIONS;
};

/**
 * Reset the count of predictions used by anonymous users
 * (used when they sign up)
 */
export const resetPredictionsCount = (): void => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    // Ignore errors
  }
};
