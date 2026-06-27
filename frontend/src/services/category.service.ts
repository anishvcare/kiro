import api from '../lib/axios'
import type { Category } from '../types'

export const categoryService = {
  async getAll() {
    const response = await api.get<{ categories: Category[] }>('/categories')
    return response.data.categories
  },

  async getById(id: number) {
    const response = await api.get<{ category: Category }>(`/categories/${id}`)
    return response.data.category
  },

  async create(data: Partial<Category>) {
    const response = await api.post<{ category: Category }>('/categories', data)
    return response.data.category
  },

  async update(id: number, data: Partial<Category>) {
    const response = await api.put<{ category: Category }>(`/categories/${id}`, data)
    return response.data.category
  },

  async delete(id: number) {
    await api.delete(`/categories/${id}`)
  },
}
