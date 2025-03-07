import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export const ResetPassword = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Check if we have a recovery token in the URL
    const params = new URLSearchParams(window.location.hash.substring(1))
    const token = params.get('token')
    const type = params.get('type')
    
    if (token && type === 'recovery') {
      // Set the recovery token
      supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      }).then(({ error }) => {
        if (error) {
          console.error('Error verifying recovery token:', error)
          toast.error('Invalid or expired reset link')
          // Redirect to home after a short delay
          setTimeout(() => {
            window.location.href = '/'
          }, 2000)
        }
      })
    } else {
      console.error('No recovery token found in URL')
      toast.error('Invalid reset link')
      // Redirect to home after a short delay
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    }
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.updateUser({ 
        password: password 
      })

      if (error) throw error

      toast.success('Password updated successfully!')
      // Redirect to login after successful password reset
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast.error(error.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Enter your new password below
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleReset}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-rebel-red focus:border-transparent"
                placeholder="New password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm New Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none rounded-lg relative block w-full px-3 py-2 border border-dark-700 bg-dark-800 text-white placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-rebel-red focus:border-transparent"
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-rebel-red hover:bg-rebel-red-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rebel-red disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 