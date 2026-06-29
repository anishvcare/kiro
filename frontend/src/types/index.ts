export interface User {
  id: number
  name: string
  email: string
  avatar?: string | null
  has_profile?: boolean
  created_at: string
  updated_at: string
}

export type Gender = 'male' | 'female'
export type MaritalStatus = 'never_married' | 'divorced' | 'widowed' | 'separated'
export type Diet = 'vegetarian' | 'non_vegetarian' | 'eggetarian' | 'vegan'
export type InterestStatus = 'pending' | 'accepted' | 'declined'

export interface ProfilePhoto {
  id: number
  url: string
  is_primary: boolean
}

export interface Profile {
  id: number
  user_id: number
  display_id: string
  full_name: string
  gender: Gender
  date_of_birth: string | null
  age: number | null
  profile_for: string
  religion: string | null
  caste: string | null
  mother_tongue: string | null
  star: string | null
  rasi: string | null
  marital_status: MaritalStatus
  height_cm: number | null
  diet: Diet | null
  education: string | null
  occupation: string | null
  annual_income: number | null
  country: string | null
  state: string | null
  district: string | null
  city: string | null
  about: string | null
  looking_for: Gender | null
  photo_url: string | null
  is_verified: boolean
  completeness: number
  photos?: ProfilePhoto[]
  created_at?: string
}

export interface ProfileSummary {
  id: number
  user_id: number
  display_id: string
  full_name: string
  age: number | null
  gender: Gender
  religion: string | null
  caste: string | null
  mother_tongue: string | null
  marital_status: MaritalStatus
  height_cm: number | null
  education: string | null
  occupation: string | null
  district: string | null
  city: string | null
  country: string | null
  photo_url: string | null
  is_verified: boolean
}

export interface Interest {
  id: number
  sender_id: number
  receiver_id: number
  status: InterestStatus
  message: string | null
  created_at: string
  sender_profile?: ProfileSummary | null
  receiver_profile?: ProfileSummary | null
}

export interface DashboardStats {
  completeness: number
  interests_received: number
  interests_sent: number
  matches: number
}

export interface DashboardData {
  profile: Profile | null
  has_profile: boolean
  stats: DashboardStats
  recommended: ProfileSummary[]
}

export interface ProfileFilters {
  gender?: Gender | ''
  religion?: string
  caste?: string
  marital_status?: string
  district?: string
  country?: string
  q?: string
  age_min?: number | ''
  age_max?: number | ''
  page?: number
}

export interface PaginationMeta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}
