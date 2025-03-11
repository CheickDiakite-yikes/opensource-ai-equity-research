
/**
 * Service to manage the free predictions limit for anonymous users
 */

import { toast } from "sonner";

const FREE_PREDICTIONS_LIMIT = 5;
const FREE_PREDICTIONS_KEY = 'free_predictions_count';

/**
 * Check if the user has reached their free predictions limit
 * @returns true if user has used all free predictions
 */
export const hasReachedFreeLimit = (): boolean => {
  try {
    const usedPredictions = getUsedPredictionsCount();
    return usedPredictions >= FREE_PREDICTIONS_LIMIT;
  } catch (error) {
    console.error("Error checking free predictions limit:", error);
    return false; // Default to false if there's an error checking
  }
};

/**
 * Get the count of predictions used by the anonymous user
 */
export const getUsedPredictionsCount = (): number => {
  try {
    const count = localStorage.getItem(FREE_PREDICTIONS_KEY);
    return count ? parseInt(count, 10) : 0;
  } catch (error) {
    console.error("Error getting used predictions count:", error);
    return 0;
  }
};

/**
 * Get the number of predictions remaining for the anonymous user
 */
export const getRemainingPredictions = (): number => {
  return Math.max(0, FREE_PREDICTIONS_LIMIT - getUsedPredictionsCount());
};

/**
 * Increment the used predictions count
 * @returns The new count of used predictions
 */
export const incrementUsedPredictions = (): number => {
  try {
    const current = getUsedPredictionsCount();
    const newCount = current + 1;
    localStorage.setItem(FREE_PREDICTIONS_KEY, newCount.toString());
    return newCount;
  } catch (error) {
    console.error("Error incrementing predictions count:", error);
    return 0;
  }
};

/**
 * Reset the used predictions count
 */
export const resetUsedPredictions = (): void => {
  try {
    localStorage.removeItem(FREE_PREDICTIONS_KEY);
  } catch (error) {
    console.error("Error resetting predictions count:", error);
  }
};

/**
 * Check if a user can generate a prediction and show appropriate message
 * @param isAuthenticated Whether the user is authenticated
 * @returns true if the user can proceed
 */
export const canGeneratePrediction = (isAuthenticated: boolean): boolean => {
  // Authenticated users can always generate predictions
  if (isAuthenticated) {
    return true;
  }
  
  // Check if anonymous user has reached their limit
  if (hasReachedFreeLimit()) {
    toast.error(
      "You've reached the limit of 5 free predictions. Please sign in to continue.", 
      { duration: 5000 }
    );
    return false;
  }
  
  // Anonymous user still has free predictions
  const remaining = getRemainingPredictions();
  toast.info(
    `You have ${remaining} free predictions remaining. Sign in to get unlimited predictions.`, 
    { duration: 4000 }
  );
  return true;
};

/**
 * Check if a user can generate a research report
 * @param isAuthenticated Whether the user is authenticated
 * @returns true if the user can proceed
 */
export const canGenerateReport = (isAuthenticated: boolean): boolean => {
  if (!isAuthenticated) {
    toast.error(
      "You must be signed in to generate research reports.", 
      { duration: 5000 }
    );
    return false;
  }
  
  return true;
};
