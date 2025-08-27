-- Fix RLS security issues systematically

-- 1. Fix saved_analyses table - enable RLS and add policies
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

-- 2. Fix user_preferences table - enable RLS and add policies
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

-- 3. Fix api_cache table - add user_id column if it doesn't exist and fix policy
-- First check if user_id column exists, if not add it
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='api_cache' AND column_name='user_id') THEN
        ALTER TABLE public.api_cache ADD COLUMN user_id UUID;
    END IF;
END $$;

-- Drop the existing incorrect policy and create a proper one
DROP POLICY IF EXISTS "Users can only access their own cache" ON public.api_cache;

-- Create new policy that allows public cache access for system-wide cache entries
-- and user-specific access for user cache entries
CREATE POLICY "Cache access policy" 
ON public.api_cache 
FOR ALL 
USING (
  user_id IS NULL OR auth.uid() = user_id
);

-- 4. Remove the overly permissive profiles policy (keep the secure one)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;