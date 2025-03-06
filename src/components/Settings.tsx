import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  UserCircleIcon,
  BellIcon,
  SwatchIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface SettingsSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, icon, children }) => (
  <div className="bg-dark-800 rounded-lg p-6 mb-6">
    <div className="flex items-center space-x-2 mb-4">
      <div className="text-dark-400">{icon}</div>
      <h2 className="text-lg font-medium text-white">{title}</h2>
    </div>
    {children}
  </div>
);

export const Settings: React.FC = () => {
  const { user, signOut } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    dueDates: true,
  });
  const [theme, setTheme] = useState('dark');

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-2xl font-bold text-white mb-6">Settings</h1>

      <SettingsSection title="Profile" icon={<UserCircleIcon />}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1">Email</label>
            <p className="text-white">{user?.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1">Member Since</label>
            <p className="text-white">{new Date(user?.created_at || '').toLocaleDateString()}</p>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Notifications" icon={<BellIcon />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-dark-400">Email Notifications</label>
            <input
              type="checkbox"
              checked={notifications.email}
              onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
              className="toggle"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-dark-400">Push Notifications</label>
            <input
              type="checkbox"
              checked={notifications.push}
              onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
              className="toggle"
            />
          </div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-dark-400">Due Date Reminders</label>
            <input
              type="checkbox"
              checked={notifications.dueDates}
              onChange={(e) => setNotifications({ ...notifications, dueDates: e.target.checked })}
              className="toggle"
            />
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Appearance" icon={<SwatchIcon />}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full bg-dark-700 border border-dark-600 rounded-lg px-3 py-2 text-white"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>
      </SettingsSection>

      <button
        onClick={handleLogout}
        className="flex items-center space-x-2 px-6 py-3 bg-dark-800 text-red-400 rounded-lg
                 hover:bg-dark-700 transition-all duration-200"
      >
        <ArrowRightOnRectangleIcon className="w-5 h-5" />
        <span>Log Out</span>
      </button>
    </div>
  );
}; 