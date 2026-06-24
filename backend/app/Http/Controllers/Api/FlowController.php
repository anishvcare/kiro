<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Flow;
use App\Models\KeywordAutomation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlowController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $flows = Flow::where('team_id', $request->user()->team_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['flows' => $flows]);
    }

    public function show(Request $request, Flow $flow): JsonResponse
    {
        if ($flow->team_id !== $request->user()->team_id) {
            abort(403);
        }

        return response()->json(['flow' => $flow]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'required|in:keyword,new_contact,webhook,manual',
            'trigger_keywords' => 'nullable|array',
            'nodes' => 'nullable|array',
            'edges' => 'nullable|array',
        ]);

        $flow = Flow::create([
            'team_id' => $request->user()->team_id,
            'name' => $request->name,
            'description' => $request->description,
            'trigger_type' => $request->trigger_type,
            'trigger_keywords' => $request->trigger_keywords,
            'nodes' => $request->nodes ?? [],
            'edges' => $request->edges ?? [],
            'is_active' => true,
        ]);

        return response()->json(['flow' => $flow], 201);
    }

    public function update(Request $request, Flow $flow): JsonResponse
    {
        if ($flow->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'trigger_type' => 'nullable|in:keyword,new_contact,webhook,manual',
            'trigger_keywords' => 'nullable|array',
            'nodes' => 'nullable|array',
            'edges' => 'nullable|array',
            'is_active' => 'nullable|boolean',
        ]);

        $flow->update($request->only([
            'name', 'description', 'trigger_type', 'trigger_keywords',
            'nodes', 'edges', 'is_active'
        ]));

        return response()->json(['flow' => $flow->fresh()]);
    }

    public function destroy(Request $request, Flow $flow): JsonResponse
    {
        if ($flow->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $flow->delete();

        return response()->json(['message' => 'Flow deleted']);
    }

    // Keyword Automations

    public function keywords(Request $request): JsonResponse
    {
        $keywords = KeywordAutomation::where('team_id', $request->user()->team_id)
            ->with('flow')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['keywords' => $keywords]);
    }

    public function storeKeyword(Request $request): JsonResponse
    {
        $request->validate([
            'keyword' => 'required|string|max:255',
            'match_type' => 'required|in:exact,contains,starts_with',
            'response_type' => 'required|in:text,image,document,flow',
            'response_text' => 'required_if:response_type,text|string',
            'response_media' => 'nullable|array',
            'flow_id' => 'required_if:response_type,flow|exists:flows,id',
        ]);

        $automation = KeywordAutomation::create([
            'team_id' => $request->user()->team_id,
            'keyword' => $request->keyword,
            'match_type' => $request->match_type,
            'response_type' => $request->response_type,
            'response_text' => $request->response_text,
            'response_media' => $request->response_media,
            'flow_id' => $request->flow_id,
            'is_active' => true,
        ]);

        return response()->json(['keyword' => $automation], 201);
    }

    public function updateKeyword(Request $request, KeywordAutomation $keyword): JsonResponse
    {
        if ($keyword->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $keyword->update($request->only([
            'keyword', 'match_type', 'response_type', 'response_text',
            'response_media', 'flow_id', 'is_active'
        ]));

        return response()->json(['keyword' => $keyword->fresh()]);
    }

    public function destroyKeyword(Request $request, KeywordAutomation $keyword): JsonResponse
    {
        if ($keyword->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $keyword->delete();

        return response()->json(['message' => 'Keyword automation deleted']);
    }
}
