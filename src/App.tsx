import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { supabase } from './lib/supabase'
import { Header } from './components/Header'
import { TaskList } from './components/TaskList'
import { Categories } from './components/Categories'
import { Analytics } from './components/Analytics'
import { Account } from './components/Account'
import { LandingPage } from './components/LandingPage'
import { ResetPassword } from './components/ResetPassword'

function App() {
  const [session, setSession] = useState<any>(null)
  const [isResetFlow, setIsResetFlow] = useState(false)

  useEffect(() => {
    // Check for password reset flow
    console.log('Checking for reset flow:', window.location.hash)
    if (window.location.hash.includes('#recovery=')) {
      setIsResetFlow(true)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (isResetFlow) {
    return <ResetPassword />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-950 text-white">
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1a1a',
              color: '#fff',
              border: '1px solid #333',
            },
          }}
        />
        
        {session ? (
          <>
            <Header />
            <main>
              <Routes>
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/account" element={<Account />} />
                <Route path="/" element={<Navigate to="/tasks" replace />} />
              </Routes>
            </main>
          </>
        ) : (
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        )}
      </div>
    </BrowserRouter>
  )
}

export default App
