import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import {
  HiOutlineHeart,
  HiOutlinePaperAirplane,
  HiOutlineSparkles,
  HiOutlineUserCircle,
} from 'react-icons/hi'
import { dashboardService } from '../services/dashboard.service'
import { ProfileCard } from '../components/ProfileCard'
import { useAuth } from '../context/AuthContext'

function StatTile({
  label,
  value,
  icon,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-50 text-primary-600">
          {icon}
        </span>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  )
}

export function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardService.getData,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  const stats = data?.stats
  const recommended = data?.recommended ?? []
  const hasProfile = data?.has_profile

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p className="text-sm text-gray-500">Here&apos;s what&apos;s happening with your search.</p>
      </div>

      {/* Profile completeness / prompt */}
      {!hasProfile ? (
        <div className="rounded-2xl border border-primary-200 bg-primary-50 p-5">
          <h2 className="font-semibold text-primary-800">Create your profile to get started</h2>
          <p className="mt-1 text-sm text-primary-700">
            Members with a complete profile get up to 5x more interests.
          </p>
          <Link
            to="/my-profile"
            className="mt-3 inline-block rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            Create Profile
          </Link>
        </div>
      ) : (
        stats != null &&
        stats.completeness < 100 && (
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-gray-900">Profile completeness</h2>
              <span className="text-sm font-medium text-primary-600">{stats.completeness}%</span>
            </div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-primary-600 transition-all"
                style={{ width: `${stats.completeness}%` }}
              />
            </div>
            <Link to="/my-profile" className="mt-3 inline-block text-sm font-medium text-primary-600 hover:text-primary-700">
              Complete your profile →
            </Link>
          </div>
        )
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label="Interests received" value={stats?.interests_received ?? 0} icon={<HiOutlineHeart className="h-5 w-5" />} />
        <StatTile label="Interests sent" value={stats?.interests_sent ?? 0} icon={<HiOutlinePaperAirplane className="h-5 w-5" />} />
        <StatTile label="Matches" value={stats?.matches ?? 0} icon={<HiOutlineSparkles className="h-5 w-5" />} />
        <StatTile label="Profile" value={`${stats?.completeness ?? 0}%`} icon={<HiOutlineUserCircle className="h-5 w-5" />} />
      </div>

      {/* Recommended */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recommended for you</h2>
          <Link to="/browse" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Browse all →
          </Link>
        </div>
        {recommended.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {recommended.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recommendations yet. Try browsing profiles.</p>
        )}
      </section>
    </div>
  )
}
