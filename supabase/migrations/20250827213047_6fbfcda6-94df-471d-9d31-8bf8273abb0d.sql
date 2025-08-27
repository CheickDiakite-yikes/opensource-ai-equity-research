-- Fix RLS policy for profiles table to prevent unauthorized access to personal information
-- Currently, any authenticated user can view all profiles, which is a security risk

-- Drop the existing overly permissive SELECT policy
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;

-- Create a more secure policy that only allows users to view their own profile
CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Optionally, if there's a business need for admin access, create a separate policy
-- This is commented out by default for security
/*
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);
*/