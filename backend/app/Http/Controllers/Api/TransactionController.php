<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTransactionRequest;
use App\Http\Requests\UpdateTransactionRequest;
use App\Http\Resources\TransactionResource;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    /**
     * Display a listing of transactions.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Transaction::with('category');

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('is_bill')) {
            $query->where('is_bill', $request->boolean('is_bill'));
        }

        if ($request->has('date_from')) {
            $query->whereDate('date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->whereDate('date', '<=', $request->date_to);
        }

        $transactions = $query->orderBy('date', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json([
            'transactions' => TransactionResource::collection($transactions),
            'meta' => [
                'current_page' => $transactions->currentPage(),
                'last_page' => $transactions->lastPage(),
                'per_page' => $transactions->perPage(),
                'total' => $transactions->total(),
            ],
        ]);
    }

    /**
     * Store a newly created transaction.
     */
    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $data = $request->validated();
        $data['user_id'] = $request->user()->id;

        $transaction = Transaction::create($data);
        $transaction->load('category');

        return response()->json([
            'message' => 'Transaction created successfully',
            'transaction' => new TransactionResource($transaction),
        ], 201);
    }

    /**
     * Display the specified transaction.
     */
    public function show(Transaction $transaction): JsonResponse
    {
        $transaction->load('category');

        return response()->json([
            'transaction' => new TransactionResource($transaction),
        ]);
    }

    /**
     * Update the specified transaction.
     */
    public function update(UpdateTransactionRequest $request, Transaction $transaction): JsonResponse
    {
        $transaction->update($request->validated());
        $transaction->load('category');

        return response()->json([
            'message' => 'Transaction updated successfully',
            'transaction' => new TransactionResource($transaction),
        ]);
    }

    /**
     * Remove the specified transaction.
     */
    public function destroy(Transaction $transaction): JsonResponse
    {
        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully',
        ]);
    }
}
