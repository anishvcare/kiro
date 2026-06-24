<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CampaignController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ConversationController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\FlowController;
use App\Http\Controllers\Api\FollowUpController;
use App\Http\Controllers\Api\LandingPageController;
use App\Http\Controllers\Api\LeadController;
use App\Http\Controllers\Api\ReferralController;
use App\Http\Controllers\Api\TeamController;
use App\Http\Controllers\Api\WhatsappController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);

// Webhook (no auth)
Route::post('/webhook/whatsapp/{instanceName}', [WhatsappController::class, 'webhook']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth
    Route::get('/auth/user', [AuthController::class, 'user']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);
    Route::get('/reports', [DashboardController::class, 'reports']);

    // WhatsApp Accounts
    Route::get('/whatsapp/accounts', [WhatsappController::class, 'index']);
    Route::post('/whatsapp/accounts', [WhatsappController::class, 'create']);
    Route::get('/whatsapp/accounts/{account}/qr', [WhatsappController::class, 'getQrCode']);
    Route::get('/whatsapp/accounts/{account}/status', [WhatsappController::class, 'checkStatus']);
    Route::post('/whatsapp/accounts/{account}/disconnect', [WhatsappController::class, 'disconnect']);
    Route::delete('/whatsapp/accounts/{account}', [WhatsappController::class, 'destroy']);

    // Conversations (Shared Inbox)
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
    Route::put('/conversations/{conversation}', [ConversationController::class, 'update']);
    Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'sendMessage']);

    // Contacts
    Route::apiResource('contacts', ContactController::class);

    // Leads
    Route::get('/leads/pipeline', [LeadController::class, 'pipeline']);
    Route::apiResource('leads', LeadController::class);

    // Flows
    Route::apiResource('flows', FlowController::class);
    Route::get('/keywords', [FlowController::class, 'keywords']);
    Route::post('/keywords', [FlowController::class, 'storeKeyword']);
    Route::put('/keywords/{keyword}', [FlowController::class, 'updateKeyword']);
    Route::delete('/keywords/{keyword}', [FlowController::class, 'destroyKeyword']);

    // Campaigns
    Route::apiResource('campaigns', CampaignController::class);
    Route::post('/campaigns/{campaign}/send', [CampaignController::class, 'send']);
    Route::post('/campaigns/{campaign}/cancel', [CampaignController::class, 'cancel']);

    // Follow-ups
    Route::get('/follow-ups', [FollowUpController::class, 'index']);
    Route::post('/follow-ups', [FollowUpController::class, 'store']);
    Route::put('/follow-ups/{sequence}', [FollowUpController::class, 'update']);
    Route::delete('/follow-ups/{sequence}', [FollowUpController::class, 'destroy']);
    Route::post('/follow-ups/enroll', [FollowUpController::class, 'enroll']);

    // Landing Pages
    Route::get('/landing-pages', [LandingPageController::class, 'index']);
    Route::post('/landing-pages', [LandingPageController::class, 'store']);
    Route::put('/landing-pages/{page}', [LandingPageController::class, 'update']);
    Route::delete('/landing-pages/{page}', [LandingPageController::class, 'destroy']);

    // WA Links
    Route::get('/wa-links', [LandingPageController::class, 'links']);
    Route::post('/wa-links', [LandingPageController::class, 'storeLink']);
    Route::delete('/wa-links/{link}', [LandingPageController::class, 'destroyLink']);

    // Team Management
    Route::get('/team/members', [TeamController::class, 'members']);
    Route::post('/team/members', [TeamController::class, 'addMember']);
    Route::put('/team/members/{member}', [TeamController::class, 'updateMember']);
    Route::delete('/team/members/{member}', [TeamController::class, 'removeMember']);

    // Referrals
    Route::get('/referrals/dashboard', [ReferralController::class, 'dashboard']);
    Route::get('/referrals', [ReferralController::class, 'index']);
    Route::put('/referrals/settings', [ReferralController::class, 'updateSettings']);
    Route::post('/referrals/{referral}/pay', [ReferralController::class, 'markPaid']);
});
