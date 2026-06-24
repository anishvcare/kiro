<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\FlowSession;
use App\Models\KeywordAutomation;
use App\Models\Message;
use App\Models\WhatsappAccount;
use Illuminate\Support\Facades\Log;

class WebhookService
{
    private EvolutionApiService $evolutionApi;
    private FlowEngineService $flowEngine;
    private AiChatbotService $aiChatbot;

    public function __construct(
        EvolutionApiService $evolutionApi,
        FlowEngineService $flowEngine,
        AiChatbotService $aiChatbot
    ) {
        $this->evolutionApi = $evolutionApi;
        $this->flowEngine = $flowEngine;
        $this->aiChatbot = $aiChatbot;
    }

    /**
     * Handle incoming webhook from Evolution API
     */
    public function handleWebhook(array $payload): void
    {
        $event = $payload['event'] ?? '';

        match ($event) {
            'messages.upsert' => $this->handleMessageUpsert($payload),
            'connection.update' => $this->handleConnectionUpdate($payload),
            'qrcode.updated' => $this->handleQrCodeUpdate($payload),
            'messages.update' => $this->handleMessageUpdate($payload),
            default => Log::info('Unhandled webhook event', ['event' => $event]),
        };
    }

    /**
     * Handle incoming message
     */
    private function handleMessageUpsert(array $payload): void
    {
        $data = $payload['data'] ?? [];
        $instanceName = $payload['instance'] ?? '';

        $whatsappAccount = WhatsappAccount::where('instance_name', $instanceName)->first();
        if (!$whatsappAccount) {
            Log::warning('Unknown WhatsApp instance', ['instance' => $instanceName]);
            return;
        }

        // Skip if message is from us (outbound)
        $key = $data['key'] ?? [];
        if ($key['fromMe'] ?? false) {
            return;
        }

        $remoteJid = $key['remoteJid'] ?? '';
        $phone = $this->extractPhone($remoteJid);
        $messageContent = $this->extractMessageContent($data['message'] ?? []);
        $messageType = $this->detectMessageType($data['message'] ?? []);

        if (!$phone || !$messageContent) {
            return;
        }

        // Find or create contact
        $contact = Contact::firstOrCreate(
            ['team_id' => $whatsappAccount->team_id, 'phone' => $phone],
            ['source' => 'whatsapp']
        );

        // Find or create conversation
        $conversation = Conversation::firstOrCreate(
            ['whatsapp_account_id' => $whatsappAccount->id, 'contact_id' => $contact->id],
            [
                'team_id' => $whatsappAccount->team_id,
                'folder' => 'new_leads',
                'status' => 'open',
            ]
        );

        // Save the message
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'contact_id' => $contact->id,
            'whatsapp_message_id' => $key['id'] ?? null,
            'type' => $messageType,
            'direction' => 'inbound',
            'body' => $messageContent,
            'media' => $this->extractMedia($data['message'] ?? []),
            'status' => 'delivered',
            'sent_at' => now(),
        ]);

        // Update conversation
        $conversation->update([
            'last_message' => substr($messageContent, 0, 255),
            'last_message_at' => now(),
            'is_unread' => true,
            'unread_count' => $conversation->unread_count + 1,
        ]);

        // Process automations
        $this->processAutomations($whatsappAccount, $contact, $conversation, $messageContent);
    }

    /**
     * Process keyword automations, flows, and AI
     */
    private function processAutomations(WhatsappAccount $account, Contact $contact, Conversation $conversation, string $message): void
    {
        $teamId = $account->team_id;

        // 1. Check for active flow session
        $activeSession = FlowSession::where('contact_id', $contact->id)
            ->where('conversation_id', $conversation->id)
            ->where('status', 'active')
            ->where('expires_at', '>', now())
            ->first();

        if ($activeSession) {
            $this->flowEngine->processMessage($activeSession, $message);
            return;
        }

        // 2. Check keyword automations
        $keyword = KeywordAutomation::where('team_id', $teamId)
            ->where('is_active', true)
            ->get()
            ->first(function ($automation) use ($message) {
                return match ($automation->match_type) {
                    'exact' => strtolower($message) === strtolower($automation->keyword),
                    'contains' => str_contains(strtolower($message), strtolower($automation->keyword)),
                    'starts_with' => str_starts_with(strtolower($message), strtolower($automation->keyword)),
                    default => false,
                };
            });

        if ($keyword) {
            $keyword->increment('triggered_count');

            if ($keyword->response_type === 'flow' && $keyword->flow) {
                $this->flowEngine->startFlow($keyword->flow, $contact, $conversation);
                return;
            }

            if ($keyword->response_text) {
                $this->evolutionApi->sendText($account->instance_name, $contact->phone, $keyword->response_text);

                Message::create([
                    'conversation_id' => $conversation->id,
                    'whatsapp_message_id' => null,
                    'type' => 'text',
                    'direction' => 'outbound',
                    'body' => $keyword->response_text,
                    'status' => 'sent',
                    'is_from_bot' => true,
                    'sent_at' => now(),
                ]);
            }
            return;
        }

        // 3. Try AI chatbot
        $aiResponse = $this->aiChatbot->generateResponse($conversation, $message);
        if ($aiResponse) {
            $this->evolutionApi->sendText($account->instance_name, $contact->phone, $aiResponse);

            Message::create([
                'conversation_id' => $conversation->id,
                'whatsapp_message_id' => null,
                'type' => 'text',
                'direction' => 'outbound',
                'body' => $aiResponse,
                'status' => 'sent',
                'is_from_bot' => true,
                'sent_at' => now(),
            ]);
        }
    }

    /**
     * Handle connection status updates
     */
    private function handleConnectionUpdate(array $payload): void
    {
        $instanceName = $payload['instance'] ?? '';
        $state = $payload['data']['state'] ?? '';

        $account = WhatsappAccount::where('instance_name', $instanceName)->first();
        if (!$account) return;

        $status = match ($state) {
            'open' => 'connected',
            'close' => 'disconnected',
            'connecting' => 'connecting',
            default => 'disconnected',
        };

        $account->update([
            'status' => $status,
            'connected_at' => $status === 'connected' ? now() : $account->connected_at,
        ]);
    }

    /**
     * Handle QR code updates
     */
    private function handleQrCodeUpdate(array $payload): void
    {
        $instanceName = $payload['instance'] ?? '';
        $qrCode = $payload['data']['qrcode'] ?? '';

        $account = WhatsappAccount::where('instance_name', $instanceName)->first();
        if ($account) {
            $account->update([
                'qr_code' => $qrCode,
                'status' => 'connecting',
            ]);
        }
    }

    /**
     * Handle message status updates
     */
    private function handleMessageUpdate(array $payload): void
    {
        $data = $payload['data'] ?? [];
        $messageId = $data['key']['id'] ?? '';
        $status = $data['update']['status'] ?? '';

        if ($messageId && $status) {
            $statusMap = [
                'DELIVERY_ACK' => 'delivered',
                'READ' => 'read',
                'PLAYED' => 'read',
            ];

            $mappedStatus = $statusMap[$status] ?? null;
            if ($mappedStatus) {
                Message::where('whatsapp_message_id', $messageId)
                    ->update(['status' => $mappedStatus]);
            }
        }
    }

    /**
     * Extract phone number from JID
     */
    private function extractPhone(string $jid): ?string
    {
        if (str_contains($jid, '@g.us')) {
            return null; // Skip group messages
        }
        return str_replace('@s.whatsapp.net', '', $jid);
    }

    /**
     * Extract text content from message
     */
    private function extractMessageContent(array $message): ?string
    {
        return $message['conversation'] ??
            $message['extendedTextMessage']['text'] ??
            $message['imageMessage']['caption'] ??
            $message['videoMessage']['caption'] ??
            $message['documentMessage']['caption'] ??
            $message['buttonsResponseMessage']['selectedDisplayText'] ??
            $message['listResponseMessage']['title'] ??
            null;
    }

    /**
     * Detect message type
     */
    private function detectMessageType(array $message): string
    {
        if (isset($message['imageMessage'])) return 'image';
        if (isset($message['videoMessage'])) return 'video';
        if (isset($message['audioMessage'])) return 'audio';
        if (isset($message['documentMessage'])) return 'document';
        if (isset($message['locationMessage'])) return 'location';
        if (isset($message['contactMessage'])) return 'contact';
        if (isset($message['stickerMessage'])) return 'sticker';
        return 'text';
    }

    /**
     * Extract media info from message
     */
    private function extractMedia(array $message): ?array
    {
        $mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'];

        foreach ($mediaTypes as $type) {
            if (isset($message[$type])) {
                return [
                    'mime_type' => $message[$type]['mimetype'] ?? null,
                    'filename' => $message[$type]['fileName'] ?? null,
                    'url' => $message[$type]['url'] ?? null,
                ];
            }
        }

        return null;
    }
}
