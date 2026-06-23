<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class SubscriptionController extends Controller
{
    /**
     * Get available plans
     */
    public function plans(): JsonResponse
    {
        $plans = SubscriptionPlan::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $plans,
        ]);
    }

    /**
     * Subscribe to a plan
     */
    public function subscribe(Request $request): JsonResponse
    {
        $request->validate([
            'plan' => 'required|string|exists:subscription_plans,slug',
            'payment_method' => 'required|string|in:razorpay,stripe',
            'payment_id' => 'required|string',
        ]);

        $user = $request->user();
        $plan = SubscriptionPlan::where('slug', $request->plan)->firstOrFail();

        // Verify payment (in production, verify with payment gateway)
        // $this->verifyPayment($request->payment_method, $request->payment_id, $plan->price);

        // Create subscription
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'payment_id' => $request->payment_id,
            'payment_method' => $request->payment_method,
            'amount_paid' => $plan->price,
            'currency' => $plan->currency,
            'starts_at' => now(),
            'expires_at' => now()->addDays($plan->duration_days),
        ]);

        // Update user
        $user->update([
            'subscription_plan' => 'premium',
            'subscription_expires_at' => $subscription->expires_at,
        ]);

        // Create invoice
        $tax = $plan->price * 0.18; // 18% GST
        Invoice::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'invoice_number' => 'INV-' . strtoupper(Str::random(8)),
            'amount' => $plan->price,
            'tax' => $tax,
            'total' => $plan->price + $tax,
            'currency' => $plan->currency,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription activated successfully!',
            'data' => ['subscription' => $subscription->load('plan')],
        ]);
    }

    /**
     * Cancel subscription
     */
    public function cancel(Request $request): JsonResponse
    {
        $user = $request->user();
        $subscription = $user->activeSubscription;

        if (!$subscription) {
            return response()->json([
                'success' => false,
                'message' => 'No active subscription found',
            ], 404);
        }

        $subscription->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subscription cancelled. You can still access premium until ' . $subscription->expires_at->format('d M Y'),
        ]);
    }

    /**
     * Get invoices
     */
    public function invoices(Request $request): JsonResponse
    {
        $invoices = Invoice::where('user_id', $request->user()->id)
            ->with('subscription.plan')
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $invoices,
        ]);
    }
}
