-- Fix RLS security issues step by step

-- 1. First fix the api_cache table policy issue
-- Drop the incorrect policy that references non-existent user_id column
DROP POLICY IF EXISTS "Users can only access their own cache" ON public.api_cache;

-- Create a simple policy that allows all authenticated users to access cache
-- since api_cache appears to be a system-wide cache without user-specific data
CREATE POLICY "Allow cache access for authenticated users" 
ON public.api_cache 
FOR ALL 
USING (auth.role() = 'authenticated');

-- 2. Remove the overly permissive profiles policy (keep the secure one)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;