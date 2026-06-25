<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Referral;
use App\Models\ReferralSetting;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController extends Controller
{
    /**
     * Get referral dashboard for current user
     */
    public function dashboard(Request $request): JsonResponse
    {
        $user = $request->user();

        $referrals = Referral::where('referrer_id', $user->id)
            ->with(['contact', 'lead'])
            ->orderBy('created_at', 'desc')
            ->get();

        $stats = [
            'total_referrals' => $referrals->count(),
            'pending' => $referrals->where('status', 'pending')->count(),
            'qualified' => $referrals->where('status', 'qualified')->count(),
            'converted' => $referrals->where('status', 'converted')->count(),
            'total_earned' => $referrals->where('status', 'paid')->sum('commission_amount'),
            'pending_payout' => $referrals->where('status', 'converted')->sum('commission_amount'),
        ];

        return response()->json([
            'referral_code' => $user->referral_code,
            'referral_link' => url("/ref/{$user->referral_code}"),
            'stats' => $stats,
            'referrals' => $referrals,
        ]);
    }

    /**
     * Admin: List all referrals
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isManager()) {
            abort(403);
        }

        $referrals = Referral::where('team_id', $user->team_id)
            ->with(['referrer', 'contact', 'lead'])
            ->orderBy('created_at', 'desc')
            ->paginate(50);

        return response()->json($referrals);
    }

    /**
     * Update referral settings
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin()) {
            abort(403);
        }

        $request->validate([
            'default_commission_rate' => 'nullable|numeric|min:0|max:100',
            'min_payout' => 'nullable|numeric|min:0',
            'payout_method' => 'nullable|string',
            'is_active' => 'nullable|boolean',
        ]);

        $settings = ReferralSetting::updateOrCreate(
            ['team_id' => $user->team_id],
            $request->only(['default_commission_rate', 'min_payout', 'payout_method', 'is_active'])
        );

        return response()->json(['settings' => $settings]);
    }

    /**
     * Mark referral as paid
     */
    public function markPaid(Request $request, Referral $referral): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() || $referral->team_id !== $user->team_id) {
            abort(403);
        }

        $referral->update([
            'status' => 'paid',
            'paid_at' => now(),
        ]);

        return response()->json(['referral' => $referral->fresh()]);
    }
}
