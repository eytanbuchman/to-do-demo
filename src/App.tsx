import { Toaster } from 'react-hot-toast';
import { AuthContextProvider } from './contexts/AuthContext';
import { Todo } from './components/Todo';
import { LandingPage } from './components/LandingPage';
import { useAuth } from './contexts/AuthContext';

const Header = () => {
  const { user, login, logout } = useAuth();

  if (!user) return null;

  return (
    <header className="header">
      <div className="container-custom h-16 flex justify-between items-center">
        <h1 className="text-xl font-semibold text-dark-900">
          <span className="text-primary-500">Task</span>
          <span className="text-secondary-500">Rebel</span>
        </h1>
        <div>
          <div className="flex items-center gap-6">
            <span className="text-sm text-dark-600">
              {user.email}
            </span>
            <button
              onClick={logout}
              className="btn btn-secondary text-sm"
            >
              Escape
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

const AppContent = () => {
  const { user, authReady } = useAuth();

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
    <div className="min-h-screen bg-dark-50">
      <Header />
      <main>
        <Todo />
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
            background: '#fff',
            color: '#1a1a1a',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05), 0 4px 12px rgba(0,0,0,0.1)',
          },
        }}
      />
    </AuthContextProvider>
  );
}

export default App;
