<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DailyAnalytics;
use App\Models\UserSubjectAnalytics;
use App\Models\UserTopicAnalytics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalyticsController extends Controller
{
    /**
     * Get overview analytics
     */
    public function overview(Request $request): JsonResponse
    {
        $user = $request->user();

        $subjectAnalytics = UserSubjectAnalytics::where('user_id', $user->id)
            ->with('subject:id,name')
            ->orderByDesc('accuracy')
            ->get();

        $totalAttempted = $subjectAnalytics->sum('total_questions_attempted');
        $totalCorrect = $subjectAnalytics->sum('correct_answers');
        $overallAccuracy = $totalAttempted > 0 ? round(($totalCorrect / $totalAttempted) * 100, 2) : 0;

        // FMGE Readiness calculation
        $fmgeReadiness = $this->calculateReadiness($user, $overallAccuracy);

        return response()->json([
            'success' => true,
            'data' => [
                'total_tests' => $user->total_tests_completed,
                'average_score' => $user->average_score,
                'total_questions_attempted' => $totalAttempted,
                'accuracy_rate' => $overallAccuracy,
                'streak_count' => $user->streak_count,
                'fmge_readiness_score' => $fmgeReadiness,
            ],
        ]);
    }

    /**
     * Get subject-wise performance
     */
    public function subjectPerformance(Request $request): JsonResponse
    {
        $user = $request->user();

        $analytics = UserSubjectAnalytics::where('user_id', $user->id)
            ->with('subject:id,name,icon,color')
            ->orderByDesc('total_questions_attempted')
            ->get()
            ->map(function ($item) {
                return [
                    'subject_id' => $item->subject_id,
                    'subject_name' => $item->subject->name ?? 'Unknown',
                    'icon' => $item->subject->icon ?? null,
                    'total_attempted' => $item->total_questions_attempted,
                    'correct' => $item->correct_answers,
                    'accuracy' => $item->accuracy,
                    'avg_time' => $item->average_time_per_question,
                ];
            });

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    /**
     * Get weakness analysis
     */
    public function weaknesses(Request $request): JsonResponse
    {
        $user = $request->user();

        // Weak subjects (accuracy < 60%, min 5 questions attempted)
        $weakSubjects = UserSubjectAnalytics::where('user_id', $user->id)
            ->where('total_questions_attempted', '>=', 5)
            ->where('accuracy', '<', 60)
            ->with('subject:id,name')
            ->orderBy('accuracy')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'subject_id' => $item->subject_id,
                'subject_name' => $item->subject->name,
                'accuracy' => $item->accuracy,
                'questions_attempted' => $item->total_questions_attempted,
            ]);

        // Weak topics
        $weakTopics = UserTopicAnalytics::where('user_id', $user->id)
            ->where('total_questions_attempted', '>=', 3)
            ->where('accuracy', '<', 50)
            ->with('topic:id,name,subject_id', 'topic.subject:id,name')
            ->orderBy('accuracy')
            ->limit(10)
            ->get()
            ->map(fn($item) => [
                'topic_id' => $item->topic_id,
                'topic_name' => $item->topic->name ?? 'Unknown',
                'subject_name' => $item->topic->subject->name ?? 'Unknown',
                'accuracy' => $item->accuracy,
                'questions_attempted' => $item->total_questions_attempted,
            ]);

        // Strong subjects (accuracy >= 70%)
        $strongSubjects = UserSubjectAnalytics::where('user_id', $user->id)
            ->where('total_questions_attempted', '>=', 5)
            ->where('accuracy', '>=', 70)
            ->with('subject:id,name')
            ->orderByDesc('accuracy')
            ->limit(5)
            ->get()
            ->map(fn($item) => [
                'subject_id' => $item->subject_id,
                'subject_name' => $item->subject->name,
                'accuracy' => $item->accuracy,
                'questions_attempted' => $item->total_questions_attempted,
            ]);

        // AI Recommendation
        $recommendation = $this->generateRecommendation($weakSubjects, $weakTopics);

        return response()->json([
            'success' => true,
            'data' => [
                'weak_subjects' => $weakSubjects,
                'weak_topics' => $weakTopics,
                'strong_subjects' => $strongSubjects,
                'recommendation' => $recommendation,
            ],
        ]);
    }

    /**
     * Get daily performance
     */
    public function dailyProgress(Request $request): JsonResponse
    {
        $days = $request->query('days', 30);

        $analytics = DailyAnalytics::where('user_id', $request->user()->id)
            ->where('date', '>=', now()->subDays($days))
            ->orderBy('date')
            ->get()
            ->map(fn($item) => [
                'date' => $item->date->format('Y-m-d'),
                'score' => $item->score,
                'tests_completed' => $item->tests_completed,
                'questions' => $item->questions_attempted,
                'accuracy' => $item->accuracy,
            ]);

        return response()->json([
            'success' => true,
            'data' => $analytics,
        ]);
    }

    private function calculateReadiness($user, float $accuracy): int
    {
        $scoreWeight = $accuracy * 0.5;
        $testsWeight = min(($user->total_tests_completed) / 60, 1) * 30;
        $streakWeight = min(($user->streak_count) / 30, 1) * 20;
        return (int) round($scoreWeight + $testsWeight + $streakWeight);
    }

    private function generateRecommendation($weakSubjects, $weakTopics): string
    {
        if ($weakSubjects->isEmpty() && $weakTopics->isEmpty()) {
            return "Great job! Your performance is consistent across all subjects. Keep practicing to maintain your scores.";
        }

        $subjects = $weakSubjects->take(2)->pluck('subject_name')->join(' and ');
        $topics = $weakTopics->take(2)->pluck('topic_name')->join(' and ');

        $message = "Focus on ";
        if ($subjects) {
            $message .= $subjects;
        }
        if ($topics) {
            $message .= ($subjects ? ", especially " : "") . $topics;
        }
        $message .= " this week. Practice at least 20 questions daily from these areas.";

        return $message;
    }
}
