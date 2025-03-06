import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

interface Profile {
  id: string
  first_name: string
  last_name: string
  username: string
  email: string
  avatar_url: string | null
  bio: string | null
  website: string | null
  timezone: string | null
  theme: string | null
  notification_preferences: {
    email: boolean
    push: boolean
  }
  updated_at: string
}

export const Account = () => {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    getProfile()
  }, [])

  const getProfile = async () => {
    try {
      setLoading(true)
      console.log('Fetching profile...')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) throw error
      console.log('Profile data:', data)
      
      if (data) {
        setProfile({
          ...data,
          notification_preferences: data.notification_preferences || { email: false, push: false }
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log('Updating profile with:', profile)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No user found')

      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date().toISOString(),
      }

      const { error } = await supabase
        .from('profiles')
        .upsert(updates)

      if (error) throw error
      console.log('Profile updated successfully')
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error('Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rebel-red"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Profile Settings</h1>
        
        <form onSubmit={updateProfile} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name
              </label>
              <input
                type="text"
                value={profile?.first_name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, first_name: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-rebel-red focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <input
                type="text"
                value={profile?.last_name || ''}
                onChange={(e) => setProfile(prev => ({ ...prev!, last_name: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                         focus:ring-2 focus:ring-rebel-red focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={profile?.username || ''}
              onChange={(e) => setProfile(prev => ({ ...prev!, username: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                       focus:ring-2 focus:ring-rebel-red focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={profile?.bio || ''}
              onChange={(e) => setProfile(prev => ({ ...prev!, bio: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                       focus:ring-2 focus:ring-rebel-red focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Website
            </label>
            <input
              type="url"
              value={profile?.website || ''}
              onChange={(e) => setProfile(prev => ({ ...prev!, website: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                       focus:ring-2 focus:ring-rebel-red focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Timezone
            </label>
            <select
              value={profile?.timezone || ''}
              onChange={(e) => setProfile(prev => ({ ...prev!, timezone: e.target.value }))}
              className="w-full px-3 py-2 bg-dark-800 border border-dark-700 rounded-lg text-white 
                       focus:ring-2 focus:ring-rebel-red focus:border-transparent"
            >
              <option value="">Select timezone</option>
              {Intl.supportedValuesOf('timeZone').map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-lg font-medium text-white mb-4">Notification Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile?.notification_preferences?.email || false}
                  onChange={(e) => setProfile(prev => ({
                    ...prev!,
                    notification_preferences: {
                      ...prev!.notification_preferences,
                      email: e.target.checked
                    }
                  }))}
                  className="form-checkbox h-4 w-4 text-rebel-red border-dark-700 rounded 
                           focus:ring-rebel-red focus:ring-offset-dark-900"
                />
                <span className="ml-2 text-gray-300">Email notifications</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={profile?.notification_preferences?.push || false}
                  onChange={(e) => setProfile(prev => ({
                    ...prev!,
                    notification_preferences: {
                      ...prev!.notification_preferences,
                      push: e.target.checked
                    }
                  }))}
                  className="form-checkbox h-4 w-4 text-rebel-red border-dark-700 rounded 
                           focus:ring-rebel-red focus:ring-offset-dark-900"
                />
                <span className="ml-2 text-gray-300">Push notifications</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-rebel-red text-white rounded-lg hover:bg-rebel-red-light 
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rebel-red 
                       disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Account 