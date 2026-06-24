<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserDevice;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications
     */
    public function index(Request $request): JsonResponse
    {
        $notifications = $request->user()
            ->notifications()
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ]);
    }

    /**
     * Mark notification as read
     */
    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $request->user()
            ->notifications()
            ->where('id', $id)
            ->first();

        if ($notification) {
            $notification->markAsRead();
        }

        return response()->json([
            'success' => true,
            'message' => 'Notification marked as read',
        ]);
    }

    /**
     * Register device for push notifications
     */
    public function registerDevice(Request $request): JsonResponse
    {
        $request->validate([
            'token' => 'required|string',
            'platform' => 'required|string|in:android,ios,web',
        ]);

        UserDevice::updateOrCreate(
            ['fcm_token' => $request->token],
            [
                'user_id' => $request->user()->id,
                'platform' => $request->platform,
                'device_name' => $request->device_name ?? null,
                'is_active' => true,
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Device registered for notifications',
        ]);
    }
}
