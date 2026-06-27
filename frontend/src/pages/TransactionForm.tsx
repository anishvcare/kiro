import { useState, type FormEvent } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { transactionService } from '../services/transaction.service'
import { categoryService } from '../services/category.service'
import { ColorPicker } from '../components/ColorPicker'
import type { Transaction } from '../types'

interface TransactionFormProps {
  transaction?: Transaction | null
  onClose: () => void
}

export function TransactionForm({ transaction, onClose }: TransactionFormProps) {
  const isEditing = !!transaction

  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense')
  const [amount, setAmount] = useState(transaction?.amount?.toString() || '')
  const [description, setDescription] = useState(transaction?.description || '')
  const [categoryId, setCategoryId] = useState(transaction?.category_id?.toString() || '')
  const [date, setDate] = useState(transaction?.date || new Date().toISOString().split('T')[0])
  const [priorityColor, setPriorityColor] = useState(transaction?.priority_color || '')
  const [isBill, setIsBill] = useState(transaction?.is_bill || false)
  const [billDueDate, setBillDueDate] = useState(transaction?.bill_due_date || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  })

  const filteredCategories = categories.filter((c) => c.type === type)

  const validate = (): string | null => {
    if (!amount || Number(amount) <= 0) return 'Amount must be greater than zero.'
    if (!description.trim()) return 'Description is required.'
    if (!categoryId) return 'Please select a category.'
    if (!date) return 'Date is required.'
    if (isBill && !billDueDate) return 'Due date is required for bills.'
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsSubmitting(true)

    const data = {
      type,
      amount: Number(amount),
      description: description.trim(),
      category_id: Number(categoryId),
      date,
      priority_color: priorityColor || null,
      is_bill: isBill,
      bill_due_date: isBill ? billDueDate : null,
    }

    try {
      if (isEditing && transaction) {
        await transactionService.update(transaction.id, data)
      } else {
        await transactionService.create(data)
      }
      onClose()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Failed to save transaction.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!transaction) return
    if (!confirm('Are you sure you want to delete this transaction?')) return

    try {
      await transactionService.delete(transaction.id)
      onClose()
    } catch {
      setError('Failed to delete transaction.')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Transaction' : 'Add Transaction'}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700" data-testid="form-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white border border-gray-200 p-4">
        {/* Type Toggle */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">Type</label>
          <div className="flex rounded-lg border border-gray-300 overflow-hidden">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                type === 'income'
                  ? 'bg-income text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                type === 'expense'
                  ? 'bg-expense text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Expense
            </button>
          </div>
        </div>

        {/* Amount */}
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="0.00"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          >
            <option value="">Select a category</option>
            {filteredCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
            {filteredCategories.flatMap((cat) =>
              (cat.children || []).map((sub) => (
                <option key={sub.id} value={sub.id}>
                  &nbsp;&nbsp;-- {sub.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="What was this for?"
            required
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            required
          />
        </div>

        {/* Priority Color */}
        <ColorPicker
          label="Priority Color (optional)"
          value={priorityColor}
          onChange={setPriorityColor}
        />

        {/* Bill Toggle */}
        <div className="flex items-center gap-3">
          <input
            id="is_bill"
            type="checkbox"
            checked={isBill}
            onChange={(e) => setIsBill(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="is_bill" className="text-sm font-medium text-gray-700">
            This is a recurring bill
          </label>
        </div>

        {/* Due Date (for bills) */}
        {isBill && (
          <div>
            <label htmlFor="bill_due_date" className="block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              id="bill_due_date"
              type="date"
              value={billDueDate}
              onChange={(e) => setBillDueDate(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Delete
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
