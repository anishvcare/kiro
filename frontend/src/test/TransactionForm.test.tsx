import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TransactionForm } from '../pages/TransactionForm'

// Mock services
vi.mock('../services/transaction.service', () => ({
  transactionService: {
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../services/category.service', () => ({
  categoryService: {
    getAll: vi.fn().mockResolvedValue([
      { id: 1, name: 'Food', type: 'expense', color: '#ef4444', parent_id: null, children: [], created_at: '', updated_at: '' },
      { id: 2, name: 'Salary', type: 'income', color: '#22c55e', parent_id: null, children: [], created_at: '', updated_at: '' },
    ]),
  },
}))

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('TransactionForm', () => {
  const mockOnClose = vi.fn()

  it('renders the form with all required fields', () => {
    renderWithProviders(<TransactionForm onClose={mockOnClose} />)

    expect(screen.getByText('Add Transaction')).toBeInTheDocument()
    expect(screen.getByLabelText('Amount')).toBeInTheDocument()
    expect(screen.getByLabelText('Description')).toBeInTheDocument()
    expect(screen.getByLabelText('Date')).toBeInTheDocument()
    expect(screen.getByLabelText('Category')).toBeInTheDocument()
  })

  it('shows due date field when bill toggle is checked', () => {
    renderWithProviders(<TransactionForm onClose={mockOnClose} />)

    const billToggle = screen.getByLabelText('This is a recurring bill')
    fireEvent.click(billToggle)

    expect(screen.getByLabelText('Due Date')).toBeInTheDocument()
  })

  it('validates due date is required for bills when form is submitted programmatically', async () => {
    renderWithProviders(<TransactionForm onClose={mockOnClose} />)

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument()
    })

    // Fill all required fields
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '100' },
    })
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test Bill' },
    })
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: '1' },
    })

    // Toggle bill on but don't set due date
    fireEvent.click(screen.getByLabelText('This is a recurring bill'))

    // Submit the form
    const form = screen.getByText('Save').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      const errorEl = screen.getByTestId('form-error')
      expect(errorEl).toHaveTextContent('Due date is required for bills.')
    })
  })

  it('shows type toggle for income/expense', () => {
    renderWithProviders(<TransactionForm onClose={mockOnClose} />)

    expect(screen.getByText('Income')).toBeInTheDocument()
    expect(screen.getByText('Expense')).toBeInTheDocument()
  })

  it('shows color picker', () => {
    renderWithProviders(<TransactionForm onClose={mockOnClose} />)

    expect(screen.getByTestId('color-picker')).toBeInTheDocument()
  })

  it('shows validation error when description is empty', async () => {
    renderWithProviders(<TransactionForm onClose={mockOnClose} />)

    // Wait for categories to load
    await waitFor(() => {
      expect(screen.getByText('Food')).toBeInTheDocument()
    })

    // Fill amount and category but leave description empty
    fireEvent.change(screen.getByLabelText('Amount'), {
      target: { value: '50' },
    })
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: '1' },
    })
    // Clear description
    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: '' },
    })

    // Submit the form
    const form = screen.getByText('Save').closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      const errorEl = screen.getByTestId('form-error')
      expect(errorEl).toHaveTextContent('Description is required.')
    })
  })
})
