import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../config/supabase';

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
  authReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  authReady: false,
});

export const AuthContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error.message);
          return;
        }
        setUser(session?.user || null);
        setAuthReady(true);
      } catch (err) {
        console.error('Error in session check:', err);
      }
    };

    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event);
      setUser(session?.user || null);
      setAuthReady(true);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = () => {
    console.log('Opening auth modal');
    setShowAuth(true);
  };

  const logout = async () => {
    console.log('Logging out user');
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      console.error('Error logging out:', err);
    }
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
          />
        </div>
      </div>
    );
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authReady }}>
      {children}
      <AuthModal />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider');
  }
  return context;
}; 