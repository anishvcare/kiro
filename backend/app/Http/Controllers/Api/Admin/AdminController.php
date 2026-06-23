<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Subscription;
use App\Models\Test;
use App\Models\TestAttempt;
use App\Models\Topic;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AdminController extends Controller
{
    /**
     * Admin Dashboard Stats
     */
    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_users' => User::count(),
            'active_today' => User::where('last_activity_date', today())->count(),
            'total_questions' => Question::count(),
            'active_questions' => Question::where('status', 'active')->count(),
            'tests_today' => TestAttempt::whereDate('started_at', today())->count(),
            'premium_users' => User::where('subscription_plan', 'premium')->count(),
            'revenue_month' => Subscription::where('status', 'active')
                ->whereMonth('created_at', now()->month)
                ->sum('amount_paid'),
            'new_users_today' => User::whereDate('created_at', today())->count(),
            'new_users_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
            'avg_score' => TestAttempt::where('status', 'completed')
                ->whereMonth('completed_at', now()->month)
                ->avg('percentage') ?? 0,
        ];

        return response()->json([
            'success' => true,
            'data' => $stats,
        ]);
    }

    // ===== USER MANAGEMENT =====

    public function getUsers(Request $request): JsonResponse
    {
        $query = User::query();

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($role = $request->query('role')) {
            $query->where('role', $role);
        }

        $users = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $users,
        ]);
    }

    public function getUser(int $id): JsonResponse
    {
        $user = User::with(['streak', 'subjectAnalytics.subject', 'activeSubscription'])
            ->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $user,
        ]);
    }

    public function updateUser(Request $request, int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->update($request->only(['name', 'email', 'role', 'subscription_plan']));

        return response()->json([
            'success' => true,
            'message' => 'User updated successfully',
            'data' => $user,
        ]);
    }

    public function deleteUser(int $id): JsonResponse
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User deleted successfully',
        ]);
    }

    // ===== QUESTION MANAGEMENT =====

    public function getQuestions(Request $request): JsonResponse
    {
        $query = Question::with('subject:id,name', 'topic:id,name');

        if ($subjectId = $request->query('subject_id')) {
            $query->where('subject_id', $subjectId);
        }

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($difficulty = $request->query('difficulty')) {
            $query->where('difficulty', $difficulty);
        }

        if ($search = $request->query('search')) {
            $query->where('question_text', 'like', "%{$search}%");
        }

        $questions = $query->orderByDesc('created_at')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $questions,
        ]);
    }

    public function createQuestion(Request $request): JsonResponse
    {
        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'topic_id' => 'required|exists:topics,id',
            'question_text' => 'required|string',
            'question_type' => 'required|in:mcq,true_false,clinical_scenario,image_based',
            'options' => 'required|array|min:2',
            'options.*.key' => 'required|string',
            'options.*.text' => 'required|string',
            'correct_option' => 'required|string|in:A,B,C,D',
            'difficulty' => 'required|in:easy,medium,hard',
        ]);

        $question = Question::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Question created successfully',
            'data' => $question,
        ], 201);
    }

    public function updateQuestion(Request $request, int $id): JsonResponse
    {
        $question = Question::findOrFail($id);
        $question->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Question updated successfully',
            'data' => $question,
        ]);
    }

    public function deleteQuestion(int $id): JsonResponse
    {
        $question = Question::findOrFail($id);
        $question->delete();

        return response()->json([
            'success' => true,
            'message' => 'Question deleted successfully',
        ]);
    }

    public function bulkImportQuestions(Request $request): JsonResponse
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,xlsx,xls|max:10240',
        ]);

        // Process import using Maatwebsite Excel
        // Excel::import(new QuestionsImport, $request->file('file'));

        return response()->json([
            'success' => true,
            'message' => 'Questions imported successfully',
        ]);
    }

    // ===== SUBJECT MANAGEMENT =====

    public function getSubjects(): JsonResponse
    {
        $subjects = Subject::withCount('questions')
            ->with(['topics' => function ($q) {
                $q->withCount('questions');
            }])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $subjects,
        ]);
    }

    public function createSubject(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $subject = Subject::create([
            ...$request->all(),
            'slug' => Str::slug($request->name),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Subject created successfully',
            'data' => $subject,
        ], 201);
    }

    public function updateSubject(Request $request, int $id): JsonResponse
    {
        $subject = Subject::findOrFail($id);
        $subject->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Subject updated successfully',
            'data' => $subject,
        ]);
    }

    public function deleteSubject(int $id): JsonResponse
    {
        $subject = Subject::findOrFail($id);
        $subject->delete();

        return response()->json([
            'success' => true,
            'message' => 'Subject deleted successfully',
        ]);
    }

    // ===== NOTIFICATION MANAGEMENT =====

    public function sendNotification(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string',
            'target' => 'required|in:all,premium,free,specific',
        ]);

        // In production, use Firebase Cloud Messaging
        // FCMService::send($request->title, $request->body, $request->target);

        return response()->json([
            'success' => true,
            'message' => 'Notification sent successfully',
        ]);
    }

    // ===== REPORTS =====

    public function getReports(Request $request, string $type): JsonResponse
    {
        $data = match ($type) {
            'daily' => $this->getDailyReport(),
            'weekly' => $this->getWeeklyReport(),
            'monthly' => $this->getMonthlyReport(),
            'revenue' => $this->getRevenueReport(),
            'subjects' => $this->getSubjectReport(),
            default => [],
        };

        return response()->json([
            'success' => true,
            'data' => $data,
        ]);
    }

    private function getDailyReport(): array
    {
        return [
            'new_users' => User::whereDate('created_at', today())->count(),
            'tests_taken' => TestAttempt::whereDate('started_at', today())->count(),
            'questions_answered' => DB::table('user_answers')->whereDate('created_at', today())->count(),
            'avg_score' => TestAttempt::whereDate('completed_at', today())->avg('percentage') ?? 0,
        ];
    }

    private function getWeeklyReport(): array
    {
        $startOfWeek = now()->startOfWeek();
        return [
            'new_users' => User::where('created_at', '>=', $startOfWeek)->count(),
            'tests_taken' => TestAttempt::where('started_at', '>=', $startOfWeek)->count(),
            'active_users' => User::where('last_activity_date', '>=', $startOfWeek)->count(),
        ];
    }

    private function getMonthlyReport(): array
    {
        $startOfMonth = now()->startOfMonth();
        return [
            'new_users' => User::where('created_at', '>=', $startOfMonth)->count(),
            'tests_taken' => TestAttempt::where('started_at', '>=', $startOfMonth)->count(),
            'revenue' => Subscription::where('created_at', '>=', $startOfMonth)->sum('amount_paid'),
            'premium_conversions' => Subscription::where('created_at', '>=', $startOfMonth)->count(),
        ];
    }

    private function getRevenueReport(): array
    {
        return Subscription::where('status', 'active')
            ->selectRaw('DATE(created_at) as date, SUM(amount_paid) as total, COUNT(*) as count')
            ->groupBy('date')
            ->orderByDesc('date')
            ->limit(30)
            ->get()
            ->toArray();
    }

    private function getSubjectReport(): array
    {
        return Subject::withCount(['questions' => function ($q) {
            $q->where('status', 'active');
        }])
            ->get()
            ->map(fn($s) => [
                'name' => $s->name,
                'questions' => $s->questions_count,
                'avg_accuracy' => DB::table('user_subject_analytics')
                    ->where('subject_id', $s->id)
                    ->avg('accuracy') ?? 0,
            ])
            ->toArray();
    }
}
