import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function AuthLayout() {
  const { token, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (token) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-primary-600">FinanceManager</h1>
        <p className="mt-2 text-gray-500">Manage your finances with ease</p>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
