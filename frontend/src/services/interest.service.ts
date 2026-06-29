import api from '../lib/axios'
import type { Interest, InterestStatus } from '../types'

export const interestService = {
  async list(box: 'received' | 'sent' = 'received') {
    const response = await api.get<{ interests: Interest[] }>('/interests', {
      params: { box },
    })
    return response.data.interests
  },

  async express(receiverId: number, message?: string) {
    const response = await api.post<{ interest: Interest }>('/interests', {
      receiver_id: receiverId,
      message,
    })
    return response.data.interest
  },

  async respond(id: number, status: Extract<InterestStatus, 'accepted' | 'declined'>) {
    const response = await api.put<{ interest: Interest }>(`/interests/${id}`, {
      status,
    })
    return response.data.interest
  },
}
