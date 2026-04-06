import { useState, useEffect, useRef } from 'react'

const defaultForm = {
  title: '', description: '', status: 'todo', priority: 'medium', dueDate: '',
}

export default function TaskModal({ isOpen, onClose, onSubmit, task = null, projectId }) {
  const [form, setForm]       = useState(defaultForm)
  const [file, setFile]       = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const fileRef               = useRef()

  useEffect(() => {
    if (task) {
      setForm({
        title:       task.title || '',
        description: task.description || '',
        status:      task.status || 'todo',
        priority:    task.priority || 'medium',
        dueDate:     task.dueDate ? task.dueDate.slice(0, 10) : '',
      })
    } else {
      setForm(defaultForm)
    }
    setFile(null)
    setError('')
  }, [task, isOpen])

  if (!isOpen) return null

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    setLoading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('title', form.title.trim())
      fd.append('description', form.description)
      fd.append('status', form.status)
      fd.append('priority', form.priority)
      if (form.dueDate) fd.append('dueDate', form.dueDate)
      if (!task) fd.append('projectId', projectId)
      if (file) fd.append('attachment', file)
      await onSubmit(fd)
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-semibold text-lg text-white">
            {task ? 'Edit Task' : 'New Task'}
          </h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors p-1">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"/>
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="input-label">Title *</label>
            <input name="title" value={form.title} onChange={handleChange}
              className="input" placeholder="What needs to be done?" />
          </div>

          <div>
            <label className="input-label">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange}
              className="input resize-none" rows={3} placeholder="Add more details..." />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="input-label">Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="input">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
            <div>
              <label className="input-label">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange} className="input">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="input-label">Due Date</label>
            <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange} className="input" />
          </div>

          {/* File upload */}
          <div>
            <label className="input-label">Attachment (optional)</label>
            <div
              className="relative border-2 border-dashed border-slate-700 rounded-xl p-4 text-center cursor-pointer hover:border-brand-500/50 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={e => setFile(e.target.files[0])} />
              {file ? (
                <p className="text-sm text-brand-400">{file.name}</p>
              ) : task?.attachment?.originalName ? (
                <p className="text-xs text-slate-500">Current: {task.attachment.originalName} — click to replace</p>
              ) : (
                <div>
                  <svg className="w-6 h-6 text-slate-600 mx-auto mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 002.112 2.13"/>
                  </svg>
                  <p className="text-xs text-slate-500">Click to attach file (max 5MB)</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : task ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
