import { useAuth } from '../context/AuthContext'

const Header = () => {
  const { user, signOut } = useAuth()

  if (!user) return null

  return (
    <header className="bg-dark-900 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-rebel-red hover:text-rebel-red-light transition-colors">
          TaskRebel
        </a>
        <nav className="flex gap-4">
          <a href="/categories" className="text-white hover:text-rebel-red transition-colors">Categories</a>
          <button onClick={signOut} className="text-white hover:text-rebel-red transition-colors">
            Sign Out
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Header 