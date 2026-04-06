const priorityConfig = {
  low:    { label: 'Low',    cls: 'badge-low' },
  medium: { label: 'Medium', cls: 'badge-medium' },
  high:   { label: 'High',   cls: 'badge-high' },
}

const statusOptions = [
  { value: 'todo',        label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done',        label: 'Done' },
]

const statusCls = {
  'todo':        'badge-todo',
  'in-progress': 'badge-progress',
  'done':        'badge-done',
}

export default function TaskCard({ task, onStatusChange, onEdit, onDelete }) {
  const pri = priorityConfig[task.priority] || priorityConfig.medium
  const isDone = task.status === 'done'

  const handleStatusCycle = () => {
    const idx = statusOptions.findIndex(s => s.value === task.status)
    const next = statusOptions[(idx + 1) % statusOptions.length]
    onStatusChange(task._id, next.value)
  }

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone

  return (
    <div className={`card p-4 group animate-fade-in transition-all duration-200 ${isDone ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox */}
        <button
          onClick={handleStatusCycle}
          className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
            isDone
              ? 'bg-emerald-500 border-emerald-500'
              : task.status === 'in-progress'
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-600 hover:border-brand-500'
          }`}
          title="Click to cycle status"
        >
          {isDone && (
            <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {task.status === 'in-progress' && (
            <div className="w-2 h-2 rounded-sm bg-blue-500" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-100'}`}>
              {task.title}
            </h4>
            <div
              className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <button
                onClick={() => onEdit(task)}
                className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.609Z"/>
                </svg>
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15Z"/>
                </svg>
              </button>
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <span className={statusCls[task.status] + ' badge text-xs'}>{task.status === 'in-progress' ? 'In Progress' : task.status === 'todo' ? 'To Do' : 'Done'}</span>
            <span className={pri.cls}>{pri.label}</span>

            {task.dueDate && (
              <span className={`text-xs ${isOverdue ? 'text-red-400' : 'text-slate-500'}`}>
                {isOverdue ? '⚠ ' : ''}
                {new Date(task.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}

            {task.attachment?.originalName && (
              <a
                href={`http://localhost:5000${task.attachment.path}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8.878.392a1.75 1.75 0 0 0-1.756 0l-5.25 3.045A1.75 1.75 0 0 0 1 4.951v6.098c0 .624.332 1.2.872 1.514l5.25 3.045a1.75 1.75 0 0 0 1.756 0l5.25-3.045c.54-.313.872-.89.872-1.514V4.951c0-.624-.332-1.2-.872-1.514Z"/>
                </svg>
                {task.attachment.originalName}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
