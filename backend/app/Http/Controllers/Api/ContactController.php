<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contact;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContactController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teamId = $request->user()->team_id;
        $search = $request->get('search');
        $tag = $request->get('tag');

        $query = Contact::where('team_id', $teamId)
            ->with(['assignedUser'])
            ->orderBy('created_at', 'desc');

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($tag) {
            $query->whereJsonContains('tags', $tag);
        }

        $contacts = $query->paginate(50);

        return response()->json($contacts);
    }

    public function show(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $contact->load(['assignedUser', 'leads.stage', 'conversations']);

        return response()->json(['contact' => $contact]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'phone' => 'required|string|max:20',
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'place' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        $contact = Contact::create([
            'team_id' => $request->user()->team_id,
            'phone' => $request->phone,
            'name' => $request->name,
            'email' => $request->email,
            'place' => $request->place,
            'tags' => $request->tags,
            'notes' => $request->notes,
            'assigned_to' => $request->assigned_to,
            'source' => 'manual',
        ]);

        return response()->json(['contact' => $contact], 201);
    }

    public function update(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $request->validate([
            'name' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'place' => 'nullable|string|max:255',
            'tags' => 'nullable|array',
            'notes' => 'nullable|string',
            'assigned_to' => 'nullable|exists:users,id',
            'custom_fields' => 'nullable|array',
        ]);

        $contact->update($request->only([
            'name', 'email', 'place', 'tags', 'notes', 'assigned_to', 'custom_fields'
        ]));

        return response()->json(['contact' => $contact->fresh()]);
    }

    public function destroy(Request $request, Contact $contact): JsonResponse
    {
        if ($contact->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $contact->delete();

        return response()->json(['message' => 'Contact deleted']);
    }
}
