import api from '../lib/axios'
import type { DashboardData } from '../types'

export const dashboardService = {
  async getData() {
    const response = await api.get<DashboardData>('/dashboard')
    return response.data
  },
}
