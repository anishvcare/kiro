import { useEffect, useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { profileService } from '../services/profile.service'
import {
  COUNTRIES,
  DIETS,
  KERALA_DISTRICTS,
  MARITAL_STATUSES,
  PROFILE_FOR,
  RELIGIONS,
} from '../lib/options'
import type { Profile } from '../types'

const inputClass =
  'mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500'

type FormState = Partial<Profile>

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  )
}

export function MyProfile() {
  const { data: existing, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: profileService.getMine,
  })

  const [form, setForm] = useState<FormState>({ gender: 'male', profile_for: 'self' })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (existing) setForm(existing)
  }, [existing])

  const set = (patch: FormState) => setForm((f) => ({ ...f, ...patch }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    setSaving(true)
    try {
      const saved = await profileService.save(form)
      setForm(saved)
      setMessage('Profile saved successfully.')
    } catch (err: unknown) {
      const ax = err as { response?: { data?: { message?: string } } }
      setError(ax.response?.data?.message || 'Could not save profile. Please check your inputs.')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500">
          {existing ? `${existing.completeness}% complete · ${existing.display_id}` : 'Create your profile'}
        </p>
      </div>

      {message && <div className="rounded-lg bg-primary-50 p-3 text-sm text-primary-700">{message}</div>}
      {error && <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Basic Information</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Profile for">
              <select className={inputClass} value={form.profile_for ?? 'self'} onChange={(e) => set({ profile_for: e.target.value })}>
                {PROFILE_FOR.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </Field>
            <Field label="Full name *">
              <input className={inputClass} required value={form.full_name ?? ''} onChange={(e) => set({ full_name: e.target.value })} />
            </Field>
            <Field label="Gender *">
              <select className={inputClass} required value={form.gender ?? 'male'} onChange={(e) => set({ gender: e.target.value as Profile['gender'] })}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </Field>
            <Field label="Date of birth *">
              <input type="date" className={inputClass} required value={form.date_of_birth ?? ''} onChange={(e) => set({ date_of_birth: e.target.value })} />
            </Field>
            <Field label="Looking for">
              <select className={inputClass} value={form.looking_for ?? ''} onChange={(e) => set({ looking_for: (e.target.value || null) as Profile['looking_for'] })}>
                <option value="">Select</option>
                <option value="female">Bride</option>
                <option value="male">Groom</option>
              </select>
            </Field>
            <Field label="Height (cm)">
              <input type="number" min={120} max={240} className={inputClass} value={form.height_cm ?? ''} onChange={(e) => set({ height_cm: e.target.value ? Number(e.target.value) : null })} />
            </Field>
            <Field label="Marital status">
              <select className={inputClass} value={form.marital_status ?? 'never_married'} onChange={(e) => set({ marital_status: e.target.value as Profile['marital_status'] })}>
                {MARITAL_STATUSES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </Field>
            <Field label="Diet">
              <select className={inputClass} value={form.diet ?? ''} onChange={(e) => set({ diet: (e.target.value || null) as Profile['diet'] })}>
                <option value="">Select</option>
                {DIETS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Community</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Religion">
              <select className={inputClass} value={form.religion ?? ''} onChange={(e) => set({ religion: e.target.value })}>
                <option value="">Select</option>
                {RELIGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </Field>
            <Field label="Caste / Community">
              <input className={inputClass} value={form.caste ?? ''} onChange={(e) => set({ caste: e.target.value })} />
            </Field>
            <Field label="Mother tongue">
              <input className={inputClass} value={form.mother_tongue ?? ''} onChange={(e) => set({ mother_tongue: e.target.value })} />
            </Field>
            <Field label="Star (Nakshatra)">
              <input className={inputClass} value={form.star ?? ''} onChange={(e) => set({ star: e.target.value })} />
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">Education, Career & Location</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Education">
              <input className={inputClass} value={form.education ?? ''} onChange={(e) => set({ education: e.target.value })} />
            </Field>
            <Field label="Occupation">
              <input className={inputClass} value={form.occupation ?? ''} onChange={(e) => set({ occupation: e.target.value })} />
            </Field>
            <Field label="Annual income (₹)">
              <input type="number" min={0} className={inputClass} value={form.annual_income ?? ''} onChange={(e) => set({ annual_income: e.target.value ? Number(e.target.value) : null })} />
            </Field>
            <Field label="District">
              <select className={inputClass} value={form.district ?? ''} onChange={(e) => set({ district: e.target.value })}>
                <option value="">Select</option>
                {KERALA_DISTRICTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="City">
              <input className={inputClass} value={form.city ?? ''} onChange={(e) => set({ city: e.target.value })} />
            </Field>
            <Field label="Country">
              <select className={inputClass} value={form.country ?? 'India'} onChange={(e) => set({ country: e.target.value })}>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-900">About & Photo</h2>
          <div className="space-y-4">
            <Field label="Photo URL">
              <input className={inputClass} placeholder="https://..." value={form.photo_url ?? ''} onChange={(e) => set({ photo_url: e.target.value })} />
            </Field>
            <Field label="About me">
              <textarea rows={4} className={inputClass} value={form.about ?? ''} onChange={(e) => set({ about: e.target.value })} />
            </Field>
          </div>
        </section>

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 sm:w-auto"
        >
          {saving ? 'Saving...' : 'Save Profile'}
        </button>
      </form>
    </div>
  )
}
