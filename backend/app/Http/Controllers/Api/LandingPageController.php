<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingPage;
use App\Models\WaLink;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LandingPageController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $pages = LandingPage::where('team_id', $request->user()->team_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['pages' => $pages]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'template' => 'required|in:default,mbbs,russia_job,ielts,custom',
            'description' => 'nullable|string',
            'content' => 'nullable|array',
            'settings' => 'nullable|array',
            'whatsapp_number' => 'nullable|string',
            'pre_filled_message' => 'nullable|string',
        ]);

        $page = LandingPage::create([
            'team_id' => $request->user()->team_id,
            'title' => $request->title,
            'slug' => Str::slug($request->title) . '-' . Str::random(5),
            'template' => $request->template,
            'description' => $request->description,
            'content' => $request->content,
            'settings' => $request->settings,
            'whatsapp_number' => $request->whatsapp_number,
            'pre_filled_message' => $request->pre_filled_message,
            'is_published' => false,
        ]);

        return response()->json(['page' => $page], 201);
    }

    public function update(Request $request, LandingPage $page): JsonResponse
    {
        if ($page->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $page->update($request->only([
            'title', 'description', 'content', 'settings',
            'whatsapp_number', 'pre_filled_message', 'is_published'
        ]));

        return response()->json(['page' => $page->fresh()]);
    }

    public function destroy(Request $request, LandingPage $page): JsonResponse
    {
        if ($page->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $page->delete();

        return response()->json(['message' => 'Landing page deleted']);
    }

    // WhatsApp Links

    public function links(Request $request): JsonResponse
    {
        $links = WaLink::where('team_id', $request->user()->team_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['links' => $links]);
    }

    public function storeLink(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'whatsapp_number' => 'required|string',
            'pre_filled_message' => 'nullable|string',
        ]);

        $link = WaLink::create([
            'team_id' => $request->user()->team_id,
            'name' => $request->name,
            'short_code' => Str::random(8),
            'whatsapp_number' => $request->whatsapp_number,
            'pre_filled_message' => $request->pre_filled_message,
        ]);

        return response()->json(['link' => $link], 201);
    }

    public function destroyLink(Request $request, WaLink $link): JsonResponse
    {
        if ($link->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $link->delete();

        return response()->json(['message' => 'Link deleted']);
    }
}
