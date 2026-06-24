<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\UserSubjectAnalytics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    /**
     * Get dashboard stats
     */
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        // Get weak subjects (accuracy < 60%)
        $weakSubjects = UserSubjectAnalytics::where('user_id', $user->id)
            ->where('total_questions_attempted', '>', 5)
            ->where('accuracy', '<', 60)
            ->orderBy('accuracy')
            ->limit(5)
            ->with('subject:id,name')
            ->get();

        // Calculate FMGE readiness
        $fmgeReadiness = $this->calculateFMGEReadiness($user);

        // Grand Mock eligibility
        $grandMockEligible = $user->hasGrandMockAccess();

        return response()->json([
            'success' => true,
            'data' => [
                'streak_count' => $user->streak_count,
                'total_tests_completed' => $user->total_tests_completed,
                'average_score' => $user->average_score,
                'fmge_readiness' => $fmgeReadiness,
                'weak_subjects' => $weakSubjects,
                'grand_mock_eligible' => $grandMockEligible,
                'subscription_plan' => $user->subscription_plan,
            ],
        ]);
    }

    /**
     * Get today's tests
     */
    public function todayTests(Request $request): JsonResponse
    {
        $user = $request->user();
        $today = today();

        // Get today's daily tests
        $morningTest = Test::where('type', 'daily_morning')
            ->where('scheduled_date', $today)
            ->first();

        $eveningTest = Test::where('type', 'daily_evening')
            ->where('scheduled_date', $today)
            ->first();

        // Check if user has completed them
        $morningCompleted = $morningTest ? TestAttempt::where('test_id', $morningTest->id)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->first() : null;

        $eveningCompleted = $eveningTest ? TestAttempt::where('test_id', $eveningTest->id)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->first() : null;

        return response()->json([
            'success' => true,
            'data' => [
                'morning' => [
                    'test' => $morningTest,
                    'completed' => $morningCompleted !== null,
                    'attempt' => $morningCompleted,
                    'time' => '9:00 AM',
                ],
                'evening' => [
                    'test' => $eveningTest,
                    'completed' => $eveningCompleted !== null,
                    'attempt' => $eveningCompleted,
                    'time' => '7:00 PM',
                ],
            ],
        ]);
    }

    private function calculateFMGEReadiness($user): int
    {
        $scoreWeight = ($user->average_score ?? 0) * 0.5;
        $testsWeight = min(($user->total_tests_completed ?? 0) / 30, 1) * 30;
        $streakWeight = min(($user->streak_count ?? 0) / 30, 1) * 20;

        return (int) round($scoreWeight + $testsWeight + $streakWeight);
    }
}
