
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AuthError, User, Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import { trackAuthEvent } from "@/services/analytics/analyticsService";

// Define a profile type
interface UserProfile {
  id?: string;
  first_name?: string;
  last_name?: string;
  firm_name?: string;
  job_role?: string;
  industry?: string;
  location?: string;
  years_experience?: number | null;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profileData?: Partial<UserProfile>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      
      // Fetch user profile if user is logged in
      if (session?.user) {
        fetchUserProfile(session.user.id);
      }
    }

    getSession()

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch user profile if user is logged in
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        // Track authentication events
        if (event === 'SIGNED_IN') {
          trackAuthEvent('login');
          toast.success("Signed in successfully");
        } else if (event === 'SIGNED_OUT') {
          trackAuthEvent('logout');
          toast.info("Signed out successfully");
        } else if (event === 'PASSWORD_RECOVERY') {
          trackAuthEvent('password_reset');
        } else if (event === 'USER_UPDATED') {
          toast.success("Profile updated successfully");
        }
      }
    );

    // Cleanup function
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  // Fetch user profile from the database
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        console.error("Error fetching user profile:", error);
        return;
      }
      
      setProfile(data);
    } catch (error) {
      console.error("Error in fetchUserProfile:", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      // Auth state change listener will handle tracking
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, profileData?: Partial<UserProfile>) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: profileData
        }
      });

      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      trackAuthEvent('signup', 'email');
      toast.success(
        "Signup successful! Please check your email for verification."
      );
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      // Auth state change listener will handle tracking
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        toast.error(error.message);
        throw error;
      }
      toast.success("Password reset email sent!");
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
    
    // Track password reset request
    trackAuthEvent('password_reset', 'email');
  };
  
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) {
        toast.error("You must be logged in to update your profile");
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date()
        });
        
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      // Refresh the profile data
      fetchUserProfile(user.id);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isLoading: loading, // Alias for loading to match usage in components
        profile,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
