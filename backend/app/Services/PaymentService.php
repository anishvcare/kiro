<?php

namespace App\Services;

use App\Models\Invoice;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PaymentService
{
    /**
     * Create Razorpay order
     */
    public function createRazorpayOrder(SubscriptionPlan $plan, User $user): array
    {
        $keyId = config('services.razorpay.key_id');
        $keySecret = config('services.razorpay.key_secret');

        if (!$keyId || !$keySecret) {
            throw new \Exception('Razorpay not configured');
        }

        $response = Http::withBasicAuth($keyId, $keySecret)
            ->post('https://api.razorpay.com/v1/orders', [
                'amount' => (int) ($plan->price * 100), // In paise
                'currency' => 'INR',
                'receipt' => 'order_' . Str::random(10),
                'notes' => [
                    'user_id' => $user->id,
                    'plan_id' => $plan->id,
                    'plan_name' => $plan->name,
                ],
            ]);

        if ($response->failed()) {
            Log::error('Razorpay: Order creation failed', ['response' => $response->body()]);
            throw new \Exception('Failed to create payment order');
        }

        return $response->json();
    }

    /**
     * Verify Razorpay payment
     */
    public function verifyRazorpayPayment(string $orderId, string $paymentId, string $signature): bool
    {
        $keySecret = config('services.razorpay.key_secret');
        $generated = hash_hmac('sha256', $orderId . '|' . $paymentId, $keySecret);

        return hash_equals($generated, $signature);
    }

    /**
     * Activate subscription after payment verification
     */
    public function activateSubscription(User $user, SubscriptionPlan $plan, string $paymentId, string $paymentMethod): Subscription
    {
        // Cancel any existing active subscription
        Subscription::where('user_id', $user->id)
            ->where('status', 'active')
            ->update(['status' => 'expired']);

        // Create new subscription
        $subscription = Subscription::create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'payment_id' => $paymentId,
            'payment_method' => $paymentMethod,
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

        // Generate invoice
        $tax = round($plan->price * 0.18, 2); // 18% GST
        Invoice::create([
            'user_id' => $user->id,
            'subscription_id' => $subscription->id,
            'invoice_number' => 'INV-' . date('Ymd') . '-' . strtoupper(Str::random(6)),
            'amount' => $plan->price,
            'tax' => $tax,
            'total' => $plan->price + $tax,
            'currency' => $plan->currency,
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return $subscription;
    }

    /**
     * Handle subscription expiry (called by scheduler)
     */
    public function handleExpirations(): int
    {
        $expired = Subscription::where('status', 'active')
            ->where('expires_at', '<', now())
            ->get();

        foreach ($expired as $subscription) {
            $subscription->update(['status' => 'expired']);
            $subscription->user->update([
                'subscription_plan' => 'free',
                'subscription_expires_at' => null,
            ]);
        }

        return $expired->count();
    }
}
