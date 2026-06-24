<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Challenge;
use App\Models\ChallengeDay;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    /**
     * Get current challenge
     */
    public function current(Request $request): JsonResponse
    {
        $user = $request->user();

        $challenge = Challenge::where('user_id', $user->id)
            ->where('status', 'active')
            ->with('days')
            ->first();

        if (!$challenge) {
            return response()->json([
                'success' => true,
                'data' => [
                    'has_active_challenge' => false,
                    'message' => 'No active challenge. Start a new 30-day challenge!',
                ],
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'has_active_challenge' => true,
                'challenge' => $challenge,
            ],
        ]);
    }

    /**
     * Start new challenge
     */
    public function start(Request $request): JsonResponse
    {
        $user = $request->user();

        // Check if already has active challenge
        $activeChallenge = Challenge::where('user_id', $user->id)
            ->where('status', 'active')
            ->first();

        if ($activeChallenge) {
            return response()->json([
                'success' => false,
                'message' => 'You already have an active challenge',
                'data' => ['challenge' => $activeChallenge],
            ], 400);
        }

        // Create new challenge
        $challenge = Challenge::create([
            'user_id' => $user->id,
            'current_day' => 1,
            'total_days' => 30,
            'tests_completed' => 0,
            'average_score' => 0,
            'pass_percentage' => 60,
            'started_at' => now(),
            'status' => 'active',
        ]);

        // Create challenge days
        for ($day = 1; $day <= 30; $day++) {
            ChallengeDay::create([
                'challenge_id' => $challenge->id,
                'day_number' => $day,
                'date' => now()->addDays($day - 1)->toDateString(),
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => '30-Day Challenge started! Complete daily tests to unlock Grand Mock Exam.',
            'data' => ['challenge' => $challenge->load('days')],
        ], 201);
    }

    /**
     * Get challenge progress
     */
    public function progress(Request $request): JsonResponse
    {
        $user = $request->user();

        $challenge = Challenge::where('user_id', $user->id)
            ->whereIn('status', ['active', 'completed'])
            ->latest()
            ->with('days')
            ->first();

        if (!$challenge) {
            return response()->json([
                'success' => false,
                'message' => 'No challenge found',
            ], 404);
        }

        $completedDays = $challenge->days->where('test_completed', true)->count();
        $passedDays = $challenge->days->where('passed', true)->count();
        $overallPassRate = $completedDays > 0 ? round(($passedDays / $completedDays) * 100, 2) : 0;

        return response()->json([
            'success' => true,
            'data' => [
                'challenge' => $challenge,
                'completed_days' => $completedDays,
                'passed_days' => $passedDays,
                'overall_pass_rate' => $overallPassRate,
                'days_remaining' => $challenge->total_days - $completedDays,
                'grand_mock_unlocked' => $challenge->grand_mock_unlocked,
            ],
        ]);
    }
}
