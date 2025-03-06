import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ListBulletIcon,
  TagIcon,
  ChartBarIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline'

export const Header = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Tasks', href: '/tasks', icon: ListBulletIcon },
    { name: 'Categories', href: '/categories', icon: TagIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Account', href: '/account', icon: UserCircleIcon },
  ]

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
          </nav>
        </div>
      </div>
    </header>
  )
} 