import api from '../lib/axios'
import type {
  PaginationMeta,
  Profile,
  ProfileFilters,
  ProfileSummary,
} from '../types'

interface ProfileDetailResponse {
  profile: Profile
  interest_sent: { status: string } | null
  interest_received: { id: number; status: string } | null
}

export const profileService = {
  async getMine() {
    const response = await api.get<{ profile: Profile | null }>('/profile')
    return response.data.profile
  },

  async save(data: Partial<Profile>) {
    const response = await api.post<{ profile: Profile }>('/profile', data)
    return response.data.profile
  },

  async browse(filters: ProfileFilters) {
    const params = new URLSearchParams()
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.append(key, String(value))
      }
    })
    const response = await api.get<{ profiles: ProfileSummary[]; meta: PaginationMeta }>(
      '/profiles',
      { params },
    )
    return response.data
  },

  async getById(id: number) {
    const response = await api.get<ProfileDetailResponse>(`/profiles/${id}`)
    return response.data
  },
}
