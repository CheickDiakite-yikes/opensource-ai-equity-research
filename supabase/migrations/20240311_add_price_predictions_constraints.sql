
-- Add unique constraint for user_id + symbol combination
ALTER TABLE user_price_predictions
ADD CONSTRAINT user_price_predictions_user_id_symbol_key 
UNIQUE (user_id, symbol);

-- Add ON CONFLICT handling to the insert policy
CREATE OR REPLACE POLICY "Users can insert their own predictions"
ON public.user_price_predictions
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id)
DO UPDATE SET
  company_name = EXCLUDED.company_name,
  prediction_data = EXCLUDED.prediction_data,
  updated_at = now();
