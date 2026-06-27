<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard summary data.
     */
    public function index(Request $request): JsonResponse
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $endOfMonth = $now->copy()->endOfMonth();

        // Monthly totals
        $monthlyIncome = Transaction::where('type', 'income')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        $monthlyExpense = Transaction::where('type', 'expense')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->sum('amount');

        // Upcoming bills (pending/overdue)
        $upcomingBills = Transaction::with('category')
            ->where('is_bill', true)
            ->whereIn('status', ['pending', 'overdue'])
            ->orderBy('bill_due_date', 'asc')
            ->limit(10)
            ->get();

        // Overdue bills
        $overdueBills = Transaction::with('category')
            ->where('is_bill', true)
            ->where('status', 'overdue')
            ->orderBy('bill_due_date', 'asc')
            ->get();

        // Recent transactions
        $recentTransactions = Transaction::with('category')
            ->orderBy('date', 'desc')
            ->limit(10)
            ->get();

        // Category-wise expense breakdown for current month
        $categoryBreakdown = Transaction::where('type', 'expense')
            ->whereBetween('date', [$startOfMonth, $endOfMonth])
            ->selectRaw('category_id, SUM(amount) as total')
            ->groupBy('category_id')
            ->with('category')
            ->get()
            ->map(function ($item) {
                return [
                    'category_id' => $item->category_id,
                    'category_name' => $item->category?->name,
                    'category_color' => $item->category?->color,
                    'total' => $item->total,
                ];
            });

        return response()->json([
            'monthly_summary' => [
                'income' => $monthlyIncome,
                'expense' => $monthlyExpense,
                'balance' => $monthlyIncome - $monthlyExpense,
            ],
            'upcoming_bills' => TransactionResource::collection($upcomingBills),
            'overdue_bills' => TransactionResource::collection($overdueBills),
            'recent_transactions' => TransactionResource::collection($recentTransactions),
            'category_breakdown' => $categoryBreakdown,
        ]);
    }
}
