import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, prefetch, createCacheKey } from '../lib/supabase';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        preloadData(session.user);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event);
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session?.user) {
        // Check if this is a new user (first time sign in)
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single();

        if (!profile) {
          // Create profile for new user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{
              user_id: session.user.id,
              email: session.user.email,
              username: session.user.email?.split('@')[0] || 'user',
              avatar_url: session.user.user_metadata.avatar_url,
              first_name: session.user.user_metadata.full_name?.split(' ')[0] || '',
              last_name: session.user.user_metadata.full_name?.split(' ').slice(1).join(' ') || ''
            }]);

          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
        }

        preloadData(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const preloadData = async (user: User) => {
    console.log('Preloading data for user:', user.id);
    
    try {
      // Preload tasks, categories, and analytics data
      await prefetch([
        {
          key: createCacheKey('todos', { user_id: user.id, category: 'all' }),
          queryFn: async () => {
            const response = await supabase
              .from('todos')
              .select(`
                *,
                task_categories!inner (
                  category_id
                )
              `)
              .eq('user_id', user.id);
            return response;
          }
        },
        {
          key: createCacheKey('categories', { user_id: user.id }),
          queryFn: async () => {
            const response = await supabase
              .from('categories')
              .select('*')
              .eq('user_id', user.id);
            return response;
          }
        },
        {
          key: createCacheKey('profile', { user_id: user.id }),
          queryFn: async () => {
            const response = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', user.id)
              .single();
            return response;
          }
        },
        // Preload basic analytics data
        {
          key: createCacheKey('analytics_tasks', { user_id: user.id }),
          queryFn: async () => {
            const response = await supabase
              .from('todos')
              .select('*')
              .eq('user_id', user.id);
            return response;
          }
        }
      ]);

      console.log('Data preloading complete');
    } catch (error) {
      console.error('Error preloading data:', error);
      // Don't show error toast here as it's not critical
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (data.user) {
        await preloadData(data.user);
      }
      toast.success('Signed in successfully');
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Signed up successfully! Please check your email for verification.');
    } catch (error) {
      console.error('Error signing up:', error);
      toast.error('Failed to sign up');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to send reset email');
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid email profile',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google');
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 