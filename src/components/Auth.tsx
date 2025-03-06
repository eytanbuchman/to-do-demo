import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export const Auth = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [isResetMode, setIsResetMode] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log('Attempting to sign in with:', email)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      console.log('Sign in successful')
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error('Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log('Attempting to sign up with:', email)
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) throw error
      console.log('Sign up successful')
      toast.success('Check your email to confirm your account!')
    } catch (error) {
      console.error('Error signing up:', error)
      toast.error('Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log('Attempting to reset password for:', email)
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/#recovery',
      })
      if (error) throw error
      console.log('Password reset email sent')
      toast.success('Check your email for the password reset link!')
      setIsResetMode(false)
    } catch (error) {
      console.error('Error resetting password:', error)
      toast.error('Failed to send reset password email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-900 p-8 rounded-lg shadow-2xl border border-dark-700">
      <div className="space-y-6">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white mb-2">
            {isResetMode ? 'Reset Password' : 'Welcome to TaskRebel'}
          </h2>
          <p className="text-center text-gray-400">
            {isResetMode 
              ? 'Enter your email to receive reset instructions'
              : 'Join the rebellion against boring todo lists'}
          </p>
        </div>

        <form className="space-y-6" onSubmit={isResetMode ? handleResetPassword : handleSignIn}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="block text-sm font-medium text-gray-300">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border 
                         border-dark-700 bg-dark-800 text-white placeholder-dark-400 
                         focus:outline-none focus:ring-2 focus:ring-rebel-red focus:border-transparent
                         transition-colors duration-200"
                placeholder="rebel@example.com"
              />
            </div>

            {!isResetMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 appearance-none rounded-lg relative block w-full px-3 py-2 border 
                           border-dark-700 bg-dark-800 text-white placeholder-dark-400 
                           focus:outline-none focus:ring-2 focus:ring-rebel-red focus:border-transparent
                           transition-colors duration-200"
                  placeholder="••••••••"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <button
                type="button"
                onClick={() => setIsResetMode(!isResetMode)}
                className="font-medium text-rebel-red hover:text-rebel-red-light transition-colors duration-200"
              >
                {isResetMode ? 'Back to sign in' : 'Forgot your password?'}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {!isResetMode && (
              <>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                           text-sm font-medium rounded-lg text-white bg-rebel-red hover:bg-rebel-red-light 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rebel-red 
                           disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>

                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border-2 border-rebel-red 
                           text-sm font-medium rounded-lg text-white hover:bg-rebel-red/10 
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rebel-red 
                           disabled:opacity-50 transition-colors duration-200"
                >
                  {loading ? 'Creating account...' : 'Create account'}
                </button>
              </>
            )}

            {isResetMode && (
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                         text-sm font-medium rounded-lg text-white bg-rebel-red hover:bg-rebel-red-light 
                         focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rebel-red 
                         disabled:opacity-50 transition-colors duration-200"
              >
                {loading ? 'Sending...' : 'Send reset instructions'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
} 