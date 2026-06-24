<?php

namespace App\Services;

use App\Models\DailyAnalytics;
use App\Models\LeaderboardEntry;
use App\Models\TestAttempt;
use App\Models\User;
use App\Models\UserSubjectAnalytics;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Calculate FMGE readiness score for a user
     */
    public function calculateFMGEReadiness(User $user): int
    {
        $accuracy = $user->average_score ?? 0;
        $scoreWeight = $accuracy * 0.5;
        $testsWeight = min(($user->total_tests_completed ?? 0) / 60, 1) * 30;
        $streakWeight = min(($user->streak_count ?? 0) / 30, 1) * 20;

        return (int) round($scoreWeight + $testsWeight + $streakWeight);
    }

    /**
     * Get weak subjects for a user (accuracy < threshold)
     */
    public function getWeakSubjects(int $userId, float $threshold = 60.0, int $minAttempts = 5): array
    {
        return UserSubjectAnalytics::where('user_id', $userId)
            ->where('total_questions_attempted', '>=', $minAttempts)
            ->where('accuracy', '<', $threshold)
            ->with('subject:id,name,icon')
            ->orderBy('accuracy')
            ->limit(5)
            ->get()
            ->map(fn($a) => [
                'subject_id' => $a->subject_id,
                'subject_name' => $a->subject->name,
                'icon' => $a->subject->icon,
                'accuracy' => $a->accuracy,
                'attempted' => $a->total_questions_attempted,
            ])
            ->toArray();
    }

    /**
     * Update leaderboard rankings
     */
    public function updateLeaderboard(): void
    {
        $this->updatePeriodLeaderboard('weekly', now()->startOfWeek());
        $this->updatePeriodLeaderboard('monthly', now()->startOfMonth());
        $this->updatePeriodLeaderboard('all_time', null);
    }

    private function updatePeriodLeaderboard(string $period, ?\Carbon\Carbon $startDate): void
    {
        $query = TestAttempt::where('status', 'completed')
            ->selectRaw('user_id, SUM(score) as total_score, COUNT(*) as tests_completed, AVG(percentage) as accuracy');

        if ($startDate) {
            $query->where('completed_at', '>=', $startDate);
        }

        $results = $query->groupBy('user_id')
            ->orderByDesc('total_score')
            ->limit(1000)
            ->get();

        $rank = 1;
        foreach ($results as $result) {
            LeaderboardEntry::updateOrCreate(
                [
                    'user_id' => $result->user_id,
                    'period' => $period,
                    'period_start' => $startDate?->toDateString(),
                ],
                [
                    'total_score' => $result->total_score,
                    'tests_completed' => $result->tests_completed,
                    'accuracy' => round($result->accuracy, 2),
                    'streak_count' => User::find($result->user_id)?->streak_count ?? 0,
                    'period_end' => now()->toDateString(),
                    'rank' => $rank,
                ]
            );
            $rank++;
        }
    }

    /**
     * Generate platform-wide report
     */
    public function generateDailyReport(): array
    {
        $today = today();

        return [
            'date' => $today->format('Y-m-d'),
            'new_users' => User::whereDate('created_at', $today)->count(),
            'active_users' => User::where('last_activity_date', $today)->count(),
            'tests_completed' => TestAttempt::whereDate('completed_at', $today)->count(),
            'questions_answered' => DB::table('user_answers')->whereDate('created_at', $today)->count(),
            'avg_score' => TestAttempt::whereDate('completed_at', $today)->avg('percentage') ?? 0,
            'premium_conversions' => DB::table('subscriptions')->whereDate('created_at', $today)->count(),
            'revenue' => DB::table('subscriptions')->whereDate('created_at', $today)->sum('amount_paid'),
        ];
    }
}
