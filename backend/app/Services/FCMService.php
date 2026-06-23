<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FCMService
{
    private string $serverKey;
    private string $apiUrl = 'https://fcm.googleapis.com/fcm/send';

    public function __construct()
    {
        $this->serverKey = config('services.firebase.server_key', '');
    }

    /**
     * Send notification to a single user
     */
    public function sendToUser(User $user, string $title, string $body, array $data = []): bool
    {
        $devices = UserDevice::where('user_id', $user->id)
            ->where('is_active', true)
            ->pluck('fcm_token')
            ->toArray();

        if (empty($devices)) {
            return false;
        }

        return $this->sendToTokens($devices, $title, $body, $data);
    }

    /**
     * Send notification to multiple tokens
     */
    public function sendToTokens(array $tokens, string $title, string $body, array $data = []): bool
    {
        if (empty($this->serverKey)) {
            Log::warning('FCM: Server key not configured');
            return false;
        }

        try {
            $payload = [
                'registration_ids' => $tokens,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'icon' => '/icons/icon-192x192.png',
                    'badge' => '/icons/icon-72x72.png',
                    'click_action' => config('app.frontend_url', 'https://fmgetrainer.com') . '/dashboard',
                ],
                'data' => array_merge($data, [
                    'title' => $title,
                    'body' => $body,
                ]),
                'priority' => 'high',
            ];

            $response = Http::withHeaders([
                'Authorization' => 'key=' . $this->serverKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl, $payload);

            if ($response->successful()) {
                Log::info('FCM: Notification sent', ['tokens' => count($tokens)]);
                return true;
            }

            Log::error('FCM: Failed to send', ['response' => $response->body()]);
            return false;
        } catch (\Exception $e) {
            Log::error('FCM: Exception', ['error' => $e->getMessage()]);
            return false;
        }
    }

    /**
     * Send to all users by target group
     */
    public function sendToTarget(string $target, string $title, string $body, array $data = []): int
    {
        $query = UserDevice::where('is_active', true);

        switch ($target) {
            case 'premium':
                $query->whereHas('user', fn($q) => $q->where('subscription_plan', 'premium'));
                break;
            case 'free':
                $query->whereHas('user', fn($q) => $q->where('subscription_plan', 'free'));
                break;
            // 'all' - no filter needed
        }

        $tokens = $query->pluck('fcm_token')->toArray();
        $sentCount = 0;

        // Send in batches of 1000 (FCM limit)
        foreach (array_chunk($tokens, 1000) as $batch) {
            if ($this->sendToTokens($batch, $title, $body, $data)) {
                $sentCount += count($batch);
            }
        }

        return $sentCount;
    }

    /**
     * Send morning challenge notification
     */
    public function sendMorningChallenge(): int
    {
        return $this->sendToTarget(
            'all',
            '☀️ Morning Challenge Ready!',
            'Your FMGE Morning Challenge is ready. 30 questions to start your day!',
            ['type' => 'challenge', 'url' => '/daily-challenge']
        );
    }

    /**
     * Send evening challenge notification
     */
    public function sendEveningChallenge(): int
    {
        return $this->sendToTarget(
            'all',
            '🌙 Evening Challenge Ready!',
            'Your FMGE Evening Challenge is ready. Complete it to maintain your streak!',
            ['type' => 'challenge', 'url' => '/daily-challenge']
        );
    }

    /**
     * Send streak reminder
     */
    public function sendStreakReminder(User $user): bool
    {
        return $this->sendToUser(
            $user,
            '🔥 Don\'t Break Your Streak!',
            "You have a {$user->streak_count}-day streak. Complete today's challenge!",
            ['type' => 'streak', 'url' => '/daily-challenge']
        );
    }
}
