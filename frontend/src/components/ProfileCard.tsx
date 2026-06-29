import { Link } from 'react-router-dom'
import { HiBadgeCheck, HiOutlineLocationMarker, HiOutlineAcademicCap } from 'react-icons/hi'
import type { ProfileSummary } from '../types'
import { formatHeight } from '../lib/options'

function Avatar({ profile }: { profile: ProfileSummary }) {
  if (profile.photo_url) {
    return (
      <img
        src={profile.photo_url}
        alt={profile.full_name}
        className="h-full w-full object-cover"
      />
    )
  }
  const initial = profile.full_name?.charAt(0)?.toUpperCase() ?? '?'
  return (
    <div className="flex h-full w-full items-center justify-center bg-primary-100 text-3xl font-bold text-primary-600">
      {initial}
    </div>
  )
}

export function ProfileCard({ profile }: { profile: ProfileSummary }) {
  return (
    <Link
      to={`/profile/${profile.id}`}
      className="group block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        <Avatar profile={profile} />
        {profile.is_verified && (
          <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-primary-600 shadow">
            <HiBadgeCheck className="h-3.5 w-3.5" /> Verified
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold text-gray-900">{profile.full_name}</h3>
          <span className="text-sm text-gray-500">{profile.age ?? '-'} yrs</span>
        </div>
        <p className="mt-0.5 text-xs text-gray-400">{profile.display_id}</p>

        <div className="mt-3 space-y-1.5 text-sm text-gray-600">
          {(profile.religion || profile.caste) && (
            <p className="truncate">
              {[profile.religion, profile.caste].filter(Boolean).join(' · ')}
            </p>
          )}
          {profile.occupation && (
            <p className="flex items-center gap-1.5 truncate">
              <HiOutlineAcademicCap className="h-4 w-4 shrink-0 text-gray-400" />
              {profile.occupation}
            </p>
          )}
          {(profile.district || profile.country) && (
            <p className="flex items-center gap-1.5 truncate">
              <HiOutlineLocationMarker className="h-4 w-4 shrink-0 text-gray-400" />
              {[profile.district, profile.country].filter(Boolean).join(', ')}
            </p>
          )}
          {profile.height_cm && (
            <p className="text-xs text-gray-400">{formatHeight(profile.height_cm)}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
