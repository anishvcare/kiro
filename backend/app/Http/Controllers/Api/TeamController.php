<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TeamController extends Controller
{
    /**
     * List team members
     */
    public function members(Request $request): JsonResponse
    {
        $members = User::where('team_id', $request->user()->team_id)
            ->orderBy('role')
            ->orderBy('name')
            ->get();

        return response()->json(['members' => $members]);
    }

    /**
     * Invite/Add a new team member
     */
    public function addMember(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'required|in:manager,counsellor,agent',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8',
        ]);

        $user = $request->user();
        if (!$user->isManager()) {
            return response()->json(['message' => 'Insufficient permissions'], 403);
        }

        $member = User::create([
            'team_id' => $user->team_id,
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password ?? 'password123'),
            'phone' => $request->phone,
            'role' => $request->role,
            'referral_code' => strtoupper(Str::random(8)),
            'is_active' => true,
        ]);

        return response()->json(['member' => $member], 201);
    }

    /**
     * Update team member
     */
    public function updateMember(Request $request, User $member): JsonResponse
    {
        $user = $request->user();
        if (!$user->isManager() || $member->team_id !== $user->team_id) {
            return response()->json(['message' => 'Insufficient permissions'], 403);
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'role' => 'nullable|in:admin,manager,counsellor,agent',
            'is_active' => 'nullable|boolean',
            'phone' => 'nullable|string|max:20',
        ]);

        $member->update($request->only(['name', 'role', 'is_active', 'phone']));

        return response()->json(['member' => $member->fresh()]);
    }

    /**
     * Remove team member
     */
    public function removeMember(Request $request, User $member): JsonResponse
    {
        $user = $request->user();
        if (!$user->isAdmin() || $member->team_id !== $user->team_id) {
            return response()->json(['message' => 'Insufficient permissions'], 403);
        }

        if ($member->id === $user->id) {
            return response()->json(['message' => 'Cannot remove yourself'], 422);
        }

        $member->delete();

        return response()->json(['message' => 'Member removed']);
    }
}
