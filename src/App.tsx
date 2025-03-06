import { Toaster } from 'react-hot-toast';
import { AuthContextProvider } from './contexts/AuthContext';
import { LandingPage } from './components/LandingPage';
import { Header } from './components/Header';
import { TaskList } from './components/TaskList';
import { Categories } from './components/Categories';
import { Analytics } from './components/Analytics';
import { ResetPassword } from './components/ResetPassword';
import { useAuth } from './contexts/AuthContext';
import { useState, useEffect } from 'react';

const AppContent = () => {
  const { user, authReady } = useAuth();
  const [currentPage, setCurrentPage] = useState('tasks');
  const [isResetPasswordFlow, setIsResetPasswordFlow] = useState(false);

  useEffect(() => {
    // Check if we're in a password reset flow
    const hash = window.location.hash;
    setIsResetPasswordFlow(hash.includes('type=recovery'));
    console.log('Checking for reset flow:', hash);
  }, []);

  if (!authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-950">
        <div className="animate-pulse text-dark-400">
          Powering up the rebellion...
        </div>
      </div>
    );
  }

  // Show reset password component if we're in the reset flow
  if (isResetPasswordFlow) {
    return <ResetPassword />;
  }

  if (!user) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-dark-900">
      <Toaster position="top-right" />
      <nav className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Header onNavigate={setCurrentPage} currentPage={currentPage} />
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentPage === 'tasks' && <TaskList />}
        {currentPage === 'categories' && <Categories />}
        {currentPage === 'analytics' && <Analytics />}
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
