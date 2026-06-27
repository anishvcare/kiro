import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiOutlinePlus, HiOutlineFilter } from 'react-icons/hi'
import { transactionService } from '../services/transaction.service'
import { categoryService } from '../services/category.service'
import { TransactionItem } from '../components/TransactionItem'
import { TransactionForm } from './TransactionForm'
import type { TransactionFilters, Transaction } from '../types'

export function Transactions() {
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<TransactionFilters>({})

  const { data: transactions = [], isLoading, refetch } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: () => transactionService.getAll(filters),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  })

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingTransaction(null)
    refetch()
  }

  if (showForm) {
    return (
      <TransactionForm
        transaction={editingTransaction}
        onClose={handleClose}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <HiOutlineFilter className="h-4 w-4" />
            Filters
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            <HiOutlinePlus className="h-4 w-4" />
            Add
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="block text-xs font-medium text-gray-500">Type</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                value={filters.type || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, type: (e.target.value as 'income' | 'expense') || undefined }))
                }
              >
                <option value="">All</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">Category</label>
              <select
                className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                value={filters.category_id || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, category_id: e.target.value ? Number(e.target.value) : undefined }))
                }
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">From Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                value={filters.date_from || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, date_from: e.target.value || undefined }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500">To Date</label>
              <input
                type="date"
                className="mt-1 block w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
                value={filters.date_to || ''}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, date_to: e.target.value || undefined }))
                }
              />
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : transactions.length > 0 ? (
        <div className="space-y-2">
          {transactions.map((tx) => (
            <TransactionItem
              key={tx.id}
              transaction={tx}
              onClick={() => handleEdit(tx)}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">No transactions found.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Add your first transaction
          </button>
        </div>
      )}
    </div>
  )
}
