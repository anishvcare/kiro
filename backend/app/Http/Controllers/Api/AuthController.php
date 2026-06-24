<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserStreak;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Register a new user
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'student',
        ]);

        // Create streak record
        UserStreak::create(['user_id' => $user->id]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Registration successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Login with email and password
     */
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Google OAuth login
     */
    public function googleLogin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'token' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Token is required',
            ], 422);
        }

        // Verify Google token (would use Google API Client)
        // For now, decode the token payload
        try {
            // In production, verify with Google OAuth2 API
            $googleUser = $this->verifyGoogleToken($request->token);

            if (!$googleUser) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid Google token',
                ], 401);
            }

            $user = User::where('google_id', $googleUser['id'])
                ->orWhere('email', $googleUser['email'])
                ->first();

            if (!$user) {
                $user = User::create([
                    'name' => $googleUser['name'],
                    'email' => $googleUser['email'],
                    'google_id' => $googleUser['id'],
                    'avatar' => $googleUser['picture'] ?? null,
                    'email_verified_at' => now(),
                    'role' => 'student',
                ]);
                UserStreak::create(['user_id' => $user->id]);
            } else {
                $user->update(['google_id' => $googleUser['id']]);
            }

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login successful',
                'data' => [
                    'user' => $user,
                    'token' => $token,
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Google authentication failed',
            ], 401);
        }
    }

    /**
     * Send OTP
     */
    public function sendOTP(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|min:10|max:15',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Valid phone number is required',
            ], 422);
        }

        // Generate OTP (in production, use SMS service like MSG91 or Twilio)
        $otp = rand(100000, 999999);

        // Store OTP in cache (5 minutes expiry)
        cache()->put('otp_' . $request->phone, $otp, 300);

        // In production, send SMS here
        // SMSService::send($request->phone, "Your FMGE Trainer OTP is: {$otp}");

        return response()->json([
            'success' => true,
            'message' => 'OTP sent successfully',
            // Remove this in production:
            'data' => ['otp' => $otp],
        ]);
    }

    /**
     * Verify OTP
     */
    public function verifyOTP(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'otp' => 'required|string|size:6',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
            ], 422);
        }

        $storedOTP = cache()->get('otp_' . $request->phone);

        if (!$storedOTP || $storedOTP != $request->otp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
            ], 401);
        }

        // Clear OTP
        cache()->forget('otp_' . $request->phone);

        // Find or create user
        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            $user = User::create([
                'name' => 'Student',
                'email' => $request->phone . '@fmgetrainer.com',
                'phone' => $request->phone,
                'role' => 'student',
            ]);
            UserStreak::create(['user_id' => $user->id]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'OTP verified successfully',
            'data' => [
                'user' => $user,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Forgot password
     */
    public function forgotPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Email not found',
            ], 422);
        }

        $status = Password::sendResetLink($request->only('email'));

        return response()->json([
            'success' => $status === Password::RESET_LINK_SENT,
            'message' => $status === Password::RESET_LINK_SENT
                ? 'Password reset link sent to your email'
                : 'Failed to send reset link',
        ]);
    }

    /**
     * Reset password
     */
    public function resetPassword(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function ($user, $password) {
                $user->update(['password' => Hash::make($password)]);
            }
        );

        return response()->json([
            'success' => $status === Password::PASSWORD_RESET,
            'message' => $status === Password::PASSWORD_RESET
                ? 'Password reset successfully'
                : 'Failed to reset password',
        ]);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => $request->user()->load(['streak', 'activeSubscription']),
        ]);
    }

    /**
     * Logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Verify Google token (placeholder - implement with Google API client)
     */
    private function verifyGoogleToken(string $token): ?array
    {
        // In production, use Google_Client to verify
        // $client = new \Google_Client(['client_id' => config('services.google.client_id')]);
        // $payload = $client->verifyIdToken($token);
        // return $payload;
        
        return null; // Placeholder
    }
}
