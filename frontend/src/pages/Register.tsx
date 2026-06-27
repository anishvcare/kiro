import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authService } from '../services/auth.service'

export function Register() {
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== passwordConfirmation) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      })
      login(response.token, response.user)
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-200">
      <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
        Create Account
      </h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Your full name"
          />
        </div>
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
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            id="password_confirmation"
            type="password"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            minLength={8}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Confirm your password"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700">
          Sign In
        </Link>
      </p>
    </div>
  )
}
