<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\ProfileSummaryResource;
use App\Models\Interest;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Matrimony dashboard summary for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile()->with('photos')->first();

        $pendingReceived = Interest::where('receiver_id', $user->id)
            ->where('status', 'pending')->count();

        $sentCount = Interest::where('sender_id', $user->id)->count();

        // Mutual matches: interests accepted in either direction.
        $matches = Interest::where('status', 'accepted')
            ->where(function ($q) use ($user) {
                $q->where('sender_id', $user->id)->orWhere('receiver_id', $user->id);
            })->count();

        // Recommended profiles: opposite of what the member is looking for, else any.
        $recommendQuery = Profile::query()->where('user_id', '!=', $user->id);
        if ($profile && $profile->looking_for) {
            $recommendQuery->where('gender', $profile->looking_for);
        } elseif ($profile && $profile->gender) {
            $recommendQuery->where('gender', $profile->gender === 'male' ? 'female' : 'male');
        }
        $recommended = $recommendQuery->latest()->limit(6)->get();

        return response()->json([
            'profile' => $profile ? new ProfileResource($profile) : null,
            'has_profile' => (bool) $profile,
            'stats' => [
                'completeness' => $profile?->completeness ?? 0,
                'interests_received' => $pendingReceived,
                'interests_sent' => $sentCount,
                'matches' => $matches,
            ],
            'recommended' => ProfileSummaryResource::collection($recommended),
        ]);
    }
}
