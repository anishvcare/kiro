<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeadPipeline;
use App\Models\LeadStage;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

class AuthController extends Controller
{
    /**
     * Register a new user and team
     */
    public function register(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => ['required', 'confirmed', Password::min(8)],
            'team_name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
        ]);

        // Create team
        $team = Team::create([
            'name' => $request->team_name,
            'slug' => Str::slug($request->team_name) . '-' . Str::random(4),
            'plan' => 'free',
            'trial_ends_at' => now()->addDays(14),
        ]);

        // Create default pipeline
        $pipeline = LeadPipeline::create([
            'team_id' => $team->id,
            'name' => 'Default Pipeline',
            'sort_order' => 0,
        ]);

        // Create default stages
        $stages = ['New Lead', 'Interested', 'Follow-up', 'Admission Processing', 'Converted', 'Closed'];
        $colors = ['#6B7280', '#3B82F6', '#F59E0B', '#8B5CF6', '#10B981', '#EF4444'];
        foreach ($stages as $i => $stage) {
            LeadStage::create([
                'pipeline_id' => $pipeline->id,
                'name' => $stage,
                'color' => $colors[$i],
                'sort_order' => $i,
            ]);
        }

        // Create admin user
        $user = User::create([
            'team_id' => $team->id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
            'role' => 'admin',
            'referral_code' => strtoupper(Str::random(8)),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user->load('team'),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();

        if (!$user->is_active) {
            return response()->json([
                'message' => 'Account is deactivated',
            ], 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user->load('team'),
            'token' => $token,
        ]);
    }

    /**
     * Get authenticated user
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => $request->user()->load('team'),
        ]);
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
}
