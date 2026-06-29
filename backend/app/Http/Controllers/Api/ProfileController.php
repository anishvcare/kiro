<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileRequest;
use App\Http\Resources\ProfileResource;
use App\Http\Resources\ProfileSummaryResource;
use App\Models\Interest;
use App\Models\Profile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    /**
     * Get the authenticated user's own profile (null if not created yet).
     */
    public function me(Request $request): JsonResponse
    {
        $profile = $request->user()->profile()->with('photos')->first();

        return response()->json([
            'profile' => $profile ? new ProfileResource($profile) : null,
        ]);
    }

    /**
     * Create or update the authenticated user's profile.
     */
    public function save(ProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $profile = $user->profile;

        if ($profile) {
            $profile->fill($data);
        } else {
            $profile = new Profile($data);
            $profile->user_id = $user->id;
        }

        $profile->completeness = $profile->calculateCompleteness();
        $profile->save();

        // Assign a stable public display id on first save.
        if (! $profile->display_id) {
            $profile->display_id = 'NM'.str_pad((string) $profile->id, 6, '0', STR_PAD_LEFT);
            $profile->save();
        }

        return response()->json([
            'message' => 'Profile saved successfully',
            'profile' => new ProfileResource($profile->load('photos')),
        ]);
    }

    /**
     * Browse / search other members' profiles with filters.
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $query = Profile::query()->where('user_id', '!=', $userId);

        if ($request->filled('gender')) {
            $query->where('gender', $request->gender);
        }

        if ($request->filled('religion')) {
            $query->where('religion', $request->religion);
        }

        if ($request->filled('caste')) {
            $query->where('caste', 'like', '%'.$request->caste.'%');
        }

        if ($request->filled('marital_status')) {
            $query->where('marital_status', $request->marital_status);
        }

        if ($request->filled('district')) {
            $query->where('district', $request->district);
        }

        if ($request->filled('country')) {
            $query->where('country', $request->country);
        }

        if ($request->filled('q')) {
            $query->where('full_name', 'like', '%'.$request->q.'%');
        }

        // Age range -> derive date_of_birth bounds.
        if ($request->filled('age_min')) {
            $query->whereDate('date_of_birth', '<=', now()->subYears((int) $request->age_min)->toDateString());
        }
        if ($request->filled('age_max')) {
            $query->whereDate('date_of_birth', '>=', now()->subYears((int) $request->age_max + 1)->toDateString());
        }

        $profiles = $query->latest()->paginate(12);

        return response()->json([
            'profiles' => ProfileSummaryResource::collection($profiles),
            'meta' => [
                'current_page' => $profiles->currentPage(),
                'last_page' => $profiles->lastPage(),
                'per_page' => $profiles->perPage(),
                'total' => $profiles->total(),
            ],
        ]);
    }

    /**
     * View a single profile, with the current user's interest status toward it.
     */
    public function show(Request $request, Profile $profile): JsonResponse
    {
        $profile->load('photos');
        $me = $request->user()->id;

        $sentInterest = Interest::where('sender_id', $me)
            ->where('receiver_id', $profile->user_id)
            ->first();

        $receivedInterest = Interest::where('sender_id', $profile->user_id)
            ->where('receiver_id', $me)
            ->first();

        return response()->json([
            'profile' => new ProfileResource($profile),
            'interest_sent' => $sentInterest?->status ? ['status' => $sentInterest->status] : null,
            'interest_received' => $receivedInterest ? ['id' => $receivedInterest->id, 'status' => $receivedInterest->status] : null,
        ]);
    }
}
