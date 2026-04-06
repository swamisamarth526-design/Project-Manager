import { useState, useEffect, useCallback } from 'react'
import api from '../api/axios'

const useProjects = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)

  const fetchProjects = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.get('/projects')
      setProjects(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const createProject = async (payload) => {
    const { data } = await api.post('/projects', payload)
    setProjects((prev) => [data.data, ...prev])
    return data.data
  }

  const updateProject = async (id, payload) => {
    const { data } = await api.put(`/projects/${id}`, payload)
    setProjects((prev) => prev.map((p) => (p._id === id ? { ...p, ...data.data } : p)))
    return data.data
  }

  const deleteProject = async (id) => {
    await api.delete(`/projects/${id}`)
    setProjects((prev) => prev.filter((p) => p._id !== id))
  }

  return { projects, loading, error, fetchProjects, createProject, updateProject, deleteProject }
}

export default useProjects
