-- Fix critical security issue: User Personal Information Exposed to Public
-- Issue: profiles table has conflicting policies allowing broader access than intended

-- First, ensure RLS is enabled on all tables that have policies
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Enable RLS on tables that have policies but RLS is not enabled
    FOR r IN 
        SELECT DISTINCT schemaname, tablename
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND NOT EXISTS (
            SELECT 1 
            FROM pg_class c 
            JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = pg_policies.tablename 
            AND n.nspname = pg_policies.schemaname
            AND c.relrowsecurity = true
        )
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
        RAISE NOTICE 'Enabled RLS on table with policies: %.%', r.schemaname, r.tablename;
    END LOOP;
END $$;

-- Fix the profiles table security issue
-- Drop the overly permissive policy that allows all authenticated users to view all profiles
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Ensure the restrictive policy exists and is correctly named
DROP POLICY IF EXISTS "Users can view their own profile only" ON public.profiles;

-- Create the correct restrictive policy for profile access
CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Verify other policies are secure
-- The insert policy should ensure users can only create their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- The update policy should ensure users can only update their own profile  
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);