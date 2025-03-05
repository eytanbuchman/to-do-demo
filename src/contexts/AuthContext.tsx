import React, { createContext, useContext, useEffect, useState } from 'react';
import netlifyIdentity from 'netlify-identity-widget';

interface AuthContextType {
  user: netlifyIdentity.User | null;
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
  const [user, setUser] = useState<netlifyIdentity.User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    console.log('Initializing Netlify Identity');
    netlifyIdentity.init();

    netlifyIdentity.on('login', (user) => {
      console.log('Login event:', user);
      setUser(user);
    });

    netlifyIdentity.on('logout', () => {
      console.log('Logout event');
      setUser(null);
    });

    netlifyIdentity.on('init', (user) => {
      console.log('Init event:', user);
      setUser(user);
      setAuthReady(true);
    });

    return () => {
      netlifyIdentity.off('login');
      netlifyIdentity.off('logout');
    };
  }, []);

  const login = () => {
    console.log('Opening login modal');
    netlifyIdentity.open('login');
  };

  const logout = () => {
    console.log('Logging out user');
    netlifyIdentity.logout();
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, authReady }}>
      {children}
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