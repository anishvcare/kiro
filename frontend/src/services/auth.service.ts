import api from '../lib/axios'
import type { LoginCredentials, RegisterData, User } from '../types'

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post<{ token: string; user: User }>('/login', credentials)
    return response.data
  },

  async register(data: RegisterData) {
    const response = await api.post<{ token: string; user: User }>('/register', data)
    return response.data
  },

  async googleLogin(token: string) {
    const response = await api.post<{ token: string; user: User }>('/auth/google', { token })
    return response.data
  },

  async logout() {
    await api.post('/logout')
    localStorage.removeItem('auth_token')
  },

  async getUser() {
    const response = await api.get<{ user: User }>('/user')
    return response.data.user
  },
}
