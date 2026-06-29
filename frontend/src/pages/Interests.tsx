import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { HiBadgeCheck } from 'react-icons/hi'
import { interestService } from '../services/interest.service'
import { formatLabel } from '../lib/options'
import type { Interest, ProfileSummary } from '../types'

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending: 'bg-amber-50 text-amber-700',
    accepted: 'bg-green-50 text-green-700',
    declined: 'bg-gray-100 text-gray-500',
  }
  return map[status] ?? 'bg-gray-100 text-gray-500'
}

function InterestRow({
  interest,
  profile,
  showActions,
  onRespond,
}: {
  interest: Interest
  profile: ProfileSummary | null | undefined
  showActions: boolean
  onRespond: (id: number, status: 'accepted' | 'declined') => void
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {profile?.photo_url ? (
          <img src={profile.photo_url} alt={profile.full_name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-primary-100 text-xl font-bold text-primary-600">
            {profile?.full_name?.charAt(0)?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          {profile ? (
            <Link to={`/profile/${profile.id}`} className="font-medium text-gray-900 hover:text-primary-600">
              {profile.full_name}
            </Link>
          ) : (
            <span className="font-medium text-gray-900">Member</span>
          )}
          {profile?.is_verified && <HiBadgeCheck className="h-4 w-4 text-primary-600" />}
        </div>
        <p className="truncate text-sm text-gray-500">
          {[profile?.age ? `${profile.age} yrs` : null, profile?.religion, profile?.district].filter(Boolean).join(' · ')}
        </p>
      </div>

      {showActions && interest.status === 'pending' ? (
        <div className="flex shrink-0 gap-2">
          <button onClick={() => onRespond(interest.id, 'accepted')} className="rounded-lg bg-primary-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-primary-700">
            Accept
          </button>
          <button onClick={() => onRespond(interest.id, 'declined')} className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50">
            Decline
          </button>
        </div>
      ) : (
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadge(interest.status)}`}>
          {formatLabel(interest.status)}
        </span>
      )}
    </div>
  )
}

export function Interests() {
  const [box, setBox] = useState<'received' | 'sent'>('received')

  const { data: interests = [], isLoading, refetch } = useQuery({
    queryKey: ['interests', box],
    queryFn: () => interestService.list(box),
  })

  const handleRespond = async (id: number, status: 'accepted' | 'declined') => {
    try {
      await interestService.respond(id, status)
      refetch()
    } catch {
      alert('Could not update interest.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Interests</h1>

      <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
        {(['received', 'sent'] as const).map((b) => (
          <button
            key={b}
            onClick={() => setBox(b)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium capitalize transition ${
              box === b ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {b}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : interests.length > 0 ? (
        <div className="space-y-3">
          {interests.map((interest) => (
            <InterestRow
              key={interest.id}
              interest={interest}
              profile={box === 'received' ? interest.sender_profile : interest.receiver_profile}
              showActions={box === 'received'}
              onRespond={handleRespond}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500">
          {box === 'received' ? 'No interests received yet.' : 'You haven\u2019t sent any interests yet.'}
        </div>
      )}
    </div>
  )
}
