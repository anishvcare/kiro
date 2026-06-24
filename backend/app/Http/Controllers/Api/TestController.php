<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\UserAnswer;
use App\Models\UserSubjectAnalytics;
use App\Models\UserTopicAnalytics;
use App\Models\DailyAnalytics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TestController extends Controller
{
    /**
     * Get daily challenge (morning/evening)
     */
    public function getDailyChallenge(Request $request, string $type): JsonResponse
    {
        $user = $request->user();
        $today = today();
        $testType = "daily_{$type}";

        // Find or create today's test
        $test = Test::where('type', $testType)
            ->where('scheduled_date', $today)
            ->first();

        if (!$test) {
            // Auto-generate daily test
            $test = $this->generateDailyTest($testType, $today);
        }

        // Check if already attempted
        $attempt = TestAttempt::where('test_id', $test->id)
            ->where('user_id', $user->id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'test' => $test,
                'attempted' => $attempt !== null,
                'attempt' => $attempt,
                'questions_count' => $test->question_count,
                'duration_minutes' => $test->duration_minutes,
            ],
        ]);
    }

    /**
     * Start a test
     */
    public function startTest(Request $request, int $testId): JsonResponse
    {
        $user = $request->user();
        $test = Test::findOrFail($testId);

        // Check if already has active attempt
        $existingAttempt = TestAttempt::where('test_id', $testId)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->first();

        if ($existingAttempt) {
            // Return existing attempt with questions
            $questions = Question::whereIn('id', $test->question_ids)
                ->get(['id', 'question_text', 'question_type', 'options', 'difficulty', 'image_url', 'subject_id']);

            return response()->json([
                'success' => true,
                'data' => [
                    'attempt' => $existingAttempt,
                    'questions' => $questions,
                    'test' => $test,
                ],
            ]);
        }

        // Check if already completed
        $completedAttempt = TestAttempt::where('test_id', $testId)
            ->where('user_id', $user->id)
            ->where('status', 'completed')
            ->first();

        if ($completedAttempt) {
            return response()->json([
                'success' => false,
                'message' => 'You have already completed this test',
                'data' => ['attempt' => $completedAttempt],
            ], 400);
        }

        // Create new attempt
        $attempt = TestAttempt::create([
            'test_id' => $testId,
            'user_id' => $user->id,
            'total_questions' => $test->question_count,
            'started_at' => now(),
            'status' => 'in_progress',
        ]);

        // Get questions (without correct answer)
        $questions = Question::whereIn('id', $test->question_ids)
            ->get(['id', 'question_text', 'question_type', 'options', 'difficulty', 'image_url', 'subject_id']);

        return response()->json([
            'success' => true,
            'data' => [
                'attempt' => $attempt,
                'questions' => $questions,
                'test' => $test,
            ],
        ]);
    }

    /**
     * Submit answer for a question
     */
    public function submitAnswer(Request $request, int $attemptId): JsonResponse
    {
        $request->validate([
            'question_id' => 'required|integer|exists:questions,id',
            'selected_option' => 'required|string|in:A,B,C,D',
            'time_taken' => 'required|integer|min:0',
        ]);

        $attempt = TestAttempt::where('id', $attemptId)
            ->where('user_id', $request->user()->id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        $question = Question::findOrFail($request->question_id);
        $isCorrect = $question->correct_option === $request->selected_option;

        // Save or update answer
        UserAnswer::updateOrCreate(
            [
                'test_attempt_id' => $attemptId,
                'question_id' => $request->question_id,
            ],
            [
                'selected_option' => $request->selected_option,
                'is_correct' => $isCorrect,
                'time_taken_seconds' => $request->time_taken,
            ]
        );

        // Update question stats
        $question->increment('times_attempted');
        if ($isCorrect) {
            $question->increment('times_correct');
        }

        return response()->json([
            'success' => true,
            'data' => [
                'is_correct' => $isCorrect,
                'correct_option' => $question->correct_option,
                'explanation' => $question->explanation,
                'learning_point' => $question->learning_point,
                'reference' => $question->reference,
            ],
        ]);
    }

    /**
     * Complete a test
     */
    public function completeTest(Request $request, int $attemptId): JsonResponse
    {
        $user = $request->user();

        $attempt = TestAttempt::where('id', $attemptId)
            ->where('user_id', $user->id)
            ->where('status', 'in_progress')
            ->firstOrFail();

        // Calculate results
        $answers = $attempt->answers;
        $correctCount = $answers->where('is_correct', true)->count();
        $wrongCount = $answers->where('is_correct', false)->count();
        $skipped = $attempt->total_questions - $answers->count();
        $totalTime = $answers->sum('time_taken_seconds');
        $percentage = $attempt->total_questions > 0
            ? round(($correctCount / $attempt->total_questions) * 100, 2)
            : 0;

        // Update attempt
        $attempt->update([
            'score' => $correctCount,
            'correct_answers' => $correctCount,
            'wrong_answers' => $wrongCount,
            'skipped' => $skipped,
            'percentage' => $percentage,
            'time_taken_seconds' => $totalTime,
            'status' => 'completed',
            'completed_at' => now(),
        ]);

        // Update user stats
        $user->increment('total_tests_completed');
        $this->updateUserAverageScore($user);

        // Update streak
        $streak = $user->streak ?? UserStreak::create(['user_id' => $user->id]);
        $streak->updateStreak();

        // Update analytics
        $this->updateAnalytics($user, $attempt);

        // Calculate rank
        $rank = TestAttempt::where('test_id', $attempt->test_id)
            ->where('status', 'completed')
            ->where('percentage', '>', $percentage)
            ->count() + 1;
        $attempt->update(['rank' => $rank]);

        return response()->json([
            'success' => true,
            'data' => [
                'score' => $correctCount,
                'total_questions' => $attempt->total_questions,
                'correct_answers' => $correctCount,
                'wrong_answers' => $wrongCount,
                'skipped' => $skipped,
                'percentage' => $percentage,
                'time_taken' => $totalTime,
                'rank' => $rank,
                'subject_performance' => $attempt->getSubjectPerformance(),
            ],
        ]);
    }

    /**
     * Get test result
     */
    public function getTestResult(Request $request, int $attemptId): JsonResponse
    {
        $attempt = TestAttempt::where('id', $attemptId)
            ->where('user_id', $request->user()->id)
            ->with(['answers.question.subject', 'test'])
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'data' => [
                'attempt' => $attempt,
                'subject_performance' => $attempt->getSubjectPerformance(),
            ],
        ]);
    }

    /**
     * Get Grand Mock exam
     */
    public function getGrandMock(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user->hasGrandMockAccess()) {
            return response()->json([
                'success' => false,
                'message' => 'Complete the 30-Day Challenge to unlock Grand Mock Exam',
            ], 403);
        }

        // Find or create grand mock
        $test = Test::where('type', 'grand_mock')
            ->where('status', 'active')
            ->latest()
            ->first();

        if (!$test) {
            $test = $this->generateGrandMock();
        }

        return response()->json([
            'success' => true,
            'data' => [
                'test' => $test,
                'questions_count' => 300,
                'duration_minutes' => 300,
            ],
        ]);
    }

    // Private helper methods

    private function generateDailyTest(string $type, $date): Test
    {
        $subjects = Subject::where('is_active', true)->get();
        $questionIds = [];
        $totalNeeded = 30;

        // Weighted distribution based on question_weight
        $totalWeight = $subjects->sum('question_weight');

        foreach ($subjects as $subject) {
            $count = max(1, round(($subject->question_weight / $totalWeight) * $totalNeeded));
            $subjectQuestions = Question::where('subject_id', $subject->id)
                ->where('status', 'active')
                ->inRandomOrder()
                ->limit($count)
                ->pluck('id')
                ->toArray();
            $questionIds = array_merge($questionIds, $subjectQuestions);
        }

        // Ensure exactly 30 questions
        $questionIds = array_slice(array_unique($questionIds), 0, $totalNeeded);

        // If not enough, fill from random questions
        if (count($questionIds) < $totalNeeded) {
            $moreQuestions = Question::where('status', 'active')
                ->whereNotIn('id', $questionIds)
                ->inRandomOrder()
                ->limit($totalNeeded - count($questionIds))
                ->pluck('id')
                ->toArray();
            $questionIds = array_merge($questionIds, $moreQuestions);
        }

        $title = $type === 'daily_morning'
            ? 'Morning Challenge - ' . $date->format('d M Y')
            : 'Evening Challenge - ' . $date->format('d M Y');

        return Test::create([
            'title' => $title,
            'type' => $type,
            'question_count' => 30,
            'duration_minutes' => 30,
            'scheduled_date' => $date,
            'scheduled_time' => $type === 'daily_morning' ? '09:00:00' : '19:00:00',
            'status' => 'active',
            'question_ids' => $questionIds,
        ]);
    }

    private function generateGrandMock(): Test
    {
        $questionIds = Question::where('status', 'active')
            ->inRandomOrder()
            ->limit(300)
            ->pluck('id')
            ->toArray();

        return Test::create([
            'title' => 'FMGE Grand Mock Exam',
            'type' => 'grand_mock',
            'question_count' => 300,
            'duration_minutes' => 300,
            'status' => 'active',
            'question_ids' => $questionIds,
        ]);
    }

    private function updateUserAverageScore($user): void
    {
        $avgScore = TestAttempt::where('user_id', $user->id)
            ->where('status', 'completed')
            ->avg('percentage') ?? 0;

        $user->update(['average_score' => round($avgScore, 2)]);
    }

    private function updateAnalytics($user, $attempt): void
    {
        $answers = $attempt->answers()->with('question')->get();

        // Update subject analytics
        $subjectData = $answers->groupBy('question.subject_id');
        foreach ($subjectData as $subjectId => $subjectAnswers) {
            $analytics = UserSubjectAnalytics::firstOrCreate(
                ['user_id' => $user->id, 'subject_id' => $subjectId]
            );
            $analytics->total_questions_attempted += $subjectAnswers->count();
            $analytics->correct_answers += $subjectAnswers->where('is_correct', true)->count();
            $analytics->total_time_seconds += $subjectAnswers->sum('time_taken_seconds');
            $analytics->recalculate();
        }

        // Update topic analytics
        $topicData = $answers->groupBy('question.topic_id');
        foreach ($topicData as $topicId => $topicAnswers) {
            $analytics = UserTopicAnalytics::firstOrCreate(
                ['user_id' => $user->id, 'topic_id' => $topicId]
            );
            $analytics->total_questions_attempted += $topicAnswers->count();
            $analytics->correct_answers += $topicAnswers->where('is_correct', true)->count();
            $analytics->accuracy = $analytics->total_questions_attempted > 0
                ? ($analytics->correct_answers / $analytics->total_questions_attempted) * 100
                : 0;
            $analytics->save();
        }

        // Update daily analytics
        DailyAnalytics::updateOrCreate(
            ['user_id' => $user->id, 'date' => today()],
            [
                'tests_completed' => DB::raw('tests_completed + 1'),
                'questions_attempted' => DB::raw("questions_attempted + {$answers->count()}"),
                'correct_answers' => DB::raw("correct_answers + {$answers->where('is_correct', true)->count()}"),
                'time_spent_seconds' => DB::raw("time_spent_seconds + {$answers->sum('time_taken_seconds')}"),
                'accuracy' => $answers->count() > 0
                    ? round(($answers->where('is_correct', true)->count() / $answers->count()) * 100, 2)
                    : 0,
                'score' => $attempt->percentage,
            ]
        );
    }
}
