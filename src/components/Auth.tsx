import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { XMarkIcon, ArrowLeftIcon, EnvelopeIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { SignInWithPasswordCredentials } from '@supabase/supabase-js'

type AuthMode = 'signin' | 'signup' | 'reset' | 'confirmation'

interface AuthProps {
  onClose: () => void
}

export const Auth: React.FC<AuthProps> = ({ onClose }) => {
  const { signIn, signUp, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<AuthMode>('signin')
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const navigate = useNavigate()

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log('Attempting to sign in with:', email)
      await signIn(email, password)
      onClose()
    } catch (error: any) {
      console.error('Error signing in:', error)
      toast.error(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    try {
      setLoading(true)
      console.log('Attempting to sign up with:', email)
      await signUp(email, password)
      setConfirmationMessage('Account created! Please check your email to verify your account.')
      setMode('confirmation')
    } catch (error: any) {
      console.error('Error signing up:', error)
      toast.error(error.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      console.log('Attempting to reset password for:', email)
      await resetPassword(email)
      setConfirmationMessage('Password reset instructions have been sent to your email.')
      setMode('confirmation')
    } catch (error: any) {
      console.error('Error resetting password:', error)
      toast.error(error.message || 'Failed to send reset instructions')
    } finally {
      setLoading(false)
    }
  }

  const handleSignInWithPassword = async (credentials: SignInWithPasswordCredentials) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) throw error;
      
      // Check if profile exists
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        // If no profile or profile is incomplete, redirect to profile setup
        if (!profile || !profile.first_name) {
          navigate('/account', { state: { newUser: true } });
        } else {
          navigate('/tasks');
        }
      }
      
      onClose();
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 }
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={mode}
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={modalVariants}
          transition={{ type: "spring", duration: 0.5 }}
          className="bg-dark-900 rounded-xl shadow-2xl border border-dark-700 w-full max-w-md 
                   overflow-hidden relative"
        >
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-rebel-red to-rebel-red-light">
            <div className="absolute inset-0 bg-dark-900/20"></div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white 
                       transition-colors duration-200"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            {mode !== 'confirmation' && mode !== 'signin' && (
              <button
                onClick={() => setMode('signin')}
                className="absolute top-4 left-4 text-white/80 hover:text-white 
                         transition-colors duration-200 flex items-center"
              >
                <ArrowLeftIcon className="w-5 h-5 mr-1" />
                <span>Back</span>
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-8 -mt-8">
            <div className="bg-dark-800/50 backdrop-blur-sm rounded-xl p-6 border border-dark-700">
              {mode === 'confirmation' ? (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-rebel-red/20 mb-4">
                    <CheckCircleIcon className="w-8 h-8 text-rebel-red" />
                  </div>
                  <h2 className="text-xl font-bold text-white mb-2">Success!</h2>
                  <p className="text-gray-400 mb-6">{confirmationMessage}</p>
                  <button
                    onClick={() => setMode('signin')}
                    className="w-full px-4 py-2 bg-rebel-red text-white rounded-lg 
                             hover:bg-rebel-red-light transition-colors duration-200"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-white mb-2 text-center">
                    {mode === 'signin' ? 'Welcome Back, Rebel' :
                     mode === 'signup' ? 'Join the Rebellion' :
                     'Reset Your Password'}
                  </h2>
                  <p className="text-gray-400 text-center mb-6">
                    {mode === 'signin' ? 'Sign in to continue your mission' :
                     mode === 'signup' ? 'Create your account to start organizing chaos' :
                     'Enter your email to receive reset instructions'}
                  </p>

                  <form onSubmit={mode === 'signin' ? handleSignIn : 
                                mode === 'signup' ? handleSignUp : 
                                handleResetPassword}
                        className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-2 bg-dark-800 border border-dark-700 
                                   rounded-lg text-white placeholder-gray-400
                                   focus:ring-2 focus:ring-rebel-red focus:border-transparent
                                   transition-colors duration-200"
                          placeholder="rebel@example.com"
                          required
                        />
                      </div>
                    </div>

                    {(mode === 'signin' || mode === 'signup') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-dark-800 border border-dark-700 
                                     rounded-lg text-white placeholder-gray-400
                                     focus:ring-2 focus:ring-rebel-red focus:border-transparent
                                     transition-colors duration-200"
                            placeholder="••••••••"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                    )}

                    {mode === 'signup' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <LockClosedIcon className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 bg-dark-800 border border-dark-700 
                                     rounded-lg text-white placeholder-gray-400
                                     focus:ring-2 focus:ring-rebel-red focus:border-transparent
                                     transition-colors duration-200"
                            placeholder="••••••••"
                            required
                            minLength={6}
                          />
                        </div>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-4 py-3 bg-rebel-red text-white font-semibold rounded-lg 
                               hover:bg-rebel-red-light shadow-lg hover:shadow-rebel-red/20 
                               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rebel-red 
                               disabled:opacity-50 transition-all duration-300 
                               hover:transform hover:-translate-y-1"
                    >
                      {loading ? 
                        (mode === 'signin' ? 'Signing in...' :
                         mode === 'signup' ? 'Creating account...' :
                         'Sending...') :
                        (mode === 'signin' ? 'Sign in' :
                         mode === 'signup' ? 'Create account' :
                         'Send reset instructions')}
                    </button>

                    {mode === 'signin' && (
                      <div className="flex flex-col space-y-4 mt-6 text-center">
                        <button
                          type="button"
                          onClick={() => setMode('reset')}
                          className="text-sm text-gray-400 hover:text-white transition-colors duration-200"
                        >
                          Forgot your password?
                        </button>
                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-dark-700"></div>
                          </div>
                          <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-dark-900 text-gray-400">or</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMode('signup')}
                          className="text-sm font-medium text-rebel-red hover:text-rebel-red-light 
                                   transition-colors duration-200"
                        >
                          Create a new account
                        </button>
                      </div>
                    )}
                  </form>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
} 