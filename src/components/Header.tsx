import React from 'react'
import { useAuth } from '../contexts/AuthContext'

interface HeaderProps {
  onNavigate: (page: string) => void
  currentPage: string
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, signOut } = useAuth()

  const navItems = [
    { id: 'tasks', label: 'Tasks' },
    { id: 'categories', label: 'Categories' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'profile', label: 'Profile' }
  ]

  return (
    <header className="py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <h1 className="text-2xl font-bold text-rebel-red">TaskRebel</h1>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id
                    ? 'bg-dark-700 text-white'
                    : 'text-dark-400 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-4">
          {user && (
            <button
              onClick={() => signOut()}
              className="text-dark-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <button
            type="button"
            className="text-dark-400 hover:text-white"
            aria-label="Open menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <nav className="md:hidden mt-4">
        <div className="space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`block w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentPage === item.id
                  ? 'bg-dark-700 text-white'
                  : 'text-dark-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </header>
  )
} 