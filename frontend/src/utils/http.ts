import axios from 'axios'
import { useAuth } from '@clerk/vue'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333',
})

// Interceptor para adicionar token de autenticação
http.interceptors.request.use(async (config) => {
  // Verifica se é uma rota que precisa de autenticação
  const publicRoutes = ['/health', '/api/projects', '/api/projects/', '/api/projects/']
  const isPublicRoute = publicRoutes.some(route => {
    if (route.endsWith('/')) {
      return config.url?.startsWith(route)
    }
    return config.url === route
  })

  // Se não for rota pública, adiciona o token
  if (!isPublicRoute && config.url?.includes('/api/')) {
    try {
      const { getToken } = useAuth()
      const token = await getToken()
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.warn('Failed to get auth token:', error)
    }
  }

  return config
})

// Interceptor para tratar erros de resposta
http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redireciona para login se não autenticado
      window.location.href = '/auth/sign-in'
    }
    return Promise.reject(error instanceof Error ? error : new Error(String(error)))
  }
)
