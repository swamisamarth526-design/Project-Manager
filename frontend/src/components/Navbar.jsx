import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NavLink = ({ to, children }) => {
  const { pathname } = useLocation()
  const active = pathname === to || pathname.startsWith(to + '/')
  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
        active
          ? 'bg-brand-600/20 text-brand-400'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
      }`}
    >
      {children}
    </Link>
  )
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-900/40">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M3 5h12M3 9h8M3 13h5" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-display text-lg font-700 text-white tracking-tight">TaskFlow</span>
        </Link>

        {/* Nav links + user */}
        {user ? (
          <div className="flex items-center gap-2">
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/projects">Projects</NavLink>

            <div className="ml-3 pl-3 border-l border-slate-800 flex items-center gap-3">
              <span className="text-xs text-slate-500 hidden sm:block">
                {user.name}
              </span>
              <div className="w-8 h-8 rounded-full bg-brand-600/30 border border-brand-500/30 flex items-center justify-center text-sm font-semibold text-brand-300">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <button
                onClick={handleLogout}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-secondary text-sm py-1.5 px-4">Login</Link>
            <Link to="/register" className="btn-primary text-sm py-1.5 px-4">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  )
}
