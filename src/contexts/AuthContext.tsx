import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  authReady: boolean;
  signOut: () => Promise<void>;
  login: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  authReady: false,
  signOut: async () => {},
  login: () => {},
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
      if (session?.user) {
        setShowAuth(false); // Close auth modal when user is logged in
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const login = () => {
    console.log('Opening auth modal');
    setShowAuth(true);
  };

  // Auth UI Modal
  const AuthModal = () => {
    if (!showAuth) return null;

    return (
      <div className="fixed inset-0 bg-dark-900/80 flex items-center justify-center p-4 z-50">
        <div className="bg-dark-800 p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">Join the Rebellion</h2>
            <button 
              onClick={() => setShowAuth(false)}
              className="text-dark-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#FF4444',
                    brandAccent: '#FF6666',
                  },
                },
              },
            }}
            providers={['github', 'google']}
            theme="dark"
            redirectTo={window.location.origin + '/reset-password'}
            view="sign_in"
          />
        </div>
      </div>
    );
  };

  return (
    <AuthContext.Provider value={{ user, authReady, signOut, login }}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 