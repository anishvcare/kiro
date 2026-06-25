<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\SendCampaignJob;
use App\Models\Campaign;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CampaignController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $campaigns = Campaign::where('team_id', $request->user()->team_id)
            ->with(['whatsappAccount', 'creator'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($campaigns);
    }

    public function show(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $campaign->load(['whatsappAccount', 'creator', 'logs.contact']);

        return response()->json(['campaign' => $campaign]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'whatsapp_account_id' => 'required|exists:whatsapp_accounts,id',
            'type' => 'required|in:text,image,video,document,button,list',
            'message_body' => 'required|string',
            'media' => 'nullable|array',
            'buttons' => 'nullable|array',
            'recipients' => 'required|array',
            'scheduled_at' => 'nullable|date|after:now',
        ]);

        $campaign = Campaign::create([
            'team_id' => $request->user()->team_id,
            'whatsapp_account_id' => $request->whatsapp_account_id,
            'created_by' => $request->user()->id,
            'name' => $request->name,
            'type' => $request->type,
            'message_body' => $request->message_body,
            'media' => $request->media,
            'buttons' => $request->buttons,
            'recipients' => $request->recipients,
            'total_recipients' => count($request->recipients),
            'status' => $request->scheduled_at ? 'scheduled' : 'draft',
            'scheduled_at' => $request->scheduled_at,
        ]);

        return response()->json(['campaign' => $campaign], 201);
    }

    public function update(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->team_id !== $request->user()->team_id) {
            abort(403);
        }

        if ($campaign->status !== 'draft') {
            return response()->json(['message' => 'Cannot edit a campaign that is not in draft status'], 422);
        }

        $campaign->update($request->only([
            'name', 'type', 'message_body', 'media', 'buttons',
            'recipients', 'scheduled_at'
        ]));

        if ($request->has('recipients')) {
            $campaign->update(['total_recipients' => count($request->recipients)]);
        }

        return response()->json(['campaign' => $campaign->fresh()]);
    }

    /**
     * Start sending the campaign
     */
    public function send(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->team_id !== $request->user()->team_id) {
            abort(403);
        }

        if (!in_array($campaign->status, ['draft', 'scheduled'])) {
            return response()->json(['message' => 'Campaign cannot be sent in its current state'], 422);
        }

        $campaign->update([
            'status' => 'sending',
            'started_at' => now(),
        ]);

        // Dispatch the campaign sending job
        SendCampaignJob::dispatch($campaign);

        return response()->json(['message' => 'Campaign is being sent', 'campaign' => $campaign->fresh()]);
    }

    /**
     * Cancel a campaign
     */
    public function cancel(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $campaign->update(['status' => 'cancelled']);

        return response()->json(['message' => 'Campaign cancelled']);
    }

    public function destroy(Request $request, Campaign $campaign): JsonResponse
    {
        if ($campaign->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $campaign->delete();

        return response()->json(['message' => 'Campaign deleted']);
    }
}
