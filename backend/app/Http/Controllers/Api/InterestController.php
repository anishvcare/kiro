<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\InterestRequest;
use App\Http\Resources\InterestResource;
use App\Models\Interest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class InterestController extends Controller
{
    /**
     * List interests for the authenticated user.
     * ?box=received (default) | sent
     */
    public function index(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $box = $request->query('box', 'received');

        $query = Interest::query();

        if ($box === 'sent') {
            $query->where('sender_id', $userId)->with('receiverProfile');
        } else {
            $query->where('receiver_id', $userId)->with('senderProfile');
        }

        $interests = $query->latest()->get();

        return response()->json([
            'interests' => InterestResource::collection($interests),
        ]);
    }

    /**
     * Express interest in another member.
     */
    public function store(InterestRequest $request): JsonResponse
    {
        $userId = $request->user()->id;

        $existing = Interest::where('sender_id', $userId)
            ->where('receiver_id', $request->receiver_id)
            ->first();

        if ($existing) {
            throw ValidationException::withMessages([
                'receiver_id' => 'You have already expressed interest in this member.',
            ]);
        }

        $interest = Interest::create([
            'sender_id' => $userId,
            'receiver_id' => $request->receiver_id,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Interest sent successfully',
            'interest' => new InterestResource($interest),
        ], 201);
    }

    /**
     * Accept or decline a received interest.
     */
    public function update(Request $request, Interest $interest): JsonResponse
    {
        if ($interest->receiver_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:accepted,declined'],
        ]);

        $interest->update(['status' => $validated['status']]);

        return response()->json([
            'message' => 'Interest '.$validated['status'],
            'interest' => new InterestResource($interest),
        ]);
    }
}
