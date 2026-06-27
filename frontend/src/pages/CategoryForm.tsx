import { useState, type FormEvent } from 'react'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { categoryService } from '../services/category.service'
import { ColorPicker } from '../components/ColorPicker'
import type { Category } from '../types'

interface CategoryFormProps {
  category?: Category | null
  categories: Category[]
  onClose: () => void
}

export function CategoryForm({ category, categories, onClose }: CategoryFormProps) {
  const isEditing = !!category

  const [name, setName] = useState(category?.name || '')
  const [type, setType] = useState<'income' | 'expense'>(category?.type || 'expense')
  const [color, setColor] = useState(category?.color || '#3b82f6')
  const [parentId, setParentId] = useState(category?.parent_id?.toString() || '')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const parentCategories = categories.filter((c) => !c.parent_id && c.id !== category?.id)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Name is required.')
      return
    }

    setError('')
    setIsSubmitting(true)

    const data = {
      name: name.trim(),
      type,
      color,
      parent_id: parentId ? Number(parentId) : null,
    }

    try {
      if (isEditing && category) {
        await categoryService.update(category.id, data)
      } else {
        await categoryService.create(data)
      }
      onClose()
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } } }
      setError(axiosError.response?.data?.message || 'Failed to save category.')
    } finally {
      setIsSubmitting(false)
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
          {isEditing ? 'Edit Category' : 'Add Category'}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl bg-white border border-gray-200 p-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="Category name"
            required
          />
        </div>

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

        <ColorPicker label="Color" value={color} onChange={setColor} />

        <div>
          <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
            Parent Category (optional)
          </label>
          <select
            id="parent"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="">None (top-level category)</option>
            {parentCategories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : isEditing ? 'Update' : 'Save'}
        </button>
      </form>
    </div>
  )
}
