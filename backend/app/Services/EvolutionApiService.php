<?php

namespace App\Services;

use App\Models\WhatsappAccount;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class EvolutionApiService
{
    private string $baseUrl;
    private string $apiKey;

    public function __construct()
    {
        $this->baseUrl = rtrim(config('services.evolution.url', 'http://localhost:8080'), '/');
        $this->apiKey = config('services.evolution.api_key', '');
    }

    private function request()
    {
        return Http::baseUrl($this->baseUrl)
            ->withHeaders([
                'apikey' => $this->apiKey,
                'Content-Type' => 'application/json',
            ])
            ->timeout(30);
    }

    /**
     * Create a new WhatsApp instance
     */
    public function createInstance(string $instanceName, ?string $webhookUrl = null): array
    {
        $payload = [
            'instanceName' => $instanceName,
            'qrcode' => true,
            'integration' => 'WHATSAPP-BAILEYS',
        ];

        if ($webhookUrl) {
            $payload['webhook'] = [
                'url' => $webhookUrl,
                'byEvents' => true,
                'base64' => false,
                'events' => [
                    'MESSAGES_UPSERT',
                    'MESSAGES_UPDATE',
                    'CONNECTION_UPDATE',
                    'QRCODE_UPDATED',
                ],
            ];
        }

        $response = $this->request()->post('/instance/create', $payload);

        if ($response->failed()) {
            Log::error('Evolution API - Create Instance Failed', [
                'instance' => $instanceName,
                'error' => $response->body(),
            ]);
            throw new \Exception('Failed to create WhatsApp instance: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Get QR Code for instance
     */
    public function getQrCode(string $instanceName): array
    {
        $response = $this->request()->get("/instance/connect/{$instanceName}");

        if ($response->failed()) {
            throw new \Exception('Failed to get QR code: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Get instance connection status
     */
    public function getConnectionState(string $instanceName): array
    {
        $response = $this->request()->get("/instance/connectionState/{$instanceName}");

        if ($response->failed()) {
            throw new \Exception('Failed to get connection state: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Send a text message
     */
    public function sendText(string $instanceName, string $phone, string $message): array
    {
        $response = $this->request()->post("/message/sendText/{$instanceName}", [
            'number' => $phone,
            'text' => $message,
        ]);

        if ($response->failed()) {
            Log::error('Evolution API - Send Text Failed', [
                'instance' => $instanceName,
                'phone' => $phone,
                'error' => $response->body(),
            ]);
            throw new \Exception('Failed to send message: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Send media message (image, video, document)
     */
    public function sendMedia(string $instanceName, string $phone, string $mediaType, string $mediaUrl, ?string $caption = null): array
    {
        $payload = [
            'number' => $phone,
            'media' => $mediaUrl,
        ];

        if ($caption) {
            $payload['caption'] = $caption;
        }

        $endpoint = match ($mediaType) {
            'image' => "/message/sendMedia/{$instanceName}",
            'video' => "/message/sendMedia/{$instanceName}",
            'document' => "/message/sendMedia/{$instanceName}",
            default => "/message/sendMedia/{$instanceName}",
        };

        $payload['mediatype'] = $mediaType;

        $response = $this->request()->post($endpoint, $payload);

        if ($response->failed()) {
            throw new \Exception('Failed to send media: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Send button message
     */
    public function sendButtons(string $instanceName, string $phone, string $title, string $description, array $buttons): array
    {
        $response = $this->request()->post("/message/sendButtons/{$instanceName}", [
            'number' => $phone,
            'title' => $title,
            'description' => $description,
            'buttons' => $buttons,
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to send buttons: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Send list message
     */
    public function sendList(string $instanceName, string $phone, string $title, string $description, string $buttonText, array $sections): array
    {
        $response = $this->request()->post("/message/sendList/{$instanceName}", [
            'number' => $phone,
            'title' => $title,
            'description' => $description,
            'buttonText' => $buttonText,
            'sections' => $sections,
        ]);

        if ($response->failed()) {
            throw new \Exception('Failed to send list: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Logout and disconnect instance
     */
    public function logout(string $instanceName): array
    {
        $response = $this->request()->delete("/instance/logout/{$instanceName}");

        if ($response->failed()) {
            throw new \Exception('Failed to logout: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Delete an instance
     */
    public function deleteInstance(string $instanceName): array
    {
        $response = $this->request()->delete("/instance/delete/{$instanceName}");

        if ($response->failed()) {
            throw new \Exception('Failed to delete instance: ' . $response->body());
        }

        return $response->json();
    }

    /**
     * Fetch all instances
     */
    public function fetchInstances(): array
    {
        $response = $this->request()->get('/instance/fetchInstances');

        if ($response->failed()) {
            throw new \Exception('Failed to fetch instances: ' . $response->body());
        }

        return $response->json();
    }
}
