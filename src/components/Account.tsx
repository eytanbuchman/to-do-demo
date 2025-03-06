import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

interface Profile {
  first_name: string
  last_name: string
  username: string
  email: string
  avatar_url: string
  bio: string
  website: string
  timezone: string
  theme: 'dark' | 'light'
  notification_preferences: {
    email: boolean
    push: boolean
  }
}

export const Account = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<Profile>({
    first_name: '',
    last_name: '',
    username: '',
    email: user?.email || '',
    avatar_url: '',
    bio: '',
    website: '',
    timezone: 'UTC',
    theme: 'dark',
    notification_preferences: {
      email: true,
      push: false
    }
  })

  useEffect(() => {
    if (user) getProfile()
  }, [user])

  const getProfile = async () => {
    try {
      setLoading(true)
      console.log('Fetching profile for user:', user?.id)

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single()

      if (error) throw error

      console.log('Profile data:', data)
      setProfile({
        ...profile,
        ...data,
        email: user?.email || ''
      })
    } catch (error) {
      console.error('Error loading profile:', error)
      toast.error('Error loading profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    try {
      setLoading(true)
      console.log('Updating profile for user:', user?.id)

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          ...profile,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      toast.success('Profile updated successfully!')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Error updating profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProfile(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleNotificationChange = (type: 'email' | 'push') => {
    setProfile(prev => ({
      ...prev,
      notification_preferences: {
        ...prev.notification_preferences,
        [type]: !prev.notification_preferences[type]
      }
    }))
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-dark-800 rounded-lg p-6 space-y-6">
        <h2 className="text-2xl font-bold text-white">Account Settings</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1">
                First Name
              </label>
              <input
                type="text"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-400 mb-1">
                Last Name
              </label>
              <input
                type="text"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1">
              Username
            </label>
            <input
              type="text"
              name="username"
              value={profile.username}
              onChange={handleChange}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              rows={3}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1">
              Website
            </label>
            <input
              type="url"
              name="website"
              value={profile.website}
              onChange={handleChange}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              name="avatar_url"
              value={profile.avatar_url}
              onChange={handleChange}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-1">
              Timezone
            </label>
            <select
              name="timezone"
              value={profile.timezone}
              onChange={handleChange}
              className="w-full bg-dark-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-rebel-red"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Notification Preferences
            </label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.notification_preferences.email}
                  onChange={() => handleNotificationChange('email')}
                  className="bg-dark-700 text-rebel-red rounded focus:ring-rebel-red mr-2"
                />
                <span className="text-white">Email Notifications</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile.notification_preferences.push}
                  onChange={() => handleNotificationChange('push')}
                  className="bg-dark-700 text-rebel-red rounded focus:ring-rebel-red mr-2"
                />
                <span className="text-white">Push Notifications</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={updateProfile}
            disabled={loading}
            className="bg-rebel-red hover:bg-rebel-red-light text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Account 