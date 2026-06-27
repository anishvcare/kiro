import { HiOutlineArrowUp, HiOutlineArrowDown } from 'react-icons/hi'
import type { Transaction } from '../types'

interface TransactionItemProps {
  transaction: Transaction
  onClick?: () => void
}

export function TransactionItem({ transaction, onClick }: TransactionItemProps) {
  const isIncome = transaction.type === 'income'

  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 transition-colors hover:bg-gray-50 cursor-pointer"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: transaction.priority_color || (isIncome ? '#16a34a' : '#dc2626'),
      }}
      onClick={onClick}
      data-testid="transaction-item"
    >
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full ${
          isIncome ? 'bg-green-100 text-income' : 'bg-red-100 text-expense'
        }`}
      >
        {isIncome ? (
          <HiOutlineArrowUp className="h-4 w-4" />
        ) : (
          <HiOutlineArrowDown className="h-4 w-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-gray-900">
          {transaction.description}
        </p>
        <p className="text-xs text-gray-500">
          {transaction.category?.name} - {new Date(transaction.date).toLocaleDateString()}
        </p>
      </div>
      <p
        className={`font-semibold ${
          isIncome ? 'text-income' : 'text-expense'
        }`}
      >
        {isIncome ? '+' : '-'}${Number(transaction.amount).toFixed(2)}
      </p>
    </div>
  )
}
