<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Test;
use App\Models\UserSubjectAnalytics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubjectController extends Controller
{
    /**
     * Get all subjects with topic count
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $subjects = Subject::where('is_active', true)
            ->withCount(['questions' => function ($q) {
                $q->where('status', 'active');
            }])
            ->with(['topics' => function ($q) {
                $q->where('is_active', true)->withCount(['questions' => function ($q2) {
                    $q2->where('status', 'active');
                }]);
            }])
            ->orderBy('sort_order')
            ->get();

        // Add user progress
        $userAnalytics = UserSubjectAnalytics::where('user_id', $user->id)
            ->pluck('total_questions_attempted', 'subject_id');

        $subjects = $subjects->map(function ($subject) use ($userAnalytics) {
            $attempted = $userAnalytics[$subject->id] ?? 0;
            $totalQuestions = $subject->questions_count;
            $subject->progress = $totalQuestions > 0 ? round(($attempted / $totalQuestions) * 100) : 0;
            return $subject;
        });

        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }

    /**
     * Get subject details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $subject = Subject::where('is_active', true)
            ->withCount(['questions' => function ($q) {
                $q->where('status', 'active');
            }])
            ->with(['topics' => function ($q) {
                $q->where('is_active', true)
                    ->withCount(['questions' => function ($q2) {
                        $q2->where('status', 'active');
                    }])
                    ->with(['subtopics' => function ($q3) {
                        $q3->where('is_active', true);
                    }]);
            }])
            ->findOrFail($id);

        // User analytics for this subject
        $analytics = UserSubjectAnalytics::where('user_id', $request->user()->id)
            ->where('subject_id', $id)
            ->first();

        return response()->json([
            'success' => true,
            'data' => [
                'subject' => $subject,
                'analytics' => $analytics,
            ],
        ]);
    }

    /**
     * Get topics for a subject
     */
    public function getTopics(Request $request, int $subjectId): JsonResponse
    {
        $subject = Subject::findOrFail($subjectId);

        $topics = $subject->topics()
            ->where('is_active', true)
            ->withCount(['questions' => function ($q) {
                $q->where('status', 'active');
            }])
            ->with(['subtopics' => function ($q) {
                $q->where('is_active', true);
            }])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $topics,
        ]);
    }

    /**
     * Generate practice test for a subject/topic
     */
    public function getPracticeTest(Request $request, int $subjectId): JsonResponse
    {
        $user = $request->user();
        $topicId = $request->query('topic_id');
        $count = min($request->query('count', 30), 50);

        $query = Question::where('subject_id', $subjectId)
            ->where('status', 'active');

        if ($topicId) {
            $query->where('topic_id', $topicId);
        }

        $questions = $query->inRandomOrder()
            ->limit($count)
            ->pluck('id')
            ->toArray();

        if (empty($questions)) {
            return response()->json([
                'success' => false,
                'message' => 'No questions available for this subject/topic',
            ], 404);
        }

        // Create practice test
        $subject = Subject::find($subjectId);
        $test = Test::create([
            'title' => "Practice - {$subject->name}",
            'type' => 'practice',
            'subject_id' => $subjectId,
            'topic_id' => $topicId,
            'question_count' => count($questions),
            'duration_minutes' => count($questions), // 1 min per question
            'status' => 'active',
            'question_ids' => $questions,
        ]);

        return response()->json([
            'success' => true,
            'data' => [
                'test' => $test,
                'questions_count' => count($questions),
            ],
        ]);
    }
}
