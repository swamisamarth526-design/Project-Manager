import { useState } from 'react'
import useProjects from '../hooks/useProjects'
import ProjectCard from '../components/ProjectCard'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']

const defaultForm = { name: '', description: '', color: '#6366f1', dueDate: '', status: 'active' }

function ProjectModal({ isOpen, onClose, onSubmit, project }) {
  const [form, setForm]       = useState(project ? { ...project, dueDate: project.dueDate ? project.dueDate.slice(0,10) : '' } : defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  if (!isOpen) return null
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Project name is required'); return }
    setLoading(true); setError('')
    try {
      await onSubmit(form)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg text-white">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 p-1">✕</button>
        </div>

        {error && <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Project Name *</label>
            <input name="name" value={form.name} onChange={handleChange} className="input" placeholder="My Awesome Project" required />
          </div>
          <div>
            <label className="input-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} className="input resize-none" rows={2} placeholder="What's this project about?" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Color</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {COLORS.map(c => (
                  <button key={c} type="button"
                    onClick={() => setForm(f => ({ ...f, color: c }))}
                    className={`w-7 h-7 rounded-full transition-all duration-150 ${form.color === c ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'hover:scale-105'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="input-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Due Date</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="input" />
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : project ? 'Save' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function Projects() {
  const { projects, loading, error, createProject, updateProject, deleteProject } = useProjects()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing]     = useState(null)
  const [search, setSearch]       = useState('')
  const [filterStatus, setFilter] = useState('all')

  const handleCreate = async (form) => { await createProject(form) }
  const handleUpdate = async (form) => { await updateProject(editing._id, form) }
  const handleDelete = async (id) => {
    if (window.confirm('Delete this project and all its tasks?')) await deleteProject(id)
  }

  const filtered = projects.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Projects</h1>
          <p className="text-slate-500 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary">
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/></svg>
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          className="input sm:max-w-xs" placeholder="Search projects..." />
        <div className="flex gap-2">
          {['all','active','completed','archived'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${filterStatus === s ? 'bg-brand-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-44 animate-pulse bg-slate-800/40" />)}
        </div>
      ) : error ? (
        <div className="text-red-400 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/60 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 0 1 4.5 9.75h15A2.25 2.25 0 0 1 21.75 12v.75m-8.69-6.44-2.12-2.12a1.5 1.5 0 0 0-1.061-.44H4.5A2.25 2.25 0 0 0 2.25 6v12a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9a2.25 2.25 0 0 0-2.25-2.25h-5.379a1.5 1.5 0 0 1-1.06-.44Z"/>
            </svg>
          </div>
          <p className="text-slate-500 mb-4">{search ? 'No projects match your search' : 'No projects yet'}</p>
          {!search && (
            <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary">
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProjectCard key={p._id} project={p}
              onEdit={proj => { setEditing(proj); setModalOpen(true) }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ProjectModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null) }}
        onSubmit={editing ? handleUpdate : handleCreate}
        project={editing}
      />
    </div>
  )
}
