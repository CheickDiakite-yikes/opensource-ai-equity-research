
import { createClient } from "@supabase/supabase-js";

// Create a supabase client with proper fallback values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://rnpcygrrxeeqphdjuesh.supabase.co";
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJucGN5Z3JyeGVlcXBoZGp1ZXNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MTA3MTIsImV4cCI6MjA1NjA4NjcxMn0.MP1Q_KRdViDCLJdYr_Z_i1_vAMMZgEv3_yX9MGIN0lc";

export const supabase = createClient(supabaseUrl, supabaseKey);

// Log the initialization to help with debugging
console.log(`Supabase client initialized with URL: ${supabaseUrl.substring(0, 20)}...`);
