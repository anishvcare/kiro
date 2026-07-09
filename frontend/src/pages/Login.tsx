import { useState, useCallback, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { FcGoogle } from 'react-icons/fc'
import { HiEye, HiEyeOff } from 'react-icons/hi'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth.service'

export function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)

  const handleGoogleLogin = useCallback(async () => {
    setError('')
    setIsGoogleLoading(true)

    try {
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (!clientId) {
        setError('Google login is not configured. Please contact the administrator.')
        setIsGoogleLoading(false)
        return
      }

      // Use Google Identity Services tokenClient for access token flow
      const tokenClient = window.google?.accounts?.oauth2?.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (tokenResponse: { access_token?: string; error?: string }) => {
          if (tokenResponse.error || !tokenResponse.access_token) {
            setError('Google login failed. Please try again.')
            setIsGoogleLoading(false)
            return
          }

          try {
            const response = await authService.googleLogin(tokenResponse.access_token)
            login(response.token, response.user)
          } catch {
            setError('Google login failed. Please try again.')
          } finally {
            setIsGoogleLoading(false)
          }
        },
      })

      if (tokenClient) {
        tokenClient.requestAccessToken()
      } else {
        setError('Google login is not available. Please ensure the Google script is loaded.')
        setIsGoogleLoading(false)
      }
    } catch {
      setError('Google login failed. Please try again.')
      setIsGoogleLoading(false)
    }
  }, [login])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await authService.login({ email, password })
      login(response.token, response.user)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
        Sign In
      </h2>

      {/* Google Login - Primary Option */}
      <button
        onClick={handleGoogleLogin}
        disabled={isGoogleLoading}
        className="mb-6 flex w-full items-center justify-center gap-3 rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50"
        type="button"
      >
        <FcGoogle className="h-5 w-5" />
        {isGoogleLoading ? 'Signing in...' : 'Continue with Google'}
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white px-2 text-gray-500">or sign in with email</span>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative mt-1">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              {showPassword ? (
                <HiEyeOff className="h-5 w-5" />
              ) : (
                <HiEye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-primary-600 hover:text-primary-700">
          Sign Up
        </Link>
      </p>
    </div>
  )
}
