import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const useTasks = (projectId = null) => {
  const [tasks, setTasks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = projectId ? { projectId } : {}
      const { data } = await api.get('/tasks', { params })
      setTasks(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const createTask = async (formData) => {
    // formData is a FormData object (supports file uploads)
    const { data } = await api.post('/tasks', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    setTasks((prev) => [data.data, ...prev])
    return data.data
  }

  const updateTask = async (id, formData) => {
    const isFormData = formData instanceof FormData
    const { data } = await api.put(`/tasks/${id}`, formData, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : {},
    })
    setTasks((prev) => prev.map((t) => (t._id === id ? data.data : t)))
    return data.data
  }

  const updateTaskStatus = async (id, status) => {
    const { data } = await api.patch(`/tasks/${id}/status`, { status })
    setTasks((prev) => prev.map((t) => (t._id === id ? data.data : t)))
    return data.data
  }

  const deleteTask = async (id) => {
    await api.delete(`/tasks/${id}`)
    setTasks((prev) => prev.filter((t) => t._id !== id))
  }

  return { tasks, loading, error, fetchTasks, createTask, updateTask, updateTaskStatus, deleteTask }
}

export default useTasks
