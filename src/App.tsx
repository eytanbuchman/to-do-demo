import { Toaster } from 'react-hot-toast';
import { AuthContextProvider } from './contexts/AuthContext';
import { Todo } from './components/Todo';
import { LandingPage } from './components/LandingPage';
import { Settings } from './components/Settings';
import { Navigation, NavigationTab } from './components/Navigation';
import { useAuth } from './contexts/AuthContext';
import { useState } from 'react';

const AppContent = () => {
  const { user, authReady } = useAuth();
  const [activeTab, setActiveTab] = useState<NavigationTab>('missions');

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-950">
        <div className="animate-pulse text-dark-400">
          Powering up the rebellion...
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-dark-950">
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="min-h-[calc(100vh-4rem)]">
        {activeTab === 'missions' && <Todo />}
        {activeTab === 'settings' && <Settings />}
        {activeTab === 'categories' && (
          <div className="container-custom py-8">
            <h1 className="text-2xl font-bold text-white mb-6">Categories</h1>
            <p className="text-dark-400">Category management coming soon...</p>
          </div>
        )}
      </main>
    </div>
  );
};

function App() {
  return (
    <AuthContextProvider>
      <AppContent />
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#262626',
            color: '#fff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.1)',
          },
          success: {
            iconTheme: {
              primary: '#0090ff',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ff4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </AuthContextProvider>
  );
}

export default App;
