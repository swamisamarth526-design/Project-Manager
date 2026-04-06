import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <div className="text-center animate-fade-in">
        <p className="font-display text-8xl font-bold text-gradient mb-4">404</p>
        <h1 className="font-display text-2xl font-semibold text-white mb-3">Page not found</h1>
        <p className="text-slate-500 text-sm mb-8 max-w-xs mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/dashboard" className="btn-primary">
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
