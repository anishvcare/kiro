import { HiOutlineExclamationCircle } from 'react-icons/hi'
import type { Transaction } from '../types'

interface BillCardProps {
  bill: Transaction
}

export function BillCard({ bill }: BillCardProps) {
  const isOverdue = bill.status === 'overdue'
  const dueDate = bill.bill_due_date ? new Date(bill.bill_due_date) : null
  const daysUntilDue = dueDate
    ? Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div
      className="rounded-lg border-2 border-bill-red-border bg-bill-red-light p-4"
      data-testid="bill-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{bill.description}</h4>
          <p className="mt-1 text-sm text-gray-600">
            {bill.category?.name}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-bill-red">
            ₹{Number(bill.amount).toFixed(2)}
          </p>
          {dueDate && (
            <p className="mt-1 text-xs text-gray-500">
              Due: {dueDate.toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
      {(isOverdue || (daysUntilDue !== null && daysUntilDue <= 3)) && (
        <div className="mt-2 flex items-center gap-1 text-sm font-medium text-bill-red">
          <HiOutlineExclamationCircle className="h-4 w-4" />
          <span>
            {isOverdue
              ? 'Overdue!'
              : daysUntilDue === 0
                ? 'Due today!'
                : daysUntilDue === 1
                  ? 'Due tomorrow!'
                  : `Due in ${daysUntilDue} days`}
          </span>
        </div>
      )}
    </div>
  )
}
