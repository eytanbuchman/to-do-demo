import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ListBulletIcon,
  TagIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

export const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [showAccountMenu, setShowAccountMenu] = useState(false)

  const navigation = [
    { name: 'Tasks', href: '/tasks', icon: ListBulletIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  ]

  const handleLogout = async () => {
    try {
      await signOut()
      navigate('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <header className="bg-dark-900 border-b border-dark-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/tasks" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">
              <span className="logo-gradient logo-glow">Task</span>
              <span className="logo-gradient logo-glow">Rebel</span>
            </span>
          </Link>

          <nav className="flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                            ${isActive 
                              ? 'text-rebel-red bg-dark-800' 
                              : 'text-gray-400 hover:text-white hover:bg-dark-800'}`}
                >
                  <Icon className="w-5 h-5 mr-1.5" />
                  {item.name}
                </Link>
              )
            })}

            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                onBlur={() => setTimeout(() => setShowAccountMenu(false), 100)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${location.pathname === '/account'
                            ? 'text-rebel-red bg-dark-800' 
                            : 'text-gray-400 hover:text-white hover:bg-dark-800'}`}
              >
                <UserCircleIcon className="w-5 h-5 mr-1.5" />
                Account
                <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform duration-200 
                  ${showAccountMenu ? 'rotate-180' : ''}`} />
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-lg py-1 z-50
                              border border-dark-700 backdrop-blur-sm">
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-dark-700
                              transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <UserCircleIcon className="w-5 h-5 mr-2" />
                      Profile
                    </div>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-400 hover:text-white 
                             hover:bg-dark-700 transition-colors duration-200"
                  >
                    <div className="flex items-center">
                      <ArrowRightOnRectangleIcon className="w-5 h-5 mr-2" />
                      Log Out
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  )
} 