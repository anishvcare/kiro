import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi'
import { categoryService } from '../services/category.service'
import { CategoryForm } from './CategoryForm'
import type { Category } from '../types'

export function Categories() {
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)

  const { data: categories = [], isLoading, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: categoryService.getAll,
  })

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    try {
      await categoryService.delete(id)
      refetch()
    } catch {
      alert('Failed to delete category.')
    }
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingCategory(null)
    refetch()
  }

  if (showForm) {
    return (
      <CategoryForm
        category={editingCategory}
        categories={categories}
        onClose={handleClose}
      />
    )
  }

  const parentCategories = categories.filter((c) => !c.parent_id)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1 rounded-lg bg-primary-600 px-3 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          <HiOutlinePlus className="h-4 w-4" />
          Add
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      ) : parentCategories.length > 0 ? (
        <div className="space-y-2">
          {parentCategories.map((category) => (
            <div key={category.id} className="rounded-xl border border-gray-200 bg-white">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">{category.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{category.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(category)}
                    className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  >
                    <HiOutlinePencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {category.children && category.children.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-2">
                  {category.children.map((sub) => (
                    <div
                      key={sub.id}
                      className="flex items-center justify-between py-2 pl-6"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: sub.color }}
                        />
                        <span className="text-sm text-gray-700">{sub.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(sub)}
                          className="rounded p-1 text-gray-400 hover:text-gray-600"
                        >
                          <HiOutlinePencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="rounded p-1 text-gray-400 hover:text-red-600"
                        >
                          <HiOutlineTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className="text-gray-500">No categories yet.</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            Create your first category
          </button>
        </div>
      )}
    </div>
  )
}
