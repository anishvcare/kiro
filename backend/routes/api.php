<?php

use App\Http\Controllers\Api\AnalyticsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ChallengeController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\LeaderboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SubjectController;
use App\Http\Controllers\Api\SubscriptionController;
use App\Http\Controllers\Api\TestController;
use App\Http\Controllers\Api\Admin\AdminController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - FMGE Daily Trainer
|--------------------------------------------------------------------------
*/

// ===== Authentication Routes (Public) =====
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/google', [AuthController::class, 'googleLogin']);
    Route::post('/otp/send', [AuthController::class, 'sendOTP']);
    Route::post('/otp/verify', [AuthController::class, 'verifyOTP']);
    Route::post('/forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AuthController::class, 'resetPassword']);
});

// ===== Protected Routes (Require Authentication) =====
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/today-tests', [DashboardController::class, 'todayTests']);

    // Tests
    Route::get('/tests/daily/{type}', [TestController::class, 'getDailyChallenge'])
        ->where('type', 'morning|evening');
    Route::post('/tests/{testId}/start', [TestController::class, 'startTest']);
    Route::post('/tests/attempts/{attemptId}/answer', [TestController::class, 'submitAnswer']);
    Route::post('/tests/attempts/{attemptId}/complete', [TestController::class, 'completeTest']);
    Route::get('/tests/attempts/{attemptId}/result', [TestController::class, 'getTestResult']);
    Route::get('/tests/grand-mock', [TestController::class, 'getGrandMock']);

    // Subjects & Practice
    Route::get('/subjects', [SubjectController::class, 'index']);
    Route::get('/subjects/{id}', [SubjectController::class, 'show']);
    Route::get('/subjects/{subjectId}/topics', [SubjectController::class, 'getTopics']);
    Route::get('/subjects/{subjectId}/practice', [SubjectController::class, 'getPracticeTest']);

    // Analytics
    Route::get('/analytics/overview', [AnalyticsController::class, 'overview']);
    Route::get('/analytics/subjects', [AnalyticsController::class, 'subjectPerformance']);
    Route::get('/analytics/weaknesses', [AnalyticsController::class, 'weaknesses']);
    Route::get('/analytics/daily', [AnalyticsController::class, 'dailyProgress']);

    // Leaderboard
    Route::get('/leaderboard', [LeaderboardController::class, 'index']);
    Route::get('/leaderboard/university', [LeaderboardController::class, 'byUniversity']);
    Route::get('/leaderboard/country', [LeaderboardController::class, 'byCountry']);

    // 30-Day Challenge
    Route::get('/challenge/current', [ChallengeController::class, 'current']);
    Route::post('/challenge/start', [ChallengeController::class, 'start']);
    Route::get('/challenge/progress', [ChallengeController::class, 'progress']);

    // Subscriptions
    Route::get('/subscriptions/plans', [SubscriptionController::class, 'plans']);
    Route::post('/subscriptions/subscribe', [SubscriptionController::class, 'subscribe']);
    Route::post('/subscriptions/cancel', [SubscriptionController::class, 'cancel']);
    Route::get('/subscriptions/invoices', [SubscriptionController::class, 'invoices']);

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('/notifications/register-device', [NotificationController::class, 'registerDevice']);

    // ===== Admin Routes =====
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Dashboard
        Route::get('/dashboard', [AdminController::class, 'dashboard']);

        // Users
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::get('/users/{id}', [AdminController::class, 'getUser']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);

        // Questions
        Route::get('/questions', [AdminController::class, 'getQuestions']);
        Route::post('/questions', [AdminController::class, 'createQuestion']);
        Route::put('/questions/{id}', [AdminController::class, 'updateQuestion']);
        Route::delete('/questions/{id}', [AdminController::class, 'deleteQuestion']);
        Route::post('/questions/import', [AdminController::class, 'bulkImportQuestions']);

        // Subjects
        Route::get('/subjects', [AdminController::class, 'getSubjects']);
        Route::post('/subjects', [AdminController::class, 'createSubject']);
        Route::put('/subjects/{id}', [AdminController::class, 'updateSubject']);
        Route::delete('/subjects/{id}', [AdminController::class, 'deleteSubject']);

        // Notifications
        Route::post('/notifications/send', [AdminController::class, 'sendNotification']);

        // Reports
        Route::get('/reports/{type}', [AdminController::class, 'getReports']);
    });
});
