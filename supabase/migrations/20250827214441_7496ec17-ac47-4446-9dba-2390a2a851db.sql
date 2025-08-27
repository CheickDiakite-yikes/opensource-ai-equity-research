-- Continue fixing RLS security issues

-- Enable RLS and add policies for saved_analyses table
ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;

-- Allow users to access only their own saved analyses
CREATE POLICY "Users can view their own saved analyses" 
ON public.saved_analyses 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved analyses" 
ON public.saved_analyses 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved analyses" 
ON public.saved_analyses 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved analyses" 
ON public.saved_analyses 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS and add policies for user_preferences table
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Allow users to access only their own preferences
CREATE POLICY "Users can view their own preferences" 
ON public.user_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" 
ON public.user_preferences 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" 
ON public.user_preferences 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own preferences" 
ON public.user_preferences 
FOR DELETE 
USING (auth.uid() = user_id);