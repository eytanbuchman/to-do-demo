import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'react-hot-toast'

export const AuthCallback = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) throw error
        
        if (session) {
          // Successfully signed in, redirect to dashboard
          navigate('/')
          toast.success('Successfully signed in!')
        } else {
          // No session, redirect to login
          navigate('/login')
          toast.error('Failed to sign in')
        }
      } catch (error) {
        console.error('Error handling auth callback:', error)
        navigate('/login')
        toast.error('Failed to sign in')
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rebel-red"></div>
    </div>
  )
} 