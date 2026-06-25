<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\EvolutionApiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConversationController extends Controller
{
    private EvolutionApiService $evolutionApi;

    public function __construct(EvolutionApiService $evolutionApi)
    {
        $this->evolutionApi = $evolutionApi;
    }

    /**
     * List conversations (shared inbox)
     */
    public function index(Request $request): JsonResponse
    {
        $teamId = $request->user()->team_id;
        $folder = $request->get('folder');
        $search = $request->get('search');
        $assignedTo = $request->get('assigned_to');

        $query = Conversation::where('team_id', $teamId)
            ->with(['contact', 'assignedUser', 'whatsappAccount'])
            ->orderBy('last_message_at', 'desc');

        if ($folder) {
            $query->where('folder', $folder);
        }

        if ($search) {
            $query->whereHas('contact', function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($assignedTo) {
            $query->where('assigned_to', $assignedTo);
        }

        $conversations = $query->paginate(50);

        return response()->json($conversations);
    }

    /**
     * Get single conversation with messages
     */
    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        if ($conversation->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $conversation->load(['contact', 'assignedUser', 'whatsappAccount']);

        // Mark as read
        $conversation->update([
            'is_unread' => false,
            'unread_count' => 0,
        ]);

        $messages = $conversation->messages()
            ->orderBy('created_at', 'asc')
            ->paginate(100);

        return response()->json([
            'conversation' => $conversation,
            'messages' => $messages,
        ]);
    }

    /**
     * Send a message
     */
    public function sendMessage(Request $request, Conversation $conversation): JsonResponse
    {
        if ($conversation->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $request->validate([
            'type' => 'required|in:text,image,video,document',
            'body' => 'required_if:type,text|string',
            'media_url' => 'required_unless:type,text|string',
            'caption' => 'nullable|string',
        ]);

        $contact = $conversation->contact;
        $instanceName = $conversation->whatsappAccount->instance_name;

        try {
            if ($request->type === 'text') {
                $result = $this->evolutionApi->sendText($instanceName, $contact->phone, $request->body);
            } else {
                $result = $this->evolutionApi->sendMedia(
                    $instanceName,
                    $contact->phone,
                    $request->type,
                    $request->media_url,
                    $request->caption
                );
            }

            $message = Message::create([
                'conversation_id' => $conversation->id,
                'user_id' => $request->user()->id,
                'whatsapp_message_id' => $result['key']['id'] ?? null,
                'type' => $request->type,
                'direction' => 'outbound',
                'body' => $request->body ?? $request->caption,
                'media' => $request->type !== 'text' ? ['url' => $request->media_url] : null,
                'status' => 'sent',
                'sent_at' => now(),
            ]);

            $conversation->update([
                'last_message' => substr($request->body ?? $request->caption ?? '', 0, 255),
                'last_message_at' => now(),
            ]);

            return response()->json([
                'message' => $message,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to send message',
                'details' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Update conversation folder/assignment
     */
    public function update(Request $request, Conversation $conversation): JsonResponse
    {
        if ($conversation->team_id !== $request->user()->team_id) {
            abort(403);
        }

        $request->validate([
            'folder' => 'nullable|in:new_leads,interested,follow_up,converted,closed',
            'assigned_to' => 'nullable|exists:users,id',
            'status' => 'nullable|in:open,pending,resolved',
        ]);

        $conversation->update($request->only(['folder', 'assigned_to', 'status']));

        return response()->json([
            'conversation' => $conversation->fresh()->load(['contact', 'assignedUser']),
        ]);
    }
}
