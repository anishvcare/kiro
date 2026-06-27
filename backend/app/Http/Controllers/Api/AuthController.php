<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\GoogleLoginRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Category;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $tenantId = random_int(100000000, PHP_INT_MAX);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => $request->password,
            'tenant_id' => $tenantId,
        ]);

        $this->seedDefaultCategories($tenantId);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Registration successful',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * Login an existing user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials',
            ], 401);
        }

        $user = Auth::user();
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Handle Google OAuth login/register.
     * Accepts a Google access token from the frontend.
     */
    public function googleLogin(GoogleLoginRequest $request): JsonResponse
    {
        try {
            $googleUser = Socialite::driver('google')->stateless()->userFromToken($request->token);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Invalid Google token',
            ], 401);
        }

        $user = User::where('google_id', $googleUser->getId())->first();

        if (!$user) {
            // Check if user exists with same email
            $user = User::where('email', $googleUser->getEmail())->first();

            if ($user) {
                // Link existing account with Google
                $user->update([
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                ]);
            } else {
                // Create new user
                $tenantId = random_int(100000000, PHP_INT_MAX);

                $user = User::create([
                    'name' => $googleUser->getName(),
                    'email' => $googleUser->getEmail(),
                    'google_id' => $googleUser->getId(),
                    'avatar' => $googleUser->getAvatar(),
                    'tenant_id' => $tenantId,
                ]);

                $this->seedDefaultCategories($tenantId);
            }
        }

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => new UserResource($user),
            'token' => $token,
        ]);
    }

    /**
     * Logout the current user.
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function user(Request $request): JsonResponse
    {
        return response()->json([
            'user' => new UserResource($request->user()),
        ]);
    }

    /**
     * Seed default categories for a new tenant.
     */
    private function seedDefaultCategories(int $tenantId): void
    {
        $expenseCategories = [
            ['name' => 'Food & Dining', 'color' => '#FF6384', 'icon' => 'utensils', 'sort_order' => 1],
            ['name' => 'Transport', 'color' => '#36A2EB', 'icon' => 'car', 'sort_order' => 2],
            ['name' => 'Housing', 'color' => '#FFCE56', 'icon' => 'home', 'sort_order' => 3],
            ['name' => 'Utilities', 'color' => '#4BC0C0', 'icon' => 'bolt', 'sort_order' => 4],
            ['name' => 'Entertainment', 'color' => '#9966FF', 'icon' => 'film', 'sort_order' => 5],
            ['name' => 'Shopping', 'color' => '#FF9F40', 'icon' => 'shopping-bag', 'sort_order' => 6],
            ['name' => 'Healthcare', 'color' => '#FF6384', 'icon' => 'heart', 'sort_order' => 7],
            ['name' => 'Education', 'color' => '#C9CBCF', 'icon' => 'book', 'sort_order' => 8],
            ['name' => 'Personal Care', 'color' => '#FF99CC', 'icon' => 'user', 'sort_order' => 9],
            ['name' => 'Other Expense', 'color' => '#808080', 'icon' => 'ellipsis', 'sort_order' => 10],
        ];

        $incomeCategories = [
            ['name' => 'Salary', 'color' => '#4CAF50', 'icon' => 'briefcase', 'sort_order' => 1],
            ['name' => 'Freelance', 'color' => '#8BC34A', 'icon' => 'laptop', 'sort_order' => 2],
            ['name' => 'Investment', 'color' => '#CDDC39', 'icon' => 'chart-line', 'sort_order' => 3],
            ['name' => 'Business', 'color' => '#009688', 'icon' => 'store', 'sort_order' => 4],
            ['name' => 'Other Income', 'color' => '#607D8B', 'icon' => 'plus-circle', 'sort_order' => 5],
        ];

        foreach ($expenseCategories as $category) {
            Category::withoutGlobalScopes()->create(array_merge($category, [
                'type' => 'expense',
                'tenant_id' => $tenantId,
            ]));
        }

        foreach ($incomeCategories as $category) {
            Category::withoutGlobalScopes()->create(array_merge($category, [
                'type' => 'income',
                'tenant_id' => $tenantId,
            ]));
        }
    }
}
