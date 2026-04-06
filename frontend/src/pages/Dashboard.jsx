import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StatsCard from '../components/StatsCard'
import api from '../api/axios'

const CheckIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"/>
  </svg>
)
const ClockIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z"/>
  </svg>
)
const FolderIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path d="M3.75 3A1.75 1.75 0 0 0 2 4.75v3.26a3.235 3.235 0 0 1 1.75-.51h12.5c.644 0 1.245.188 1.75.51V6.75A1.75 1.75 0 0 0 16.25 5h-4.836a.25.25 0 0 1-.177-.073L9.823 3.513A1.75 1.75 0 0 0 8.586 3H3.75Z"/>
    <path d="M3.75 9A1.75 1.75 0 0 0 2 10.75v4.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 15.25v-4.5A1.75 1.75 0 0 0 16.25 9H3.75Z"/>
  </svg>
)
const AlertIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
  </svg>
)

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/dashboard/stats')
        setStats(data.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load stats')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  if (loading) return (
    <div className="page-wrapper">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card h-28 animate-pulse bg-slate-800/40" />
        ))}
      </div>
    </div>
  )

  const ov = stats?.overview || {}
  const pri = stats?.priorityBreakdown || {}
  const projects = stats?.projectBreakdown || []
  const activity = stats?.recentActivity || []

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-white">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-gradient">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-slate-500 text-sm mt-1">Here's what's happening across your projects</p>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard label="Total Projects" value={ov.totalProjects ?? 0} icon={<FolderIcon />} color="brand" />
        <StatsCard label="Completed Tasks" value={ov.completedTasks ?? 0} icon={<CheckIcon />} color="emerald" />
        <StatsCard label="In Progress" value={ov.inProgressTasks ?? 0} icon={<ClockIcon />} color="blue" />
        <StatsCard label="Overdue" value={ov.overdueTasks ?? 0} icon={<AlertIcon />} color={ov.overdueTasks > 0 ? 'red' : 'slate'} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Priority breakdown */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-slate-100 mb-5">Tasks by Priority</h2>
          <div className="space-y-4">
            {[
              { key: 'high',   label: 'High',   color: 'bg-red-500',   bg: 'bg-red-500/10' },
              { key: 'medium', label: 'Medium',  color: 'bg-amber-500', bg: 'bg-amber-500/10' },
              { key: 'low',    label: 'Low',     color: 'bg-slate-500', bg: 'bg-slate-700/40' },
            ].map(({ key, label, color, bg }) => {
              const count = pri[key] || 0
              const total = ov.totalTasks || 1
              const pct   = Math.round((count / total) * 100)
              return (
                <div key={key}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400">{label}</span>
                    <span className="text-slate-300 font-medium">{count}</span>
                  </div>
                  <div className={`h-2 ${bg} rounded-full overflow-hidden`}>
                    <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Project completion */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-slate-100">Project Progress</h2>
            <Link to="/projects" className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
              View all →
            </Link>
          </div>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-600 text-sm">No projects yet</p>
              <Link to="/projects" className="text-brand-400 text-xs mt-2 inline-block hover:text-brand-300">
                Create your first project →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {projects.slice(0, 5).map(p => (
                <div key={p._id}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-slate-400 truncate flex-1">{p.projectName}</span>
                    <span className="text-slate-300 font-medium ml-2">{Math.round(p.completionRate)}%</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${p.completionRate}%`, backgroundColor: p.projectColor }}
                    />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{p.done}/{p.total} tasks done</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        {activity.length > 0 && (
          <div className="card p-6 md:col-span-2">
            <h2 className="font-display font-semibold text-slate-100 mb-5">Tasks Created (Last 7 Days)</h2>
            <div className="flex items-end gap-2 h-20">
              {activity.map(a => {
                const max = Math.max(...activity.map(x => x.count))
                const pct = (a.count / max) * 100
                return (
                  <div key={a._id} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-slate-500">{a.count}</span>
                    <div className="w-full bg-slate-800 rounded-t-sm" style={{ height: '48px' }}>
                      <div
                        className="w-full bg-brand-600 rounded-t-sm transition-all duration-700"
                        style={{ height: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-600">
                      {new Date(a._id).toLocaleDateString('en-IN', { weekday: 'short' })}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
