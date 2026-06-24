<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FollowUpEnrollment;
use App\Models\FollowUpSequence;
use App\Models\FollowUpStep;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FollowUpController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $sequences = FollowUpSequence::where('team_id', $request->user()->team_id)
            ->with('steps')
            ->withCount('enrollments')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['sequences' => $sequences]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'steps' => 'required|array|min:1',
            'steps.*.delay_days' => 'required|integer|min:0',
            'steps.*.delay_hours' => 'nullable|integer|min:0',
            'steps.*.message_type' => 'required|in:text,image,document,template',
            'steps.*.message_body' => 'required|string',
            'steps.*.media' => 'nullable|array',
        ]);

        $sequence = FollowUpSequence::create([
            'team_id' => $request->user()->team_id,
            'name' => $request->name,
            'description' => $request->description,
            'is_active' => true,
        ]);

        foreach ($request->steps as $index => $step) {
            FollowUpStep::create([
                'sequence_id' => $sequence->id,
                'delay_days' => $step['delay_days'],
                'delay_hours' => $step['delay_hours'] ?? 0,
                'message_type' => $step['message_type'],
                'message_body' => $step['message_body'],
                'media' => $step['media'] ?? null,
                'sort_order' => $index,
            ]);
        }

        return response()->json(['sequence' => $sequence->load('steps')], 201);
    }

    public function update(Request $request, FollowUpSequence $sequence): JsonResponse
    {
        if ($sequence->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $sequence->update($request->only(['name', 'description', 'is_active']));

        if ($request->has('steps')) {
            $sequence->steps()->delete();
            foreach ($request->steps as $index => $step) {
                FollowUpStep::create([
                    'sequence_id' => $sequence->id,
                    'delay_days' => $step['delay_days'],
                    'delay_hours' => $step['delay_hours'] ?? 0,
                    'message_type' => $step['message_type'],
                    'message_body' => $step['message_body'],
                    'media' => $step['media'] ?? null,
                    'sort_order' => $index,
                ]);
            }
        }

        return response()->json(['sequence' => $sequence->fresh()->load('steps')]);
    }

    public function destroy(Request $request, FollowUpSequence $sequence): JsonResponse
    {
        if ($sequence->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $sequence->delete();

        return response()->json(['message' => 'Sequence deleted']);
    }

    /**
     * Enroll a contact in a follow-up sequence
     */
    public function enroll(Request $request): JsonResponse
    {
        $request->validate([
            'sequence_id' => 'required|exists:follow_up_sequences,id',
            'contact_id' => 'required|exists:contacts,id',
            'conversation_id' => 'required|exists:conversations,id',
        ]);

        $sequence = FollowUpSequence::findOrFail($request->sequence_id);
        $firstStep = $sequence->steps()->orderBy('sort_order')->first();

        $enrollment = FollowUpEnrollment::create([
            'sequence_id' => $request->sequence_id,
            'contact_id' => $request->contact_id,
            'conversation_id' => $request->conversation_id,
            'current_step' => 0,
            'status' => 'active',
            'next_send_at' => now()->addDays($firstStep->delay_days ?? 1)->addHours($firstStep->delay_hours ?? 0),
        ]);

        return response()->json(['enrollment' => $enrollment], 201);
    }
}
