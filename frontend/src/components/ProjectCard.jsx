import { useNavigate } from 'react-router-dom'

const statusLabel = { active: 'Active', completed: 'Completed', archived: 'Archived' }
const statusStyle = {
  active:    'bg-emerald-500/10 text-emerald-400',
  completed: 'bg-blue-500/10 text-blue-400',
  archived:  'bg-slate-700/40 text-slate-500',
}

export default function ProjectCard({ project, onEdit, onDelete }) {
  const navigate = useNavigate()
  const progress = project.taskCount > 0
    ? Math.round((project.doneCount / project.taskCount) * 100)
    : 0

  return (
    <div
      className="card-hover p-5 group animate-fade-in"
      onClick={() => navigate(`/projects/${project._id}`)}
    >
      {/* Color bar */}
      <div
        className="h-1 w-12 rounded-full mb-4 transition-all duration-300 group-hover:w-20"
        style={{ backgroundColor: project.color }}
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-slate-100 text-base leading-tight truncate">
            {project.name}
          </h3>
          {project.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">{project.description}</p>
          )}
        </div>
        <span className={`badge text-xs flex-shrink-0 ${statusStyle[project.status]}`}>
          {statusLabel[project.status]}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-slate-500">{project.doneCount}/{project.taskCount} tasks done</span>
          <span className="text-xs font-medium text-slate-400">{progress}%</span>
        </div>
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%`, backgroundColor: project.color }}
          />
        </div>
      </div>

      {/* Due date + actions */}
      <div className="mt-4 flex items-center justify-between">
        {project.dueDate ? (
          <span className="text-xs text-slate-500">
            Due {new Date(project.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </span>
        ) : <span />}

        <div
          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(project)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-all"
            title="Edit"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11.013 1.427a1.75 1.75 0 0 1 2.474 0l1.086 1.086a1.75 1.75 0 0 1 0 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 0 1-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.609Z"/>
            </svg>
          </button>
          <button
            onClick={() => onDelete(project._id)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M11 1.75V3h2.25a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75ZM4.496 6.675l.66 6.6a.25.25 0 0 0 .249.225h5.19a.25.25 0 0 0 .249-.225l.66-6.6a.75.75 0 0 1 1.492.149l-.66 6.6A1.748 1.748 0 0 1 10.595 15h-5.19a1.75 1.75 0 0 1-1.741-1.575l-.66-6.6a.75.75 0 1 1 1.492-.15Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
