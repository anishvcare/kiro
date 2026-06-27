import type { ReactNode } from 'react'

interface StatCardProps {
  title: string
  value: string | number
  icon: ReactNode
  color: 'green' | 'red' | 'blue'
}

export function StatCard({ title, value, icon, color }: StatCardProps) {
  const colorClasses = {
    green: 'bg-green-50 text-income',
    red: 'bg-red-50 text-expense',
    blue: 'bg-blue-50 text-blue-600',
  }

  return (
    <div className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-full ${colorClasses[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  )
}
