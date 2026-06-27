import { useQuery } from '@tanstack/react-query'
import { HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineCash } from 'react-icons/hi'
import { dashboardService } from '../services/dashboard.service'
import { StatCard } from '../components/StatCard'
import { BillCard } from '../components/BillCard'
import { TransactionItem } from '../components/TransactionItem'

export function Dashboard() {
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

  const summary = data?.monthly_summary
  const upcomingBills = data?.upcoming_bills || []
  const overdueBills = data?.overdue_bills || []
  const recentTransactions = data?.recent_transactions || []

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Income"
          value={`$${Number(summary?.income || 0).toFixed(2)}`}
          icon={<HiOutlineTrendingUp className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Expenses"
          value={`$${Number(summary?.expense || 0).toFixed(2)}`}
          icon={<HiOutlineTrendingDown className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="Balance"
          value={`$${Number(summary?.balance || 0).toFixed(2)}`}
          icon={<HiOutlineCash className="h-6 w-6" />}
          color="blue"
        />
      </div>

      {/* Upcoming / Overdue Bills */}
      {(overdueBills.length > 0 || upcomingBills.length > 0) && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-bill-red" data-testid="bills-heading">
            Upcoming Bills
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {overdueBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
            {upcomingBills.map((bill) => (
              <BillCard key={bill.id} bill={bill} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Transactions */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">
          Recent Transactions
        </h2>
        {recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No transactions yet.</p>
        )}
      </section>
    </div>
  )
}
