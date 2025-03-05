import React, { useState } from 'react';
import {
  HomeIcon,
  TagIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 w-full
                ${active 
                  ? 'bg-dark-800 text-white' 
                  : 'text-dark-400 hover:bg-dark-800/50 hover:text-white'}`}
  >
    <div className="w-5 h-5">{icon}</div>
    <span>{label}</span>
  </button>
);

export type NavigationTab = 'missions' | 'categories' | 'settings';

interface NavigationProps {
  activeTab: NavigationTab;
  onTabChange: (tab: NavigationTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const [showFilters, setShowFilters] = useState(false);

  if (!user) return null;

  return (
    <nav className="bg-dark-900 text-white p-4">
      <div className="container-custom">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold">
              <span className="text-primary-400">Task</span>
              <span className="text-secondary-400">Rebel</span>
            </h1>
          </div>

          {/* Navigation Items */}
          <div className="flex items-center space-x-4">
            <NavItem
              icon={<HomeIcon />}
              label="Missions"
              active={activeTab === 'missions'}
              onClick={() => onTabChange('missions')}
            />
            <NavItem
              icon={<TagIcon />}
              label="Categories"
              active={activeTab === 'categories'}
              onClick={() => onTabChange('categories')}
            />
            <NavItem
              icon={<Cog6ToothIcon />}
              label="Settings"
              active={activeTab === 'settings'}
              onClick={() => onTabChange('settings')}
            />
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                        ${showFilters 
                          ? 'bg-primary-500 text-white' 
                          : 'text-dark-400 hover:bg-dark-800/50 hover:text-white'}`}
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filter</span>
              <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 
                ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-dark-800 rounded-lg animate-slideDown">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Priority Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Priority</label>
                <select className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2">
                  <option value="">All Priorities</option>
                  <option value="LOW">Side Quest</option>
                  <option value="MEDIUM">Regular Mission</option>
                  <option value="HIGH">Critical Mission</option>
                  <option value="CRITICAL">Boss Battle</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Status</label>
                <select className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2">
                  <option value="">All Status</option>
                  <option value="active">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Date Filter */}
              <div>
                <label className="block text-sm font-medium text-dark-400 mb-2">Due Date</label>
                <select className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2">
                  <option value="">All Dates</option>
                  <option value="today">Due Today</option>
                  <option value="week">Due This Week</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}; 