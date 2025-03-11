
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { resetUsedPredictions } from "@/services/api/userContent/freePredictionsService";
import { trackAuthEvent, AnalyticsCategory, trackEvent } from "@/services/analytics/analyticsService";

interface UserProfile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  firm_name: string | null;
  job_role: string | null;
  location: string | null;
  industry: string | null;
  years_experience: number | null;
  avatar_url: string | null;
}

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
        // Reset free predictions count when user logs in
        resetUsedPredictions();
        // Track user signed in on initial load
        trackEvent(AnalyticsCategory.USER, 'session_start', undefined, undefined, {
          isAuthenticated: true,
          userId: session.user.id
        });
      } else {
        setIsLoading(false);
        // Track anonymous session start
        trackEvent(AnalyticsCategory.USER, 'session_start', undefined, undefined, {
          isAuthenticated: false
        });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchProfile(session.user.id);
          // Reset free predictions count when user logs in
          resetUsedPredictions();
          
          // Track auth state change events
          if (event === 'SIGNED_IN') {
            trackAuthEvent('sign_in');
          } else if (event === 'SIGNED_UP') {
            trackAuthEvent('sign_up');
          }
        } else {
          setProfile(null);
          setIsLoading(false);
          
          // Track sign out event
          if (event === 'SIGNED_OUT') {
            trackAuthEvent('sign_out');
          }
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Use type assertion to work around the type issue
      const { data, error } = await supabase.from("profiles" as any).select("*").eq("id", userId).single();

      if (error) {
        console.error("Error fetching profile:", error);
      } else {
        // Fix type assertion here - cast to UserProfile
        setProfile(data as unknown as UserProfile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast.error(error.message);
        // Track failed sign in
        trackEvent(AnalyticsCategory.ERROR, 'sign_in_error', error.message);
        throw error;
      }
      
      toast.success("Signed in successfully");
      // Track successful sign in (also tracked in onAuthStateChange)
      trackAuthEvent('sign_in', 'password');
      
      // Reset free predictions count when user logs in
      resetUsedPredictions();
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    try {
      setIsLoading(true);
      
      // Sign up the user
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.first_name,
            last_name: userData.last_name
          }
        }
      });
      
      if (error) {
        toast.error(error.message);
        // Track failed sign up
        trackEvent(AnalyticsCategory.ERROR, 'sign_up_error', error.message);
        throw error;
      }
      
      toast.success("Account created! Please check your email for verification.");
      // Track successful sign up (also tracked in onAuthStateChange)
      trackAuthEvent('sign_up', 'password');
    } catch (error) {
      console.error("Sign up error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(error.message);
        trackEvent(AnalyticsCategory.ERROR, 'sign_out_error', error.message);
        throw error;
      }
      
      toast.success("Signed out successfully");
      // Track successful sign out (also tracked in onAuthStateChange)
      trackAuthEvent('sign_out');
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error("No user logged in");
      
      setIsLoading(true);
      
      // Update the profile in the database
      const { error } = await supabase.from("profiles" as any).update(updates).eq("id", user.id);
      
      if (error) {
        toast.error(error.message);
        trackEvent(AnalyticsCategory.ERROR, 'profile_update_error', error.message);
        throw error;
      }
      
      // Refetch the profile to get the updated data
      await fetchProfile(user.id);
      
      toast.success("Profile updated successfully");
      
      // Track successful profile update
      trackEvent(AnalyticsCategory.USER, 'profile_updated', undefined, undefined, {
        updatedFields: Object.keys(updates)
      });
    } catch (error) {
      console.error("Update profile error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    session,
    user,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
