import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  HiBadgeCheck,
  HiOutlineArrowLeft,
  HiOutlineHeart,
  HiHeart,
} from 'react-icons/hi'
import { profileService } from '../services/profile.service'
import { interestService } from '../services/interest.service'
import { formatHeight, formatLabel } from '../lib/options'
import type { Profile } from '../types'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div className="flex justify-between gap-4 border-b border-gray-100 py-2.5 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-right text-sm font-medium text-gray-900">{value}</span>
    </div>
  )
}

export function ProfileDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [actionMsg, setActionMsg] = useState('')

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['profile', id],
    queryFn: () => profileService.getById(Number(id)),
    enabled: !!id,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  if (!data?.profile) {
    return <div className="py-12 text-center text-gray-500">Profile not found.</div>
  }

  const profile: Profile = data.profile
  const interestSent = data.interest_sent
  const interestReceived = data.interest_received

  const handleExpress = async () => {
    try {
      await interestService.express(profile.user_id)
      setActionMsg('Interest sent!')
      refetch()
    } catch {
      setActionMsg('Could not send interest.')
    }
  }

  const handleRespond = async (status: 'accepted' | 'declined') => {
    if (!interestReceived) return
    try {
      await interestService.respond(interestReceived.id, status)
      setActionMsg(`Interest ${status}.`)
      refetch()
    } catch {
      setActionMsg('Action failed.')
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700"
      >
        <HiOutlineArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        {/* Header */}
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
            {profile.photo_url ? (
              <img src={profile.photo_url} alt={profile.full_name} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-primary-100 text-4xl font-bold text-primary-600">
                {profile.full_name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{profile.full_name}</h1>
              {profile.is_verified && <HiBadgeCheck className="h-5 w-5 text-primary-600" />}
            </div>
            <p className="text-sm text-gray-400">{profile.display_id}</p>
            <p className="mt-1 text-sm text-gray-600">
              {[profile.age ? `${profile.age} yrs` : null, formatHeight(profile.height_cm), formatLabel(profile.marital_status)]
                .filter(Boolean)
                .join(' · ')}
            </p>
            <p className="text-sm text-gray-600">
              {[profile.religion, profile.caste].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>

        {/* Interest actions */}
        <div className="border-t border-gray-100 px-6 py-4">
          {actionMsg && <p className="mb-3 text-sm font-medium text-primary-600">{actionMsg}</p>}

          {interestReceived && interestReceived.status === 'pending' ? (
            <div className="flex flex-wrap gap-3">
              <span className="text-sm text-gray-600">This member is interested in you.</span>
              <button onClick={() => handleRespond('accepted')} className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700">
                Accept
              </button>
              <button onClick={() => handleRespond('declined')} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Decline
              </button>
            </div>
          ) : interestSent ? (
            <div className="flex items-center gap-2 text-sm font-medium text-primary-600">
              <HiHeart className="h-5 w-5" />
              Interest {interestSent.status === 'accepted' ? 'accepted 🎉' : interestSent.status === 'declined' ? 'declined' : 'sent'}
            </div>
          ) : (
            <button onClick={handleExpress} className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700">
              <HiOutlineHeart className="h-5 w-5" /> Express Interest
            </button>
          )}
        </div>
      </div>

      {/* About */}
      {profile.about && (
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-2 font-semibold text-gray-900">About</h2>
          <p className="text-sm leading-relaxed text-gray-600">{profile.about}</p>
        </div>
      )}

      {/* Details */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 font-semibold text-gray-900">Basic Details</h2>
          <DetailRow label="Profile for" value={formatLabel(profile.profile_for)} />
          <DetailRow label="Mother tongue" value={profile.mother_tongue} />
          <DetailRow label="Marital status" value={formatLabel(profile.marital_status)} />
          <DetailRow label="Diet" value={formatLabel(profile.diet)} />
          <DetailRow label="Star" value={profile.star} />
          <DetailRow label="Rasi" value={profile.rasi} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="mb-3 font-semibold text-gray-900">Education & Career</h2>
          <DetailRow label="Education" value={profile.education} />
          <DetailRow label="Occupation" value={profile.occupation} />
          <DetailRow label="Annual income" value={profile.annual_income ? `₹${profile.annual_income.toLocaleString('en-IN')}` : null} />
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:col-span-2">
          <h2 className="mb-3 font-semibold text-gray-900">Location</h2>
          <DetailRow label="City" value={profile.city} />
          <DetailRow label="District" value={profile.district} />
          <DetailRow label="State" value={profile.state} />
          <DetailRow label="Country" value={profile.country} />
        </div>
      </div>
    </div>
  )
}
