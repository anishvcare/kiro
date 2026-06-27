import api from '../lib/axios'
import type { Transaction, TransactionFilters } from '../types'

interface TransactionListResponse {
  transactions: Transaction[]
  meta: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export const transactionService = {
  async getAll(filters?: TransactionFilters) {
    const params = new URLSearchParams()
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    const response = await api.get<TransactionListResponse>('/transactions', { params })
    return response.data.transactions
  },

  async getById(id: number) {
    const response = await api.get<{ transaction: Transaction }>(`/transactions/${id}`)
    return response.data.transaction
  },

  async create(data: Partial<Transaction>) {
    const response = await api.post<{ transaction: Transaction }>('/transactions', data)
    return response.data.transaction
  },

  async update(id: number, data: Partial<Transaction>) {
    const response = await api.put<{ transaction: Transaction }>(`/transactions/${id}`, data)
    return response.data.transaction
  },

  async delete(id: number) {
    await api.delete(`/transactions/${id}`)
  },
}
