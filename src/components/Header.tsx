import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ListBulletIcon,
  TagIcon,
  ChartBarIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../contexts/AuthContext'

export const Header = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [showAccountMenu, setShowAccountMenu] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  const navigation = [
    { name: 'Missions', href: '/tasks', icon: ListBulletIcon },
    { name: 'Squads', href: '/categories', icon: TagIcon },
    { name: 'Intel', href: '/analytics', icon: ChartBarIcon },
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
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-white">
              <span className="logo-gradient logo-glow">Task</span>
              <span className="logo-gradient logo-glow">Rebel</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200
                    ${location.pathname === item.href
                      ? 'text-white bg-dark-800'
                      : 'text-gray-400 hover:text-white hover:bg-dark-800'
                    }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              )
            })}

            <div className="relative">
              <button
                onClick={() => setShowAccountMenu(!showAccountMenu)}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium text-gray-400 
                         hover:text-white hover:bg-dark-800 transition-colors duration-200"
              >
                <UserCircleIcon className="w-5 h-5" />
              </button>

              {showAccountMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-dark-800 rounded-lg shadow-lg py-1 z-50">
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-gray-300 hover:bg-dark-700"
                    onClick={() => setShowAccountMenu(false)}
                  >
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setShowAccountMenu(false)
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-dark-700"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-dark-800"
          >
            {showMobileMenu ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {showMobileMenu && (
        <div className="md:hidden bg-dark-800 border-t border-dark-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-base font-medium
                    ${location.pathname === item.href
                      ? 'text-white bg-dark-700'
                      : 'text-gray-400 hover:text-white hover:bg-dark-700'
                    }`}
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
            <Link
              to="/account"
              className="flex items-center px-3 py-2 rounded-lg text-base font-medium text-gray-400 
                       hover:text-white hover:bg-dark-700"
              onClick={() => setShowMobileMenu(false)}
            >
              <UserCircleIcon className="w-5 h-5 mr-3" />
              Profile Settings
            </Link>
            <button
              onClick={() => {
                handleLogout()
                setShowMobileMenu(false)
              }}
              className="flex items-center w-full px-3 py-2 rounded-lg text-base font-medium text-gray-400 
                       hover:text-white hover:bg-dark-700"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
} 