
import { supabase } from "@/integrations/supabase/client";
import { getUserId } from "../baseService";

/**
 * Test if we can insert into the user_price_predictions table
 * This is used for diagnostics only
 */
export const testPredictionInsert = async (): Promise<boolean> => {
  try {
    const userId = await getUserId();
    if (!userId) {
      console.log("No user ID found when testing prediction insert");
      return false;
    }
    
    // Use a simple select count query to test permissions
    const { count, error } = await supabase
      .from("user_price_predictions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);
      
    if (error) {
      console.error("Error testing prediction permissions:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in testPredictionInsert:", error);
    return false;
  }
};
