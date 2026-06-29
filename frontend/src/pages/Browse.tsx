import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiOutlineSearch, HiOutlineAdjustments } from 'react-icons/hi'
import { profileService } from '../services/profile.service'
import { ProfileCard } from '../components/ProfileCard'
import { KERALA_DISTRICTS, RELIGIONS, MARITAL_STATUSES } from '../lib/options'
import type { ProfileFilters } from '../types'

const inputClass =
  'h-10 w-full rounded-lg border border-gray-300 px-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'

export function Browse() {
  const [filters, setFilters] = useState<ProfileFilters>({ page: 1 })
  const [showFilters, setShowFilters] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['profiles', filters],
    queryFn: () => profileService.browse(filters),
  })

  const profiles = data?.profiles ?? []
  const meta = data?.meta

  const update = (patch: Partial<ProfileFilters>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }))

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Browse Profiles</h1>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 md:hidden"
        >
          <HiOutlineAdjustments className="h-4 w-4" /> Filters
        </button>
      </div>

      {/* Filters */}
      <div className={`${showFilters ? 'block' : 'hidden'} rounded-2xl border border-gray-200 bg-white p-4 md:block`}>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="relative">
              <HiOutlineSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search by name"
                value={filters.q ?? ''}
                onChange={(e) => update({ q: e.target.value })}
              />
            </div>
          </div>

          <select className={inputClass} value={filters.gender ?? ''} onChange={(e) => update({ gender: e.target.value as ProfileFilters['gender'] })}>
            <option value="">Any gender</option>
            <option value="female">Bride</option>
            <option value="male">Groom</option>
          </select>

          <select className={inputClass} value={filters.religion ?? ''} onChange={(e) => update({ religion: e.target.value })}>
            <option value="">Any religion</option>
            {RELIGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select className={inputClass} value={filters.district ?? ''} onChange={(e) => update({ district: e.target.value })}>
            <option value="">Any district</option>
            {KERALA_DISTRICTS.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select className={inputClass} value={filters.marital_status ?? ''} onChange={(e) => update({ marital_status: e.target.value })}>
            <option value="">Any marital status</option>
            {MARITAL_STATUSES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>

          <input
            type="number"
            className={inputClass}
            placeholder="Age from"
            value={filters.age_min ?? ''}
            onChange={(e) => update({ age_min: e.target.value ? Number(e.target.value) : '' })}
          />
          <input
            type="number"
            className={inputClass}
            placeholder="Age to"
            value={filters.age_max ?? ''}
            onChange={(e) => update({ age_max: e.target.value ? Number(e.target.value) : '' })}
          />

          <button
            onClick={() => setFilters({ page: 1 })}
            className="h-10 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Clear filters
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : profiles.length > 0 ? (
        <>
          <p className="text-sm text-gray-500">{meta?.total ?? profiles.length} profiles found</p>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {profiles.map((p) => (
              <ProfileCard key={p.id} profile={p} />
            ))}
          </div>

          {meta && meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                disabled={meta.current_page <= 1}
                onClick={() => setFilters((f) => ({ ...f, page: meta.current_page - 1 }))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-gray-500">
                Page {meta.current_page} of {meta.last_page}
              </span>
              <button
                disabled={meta.current_page >= meta.last_page}
                onClick={() => setFilters((f) => ({ ...f, page: meta.current_page + 1 }))}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="py-12 text-center text-gray-500">No profiles match your filters.</div>
      )}
    </div>
  )
}
