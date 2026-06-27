export interface User {
  id: number
  name: string
  email: string
  created_at: string
  updated_at: string
}

export interface Category {
  id: number
  name: string
  type: 'income' | 'expense'
  color: string
  parent_id: number | null
  children?: Category[]
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: number
  type: 'income' | 'expense'
  amount: number
  description: string
  date: string
  category_id: number
  category?: Category
  priority_color: string | null
  is_bill: boolean
  bill_due_date: string | null
  status: 'pending' | 'paid' | 'overdue'
  created_at: string
  updated_at: string
}

export interface DashboardData {
  monthly_summary: {
    income: number
    expense: number
    balance: number
  }
  upcoming_bills: Transaction[]
  overdue_bills: Transaction[]
  category_breakdown: {
    category: string
    color: string
    total: number
  }[]
  recent_transactions: Transaction[]
}

export interface TransactionFilters {
  type?: 'income' | 'expense'
  category_id?: number
  date_from?: string
  date_to?: string
  is_bill?: boolean
  status?: string
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
