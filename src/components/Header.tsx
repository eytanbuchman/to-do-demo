import { useAuth } from '../contexts/AuthContext'
import { ChartBarIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

const Header = ({ onNavigate, currentPage }: HeaderProps) => {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <header className="bg-dark-900 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <button 
          onClick={() => onNavigate('tasks')} 
          className="flex items-center space-x-1 logo-hover"
        >
          <span className="text-2xl font-bold logo-gradient logo-glow">Task</span>
          <span className="text-2xl font-bold logo-gradient logo-glow">Rebel</span>
        </button>
        <nav className="flex gap-4">
          <button 
            onClick={() => onNavigate('categories')} 
            className={`text-white hover:text-rebel-red transition-colors flex items-center gap-1 ${
              currentPage === 'categories' ? 'text-rebel-red' : ''
            }`}
          >
            Categories
          </button>
          <button 
            onClick={() => onNavigate('analytics')} 
            className={`text-white hover:text-rebel-red transition-colors flex items-center gap-1 ${
              currentPage === 'analytics' ? 'text-rebel-red' : ''
            }`}
          >
            <ChartBarIcon className="w-5 h-5" />
            Analytics
          </button>
          <button 
            onClick={signOut} 
            className="text-white hover:text-rebel-red transition-colors"
          >
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header 