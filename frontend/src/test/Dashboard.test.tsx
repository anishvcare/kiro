import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Dashboard } from '../pages/Dashboard'

// Mock the dashboard service
vi.mock('../services/dashboard.service', () => ({
  dashboardService: {
    getData: vi.fn().mockResolvedValue({
      monthly_summary: {
        income: 5000,
        expense: 3200,
        balance: 1800,
      },
      upcoming_bills: [
        {
          id: 1,
          type: 'expense',
          amount: 150,
          description: 'Electricity Bill',
          date: '2024-01-15',
          category_id: 1,
          category: { id: 1, name: 'Utilities', type: 'expense', color: '#ef4444', parent_id: null, created_at: '', updated_at: '' },
          priority_color: null,
          is_bill: true,
          bill_due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: 'pending',
          created_at: '',
          updated_at: '',
        },
      ],
      overdue_bills: [
        {
          id: 2,
          type: 'expense',
          amount: 200,
          description: 'Internet Bill',
          date: '2024-01-10',
          category_id: 1,
          category: { id: 1, name: 'Utilities', type: 'expense', color: '#ef4444', parent_id: null, created_at: '', updated_at: '' },
          priority_color: null,
          is_bill: true,
          bill_due_date: '2024-01-05',
          status: 'overdue',
          created_at: '',
          updated_at: '',
        },
      ],
      category_breakdown: [],
      recent_transactions: [
        {
          id: 3,
          type: 'income',
          amount: 5000,
          description: 'Salary',
          date: '2024-01-01',
          category_id: 2,
          category: { id: 2, name: 'Salary', type: 'income', color: '#22c55e', parent_id: null, created_at: '', updated_at: '' },
          priority_color: null,
          is_bill: false,
          bill_due_date: null,
          status: 'paid',
          created_at: '',
          updated_at: '',
        },
      ],
    }),
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

describe('Dashboard', () => {
  it('renders summary cards with correct values', async () => {
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText('$5000.00')).toBeInTheDocument()
    expect(screen.getByText('$3200.00')).toBeInTheDocument()
    expect(screen.getByText('$1800.00')).toBeInTheDocument()
  })

  it('renders upcoming bills section in red', async () => {
    renderWithProviders(<Dashboard />)

    const billsHeading = await screen.findByTestId('bills-heading')
    expect(billsHeading).toBeInTheDocument()
    expect(billsHeading).toHaveTextContent('Upcoming Bills')
  })

  it('renders bill cards', async () => {
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText('Electricity Bill')).toBeInTheDocument()
    expect(screen.getByText('Internet Bill')).toBeInTheDocument()
  })

  it('renders overdue indicator on overdue bills', async () => {
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText('Overdue!')).toBeInTheDocument()
  })

  it('renders recent transactions', async () => {
    renderWithProviders(<Dashboard />)

    expect(await screen.findByText('Salary')).toBeInTheDocument()
  })
})
