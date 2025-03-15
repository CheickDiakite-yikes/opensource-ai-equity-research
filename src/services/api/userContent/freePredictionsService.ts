
/**
 * Service for managing free predictions for non-authenticated users
 */

const FREE_PREDICTIONS_KEY = 'free_predictions_used';
const FREE_PREDICTIONS_LIMIT = 5;

/**
 * Increment the number of free predictions used by anonymous users
 * @returns The updated count of used predictions
 */
export const incrementUsedPredictions = (): number => {
  try {
    // Get current count from localStorage
    const currentCount = Number(localStorage.getItem(FREE_PREDICTIONS_KEY) || '0');
    
    // Increment and save
    const newCount = Math.min(currentCount + 1, FREE_PREDICTIONS_LIMIT);
    localStorage.setItem(FREE_PREDICTIONS_KEY, newCount.toString());
    
    console.log(`Incremented free predictions used: ${currentCount} -> ${newCount}`);
    return newCount;
  } catch (error) {
    console.error('Error incrementing free predictions count:', error);
    return 0;
  }
};

/**
 * Get the number of free predictions used
 */
export const getUsedPredictions = (): number => {
  try {
    return Number(localStorage.getItem(FREE_PREDICTIONS_KEY) || '0');
  } catch (error) {
    console.error('Error getting free predictions count:', error);
    return 0;
  }
};

/**
 * Get the number of remaining free predictions
 */
export const getRemainingPredictions = (): number => {
  return Math.max(FREE_PREDICTIONS_LIMIT - getUsedPredictions(), 0);
};

/**
 * Reset the free predictions counter
 */
export const resetUsedPredictions = (): void => {
  try {
    localStorage.removeItem(FREE_PREDICTIONS_KEY);
    console.log('Reset free predictions counter');
  } catch (error) {
    console.error('Error resetting free predictions count:', error);
  }
};

/**
 * Check if user has reached the free limit
 */
export const hasReachedFreeLimit = (): boolean => {
  return getUsedPredictions() >= FREE_PREDICTIONS_LIMIT;
};

/**
 * Check if an unauthenticated user can generate a price prediction
 */
export const canGeneratePrediction = (isAuthenticated: boolean): boolean => {
  if (isAuthenticated) return true;
  return !hasReachedFreeLimit();
};

/**
 * Check if a user can generate a research report
 * Only authenticated users can generate reports
 */
export const canGenerateReport = (isAuthenticated: boolean): boolean => {
  return isAuthenticated;
};
