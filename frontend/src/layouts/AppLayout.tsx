import { Outlet, Navigate, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { PWAInstallButton } from '../components/PWAInstallButton'
import {
  HiOutlineHome,
  HiOutlineCash,
  HiOutlineTag,
  HiOutlineLogout,
} from 'react-icons/hi'

const navItems = [
  { to: '/', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/transactions', icon: HiOutlineCash, label: 'Transactions' },
  { to: '/categories', icon: HiOutlineTag, label: 'Categories' },
]

export function AppLayout() {
  const { token, user, logout, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 border-r border-gray-200 bg-white p-4 md:block">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-primary-600">PF</h1>
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-8">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <HiOutlineLogout className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
          <h2 className="text-lg font-semibold text-gray-900 md:hidden">
            PF
          </h2>
          <div className="hidden md:block">
            <span className="text-sm text-gray-500">
              Welcome, {user?.name}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <PWAInstallButton />
            <button
              onClick={logout}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden"
              aria-label="Logout"
            >
              <HiOutlineLogout className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 pb-20 md:p-6 md:pb-6">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-gray-200 bg-white md:hidden">
          <div className="flex items-center justify-around py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 px-3 py-1 text-xs ${
                    isActive ? 'text-primary-600' : 'text-gray-500'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
