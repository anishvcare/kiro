import { Outlet, Navigate } from 'react-router-dom'
import { HiOutlineHeart } from 'react-icons/hi'
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
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="mb-3 grid h-14 w-14 place-items-center rounded-full bg-primary-600 text-white">
          <HiOutlineHeart className="h-7 w-7" />
        </span>
        <h1 className="text-3xl font-bold text-gray-900">
          Nokkoo <span className="text-primary-600">Matri</span>
        </h1>
        <p className="mt-2 text-gray-500">Find your perfect life partner</p>
      </div>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  )
}
