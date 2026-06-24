<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use App\Models\LeadPipeline;
use App\Models\LeadStage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LeadController extends Controller
{
    /**
     * Get pipeline with stages and leads (Kanban view)
     */
    public function pipeline(Request $request): JsonResponse
    {
        $teamId = $request->user()->team_id;
        $pipelineId = $request->get('pipeline_id');

        $query = LeadPipeline::where('team_id', $teamId);
        if ($pipelineId) {
            $query->where('id', $pipelineId);
        }

        $pipeline = $query->first();

        if (!$pipeline) {
            return response()->json(['pipeline' => null, 'stages' => []]);
        }

        $stages = $pipeline->stages()->with(['leads' => function ($q) use ($request) {
            $q->with(['contact', 'assignedUser'])
                ->where('status', 'open')
                ->orderBy('created_at', 'desc');

            if ($request->get('assigned_to')) {
                $q->where('assigned_to', $request->get('assigned_to'));
            }
        }])->orderBy('sort_order')->get();

        return response()->json([
            'pipeline' => $pipeline,
            'stages' => $stages,
        ]);
    }

    /**
     * List all leads
     */
    public function index(Request $request): JsonResponse
    {
        $teamId = $request->user()->team_id;

        $query = Lead::where('team_id', $teamId)
            ->with(['contact', 'stage', 'assignedUser'])
            ->orderBy('created_at', 'desc');

        if ($request->get('status')) {
            $query->where('status', $request->get('status'));
        }

        if ($request->get('stage_id')) {
            $query->where('stage_id', $request->get('stage_id'));
        }

        $leads = $query->paginate(50);

        return response()->json($leads);
    }

    /**
     * Create a new lead
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'contact_id' => 'required|exists:contacts,id',
            'stage_id' => 'required|exists:lead_stages,id',
            'title' => 'nullable|string|max:255',
            'value' => 'nullable|numeric',
            'course_interest' => 'nullable|string|max:255',
            'budget' => 'nullable|string|max:255',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'assigned_to' => 'nullable|exists:users,id',
            'notes' => 'nullable|string',
        ]);

        $lead = Lead::create([
            'team_id' => $request->user()->team_id,
            'contact_id' => $request->contact_id,
            'stage_id' => $request->stage_id,
            'title' => $request->title,
            'value' => $request->value,
            'course_interest' => $request->course_interest,
            'budget' => $request->budget,
            'priority' => $request->priority ?? 'medium',
            'assigned_to' => $request->assigned_to,
            'notes' => $request->notes,
            'status' => 'open',
            'last_activity_at' => now(),
        ]);

        return response()->json(['lead' => $lead->load(['contact', 'stage'])], 201);
    }

    /**
     * Update lead (move stage, assign, etc.)
     */
    public function update(Request $request, Lead $lead): JsonResponse
    {
        if ($lead->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $request->validate([
            'stage_id' => 'nullable|exists:lead_stages,id',
            'assigned_to' => 'nullable|exists:users,id',
            'title' => 'nullable|string|max:255',
            'value' => 'nullable|numeric',
            'priority' => 'nullable|in:low,medium,high,urgent',
            'status' => 'nullable|in:open,won,lost',
            'notes' => 'nullable|string',
        ]);

        $data = $request->only(['stage_id', 'assigned_to', 'title', 'value', 'priority', 'status', 'notes']);
        $data['last_activity_at'] = now();

        if ($request->status === 'won') {
            $data['won_at'] = now();
        } elseif ($request->status === 'lost') {
            $data['lost_at'] = now();
        }

        $lead->update($data);

        return response()->json(['lead' => $lead->fresh()->load(['contact', 'stage', 'assignedUser'])]);
    }

    /**
     * Delete lead
     */
    public function destroy(Request $request, Lead $lead): JsonResponse
    {
        if ($lead->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $lead->delete();

        return response()->json(['message' => 'Lead deleted']);
    }
}
