-- Final check: Enable RLS on any remaining public tables that might not have it
-- This query will enable RLS on all public tables that don't have it yet

DO $$
DECLARE
    r RECORD;
BEGIN
    -- Enable RLS on all tables in public schema that don't have it enabled
    FOR r IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename NOT IN (
            SELECT tablename 
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE t.schemaname = 'public' 
            AND c.relrowsecurity = true
        )
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', r.tablename);
        RAISE NOTICE 'Enabled RLS on table: %', r.tablename;
    END LOOP;
END $$;

-- Also check for any orphaned policies (policies without RLS enabled)
-- First get a list of tables with policies but without RLS
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT DISTINCT schemaname, tablename
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename NOT IN (
            SELECT t.tablename 
            FROM pg_tables t
            JOIN pg_class c ON c.relname = t.tablename
            WHERE t.schemaname = 'public' 
            AND c.relrowsecurity = true
        )
    LOOP
        EXECUTE format('ALTER TABLE %I.%I ENABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
        RAISE NOTICE 'Fixed policy without RLS on table: %.%', r.schemaname, r.tablename;
    END LOOP;
END $$;