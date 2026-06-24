<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaderboardEntry;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeaderboardController extends Controller
{
    /**
     * Get global leaderboard
     */
    public function index(Request $request): JsonResponse
    {
        $period = $request->query('period', 'weekly'); // weekly, monthly, all_time
        $page = $request->query('page', 1);
        $perPage = 20;

        $query = LeaderboardEntry::where('period', $period)
            ->with('user:id,name,avatar,university,country')
            ->orderByDesc('total_score');

        if ($period !== 'all_time') {
            $query->where('period_start', '>=', $this->getPeriodStart($period));
        }

        $entries = $query->paginate($perPage);

        // Get current user's rank
        $userEntry = LeaderboardEntry::where('user_id', $request->user()->id)
            ->where('period', $period)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'entries' => $entries->items(),
                'my_rank' => $userEntry?->rank,
                'my_score' => $userEntry?->total_score,
                'pagination' => [
                    'current_page' => $entries->currentPage(),
                    'last_page' => $entries->lastPage(),
                    'total' => $entries->total(),
                ],
            ],
        ]);
    }

    /**
     * Get university leaderboard
     */
    public function byUniversity(Request $request): JsonResponse
    {
        $university = $request->query('university', $request->user()->university);

        if (!$university) {
            return response()->json([
                'success' => false,
                'message' => 'University not specified',
            ], 400);
        }

        $entries = User::where('university', $university)
            ->where('total_tests_completed', '>', 0)
            ->orderByDesc('average_score')
            ->limit(50)
            ->get(['id', 'name', 'avatar', 'average_score', 'total_tests_completed', 'streak_count'])
            ->map(function ($user, $index) {
                return [
                    'rank' => $index + 1,
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'avatar' => $user->avatar,
                    'score' => $user->average_score,
                    'tests_completed' => $user->total_tests_completed,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $entries,
        ]);
    }

    /**
     * Get country leaderboard
     */
    public function byCountry(Request $request): JsonResponse
    {
        $country = $request->query('country', $request->user()->country ?? 'India');

        $entries = User::where('country', $country)
            ->where('total_tests_completed', '>', 0)
            ->orderByDesc('average_score')
            ->limit(50)
            ->get(['id', 'name', 'avatar', 'university', 'average_score', 'total_tests_completed'])
            ->map(function ($user, $index) {
                return [
                    'rank' => $index + 1,
                    'user_id' => $user->id,
                    'user_name' => $user->name,
                    'avatar' => $user->avatar,
                    'university' => $user->university,
                    'score' => $user->average_score,
                    'tests_completed' => $user->total_tests_completed,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $entries,
        ]);
    }

    private function getPeriodStart(string $period): string
    {
        return match ($period) {
            'weekly' => now()->startOfWeek()->toDateString(),
            'monthly' => now()->startOfMonth()->toDateString(),
            default => '2020-01-01',
        };
    }
}
