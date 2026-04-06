import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

// ── Request interceptor: attach JWT token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tf_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired — clear storage and redirect
      localStorage.removeItem('tf_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
