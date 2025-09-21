import axios from 'axios'
import Cookies from 'js-cookie'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export const api = axios.create({
  baseURL: API_URL,
})

api.interceptors.request.use((config) => {
  const token = Cookies.get('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const auth = {
  api,
  
  login: async (email: string, password: string) => {
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    
    const response = await api.post('/auth/login', formData)
    const { access_token } = response.data
    
    Cookies.set('token', access_token, { expires: 1 })
    return response.data
  },

  register: async (userData: any) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  logout: () => {
    Cookies.remove('token')
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },

  isAuthenticated: () => {
    return !!Cookies.get('token')
  }
}

export const claims = {
  getAll: async () => {
    const response = await api.get('/claims')
    return response.data
  },

  create: async (claimData: any) => {
    const response = await api.post('/claims', claimData)
    return response.data
  },

  update: async (id: number, updateData: any) => {
    const response = await api.put(`/claims/${id}`, updateData)
    return response.data
  },

  uploadDocument: async (claimId: number, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(`/claims/${claimId}/documents`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  addNote: async (claimId: number, content: string) => {
    const response = await api.post(`/claims/${claimId}/notes`, { content })
    return response.data
  }
}