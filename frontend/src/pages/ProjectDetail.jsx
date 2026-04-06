import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../api/axios'
import useTasks from '../hooks/useTasks'
import TaskCard from '../components/TaskCard'
import TaskModal from '../components/TaskModal'

const statusCols = [
  { key: 'todo',        label: 'To Do',       accent: 'border-slate-600' },
  { key: 'in-progress', label: 'In Progress',  accent: 'border-blue-500' },
  { key: 'done',        label: 'Done',         accent: 'border-emerald-500' },
]

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [project, setProject]     = useState(null)
  const [projLoading, setProjLoad] = useState(true)
  const [projError, setProjError] = useState(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTask, setEditTask] = useState(null)
  const [filterPri, setFilterPri] = useState('all')

  const { tasks, loading: tasksLoading, createTask, updateTask, updateTaskStatus, deleteTask } = useTasks(id)

  // Fetch project details
  useEffect(() => {
    const fetchProject = async () => {
      setProjLoad(true)
      try {
        const { data } = await api.get(`/projects/${id}`)
        setProject(data.data)
      } catch (err) {
        if (err.response?.status === 404) navigate('/projects')
        else setProjError(err.response?.data?.message || 'Failed to load project')
      } finally {
        setProjLoad(false)
      }
    }
    fetchProject()
  }, [id, navigate])

  const handleCreateTask = async (fd) => {
    await createTask(fd)
    setModalOpen(false)
  }

  const handleUpdateTask = async (fd) => {
    await updateTask(editingTask._id, fd)
    setEditTask(null)
  }

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Delete this task?')) await deleteTask(taskId)
  }

  const filteredTasks = tasks.filter(t => filterPri === 'all' || t.priority === filterPri)

  const tasksByStatus = (status) => filteredTasks.filter(t => t.status === status)

  if (projLoading) return (
    <div className="page-wrapper">
      <div className="h-8 w-48 bg-slate-800/60 rounded-lg animate-pulse mb-8" />
      <div className="grid md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <div key={i} className="card h-64 animate-pulse bg-slate-800/40" />)}
      </div>
    </div>
  )

  if (projError) return (
    <div className="page-wrapper">
      <p className="text-red-400">{projError}</p>
      <Link to="/projects" className="text-brand-400 text-sm mt-2 inline-block">← Back to Projects</Link>
    </div>
  )

  const totalTasks   = tasks.length
  const doneTasks    = tasks.filter(t => t.status === 'done').length
  const progress     = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0

  return (
    <div className="page-wrapper animate-fade-in">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <Link to="/projects" className="hover:text-slate-300 transition-colors">Projects</Link>
        <span>/</span>
        <span className="text-slate-300">{project?.name}</span>
      </div>

      {/* Project header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex-shrink-0 shadow-lg"
            style={{ backgroundColor: project?.color }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="font-display text-xl font-bold text-white">{project?.name}</h1>
                {project?.description && (
                  <p className="text-slate-500 text-sm mt-1">{project.description}</p>
                )}
              </div>
              <button
                onClick={() => { setEditTask(null); setModalOpen(true) }}
                className="btn-primary flex-shrink-0"
              >
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/>
                </svg>
                Add Task
              </button>
            </div>

            {/* Progress */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-slate-500">{doneTasks} of {totalTasks} tasks completed</span>
                <span className="text-xs font-medium text-slate-400">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${progress}%`, backgroundColor: project?.color }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-xs text-slate-500 mr-1">Priority:</span>
        {['all', 'high', 'medium', 'low'].map(p => (
          <button
            key={p}
            onClick={() => setFilterPri(p)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
              filterPri === p
                ? 'bg-brand-600 text-white'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            {p === 'all' ? 'All' : p}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-600">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Kanban columns */}
      {tasksLoading ? (
        <div className="grid md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="card h-48 animate-pulse bg-slate-800/40" />)}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-4">
          {statusCols.map(col => {
            const colTasks = tasksByStatus(col.key)
            return (
              <div key={col.key} className="flex flex-col gap-3">
                {/* Column header */}
                <div className={`flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border-l-2 ${col.accent}`}>
                  <span className="text-sm font-medium text-slate-300">{col.label}</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks */}
                <div className="flex flex-col gap-3 min-h-[120px]">
                  {colTasks.length === 0 ? (
                    <div className="flex items-center justify-center h-20 rounded-xl border-2 border-dashed border-slate-800/60">
                      <span className="text-xs text-slate-700">No tasks</span>
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onStatusChange={updateTaskStatus}
                        onEdit={(t) => { setEditTask(t); setModalOpen(true) }}
                        onDelete={handleDeleteTask}
                      />
                    ))
                  )}
                </div>

                {/* Quick add shortcut */}
                {col.key === 'todo' && (
                  <button
                    onClick={() => { setEditTask(null); setModalOpen(true) }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-600 hover:text-slate-400 hover:bg-slate-800/40 text-xs transition-all"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M7.75 2a.75.75 0 0 1 .75.75V7h4.25a.75.75 0 0 1 0 1.5H8.5v4.25a.75.75 0 0 1-1.5 0V8.5H2.75a.75.75 0 0 1 0-1.5H7V2.75A.75.75 0 0 1 7.75 2Z"/>
                    </svg>
                    Add task
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Task Modal */}
      <TaskModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTask(null) }}
        onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
        task={editingTask}
        projectId={id}
      />
    </div>
  )
}
