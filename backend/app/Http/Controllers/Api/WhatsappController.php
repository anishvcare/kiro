<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WhatsappAccount;
use App\Services\EvolutionApiService;
use App\Services\WebhookService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WhatsappController extends Controller
{
    private EvolutionApiService $evolutionApi;

    public function __construct(EvolutionApiService $evolutionApi)
    {
        $this->evolutionApi = $evolutionApi;
    }

    /**
     * List all WhatsApp accounts for the team
     */
    public function index(Request $request): JsonResponse
    {
        $accounts = WhatsappAccount::where('team_id', $request->user()->team_id)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json(['accounts' => $accounts]);
    }

    /**
     * Create a new WhatsApp instance and get QR code
     */
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'display_name' => 'required|string|max:255',
        ]);

        $user = $request->user();
        $instanceName = 'leadflow_' . $user->team_id . '_' . time();
        $webhookUrl = url("/api/webhook/whatsapp/{$instanceName}");

        try {
            $result = $this->evolutionApi->createInstance($instanceName, $webhookUrl);

            $account = WhatsappAccount::create([
                'team_id' => $user->team_id,
                'instance_name' => $instanceName,
                'display_name' => $request->display_name,
                'status' => 'connecting',
                'webhook_url' => $webhookUrl,
                'qr_code' => $result['qrcode']['base64'] ?? null,
            ]);

            return response()->json([
                'message' => 'WhatsApp instance created',
                'account' => $account,
                'qr_code' => $result['qrcode']['base64'] ?? null,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to create instance',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get QR code for connection
     */
    public function getQrCode(Request $request, WhatsappAccount $account): JsonResponse
    {
        $this->authorizeTeam($request, $account);

        try {
            $result = $this->evolutionApi->getQrCode($account->instance_name);

            $qrCode = $result['base64'] ?? $result['qrcode'] ?? null;
            $account->update(['qr_code' => $qrCode]);

            return response()->json([
                'qr_code' => $qrCode,
                'status' => $account->status,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to get QR code',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Check connection status
     */
    public function checkStatus(Request $request, WhatsappAccount $account): JsonResponse
    {
        $this->authorizeTeam($request, $account);

        try {
            $result = $this->evolutionApi->getConnectionState($account->instance_name);
            $state = $result['state'] ?? 'close';

            $status = match ($state) {
                'open' => 'connected',
                'connecting' => 'connecting',
                default => 'disconnected',
            };

            $account->update([
                'status' => $status,
                'connected_at' => $status === 'connected' ? now() : $account->connected_at,
            ]);

            return response()->json([
                'status' => $status,
                'account' => $account->fresh(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'disconnected',
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Disconnect WhatsApp account
     */
    public function disconnect(Request $request, WhatsappAccount $account): JsonResponse
    {
        $this->authorizeTeam($request, $account);

        try {
            $this->evolutionApi->logout($account->instance_name);
            $account->update(['status' => 'disconnected']);

            return response()->json(['message' => 'Disconnected successfully']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to disconnect',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete WhatsApp account
     */
    public function destroy(Request $request, WhatsappAccount $account): JsonResponse
    {
        $this->authorizeTeam($request, $account);

        try {
            $this->evolutionApi->deleteInstance($account->instance_name);
        } catch (\Exception $e) {
            // Continue with local deletion even if API fails
        }

        $account->delete();

        return response()->json(['message' => 'Account deleted']);
    }

    /**
     * Handle incoming webhook
     */
    public function webhook(Request $request, string $instanceName, WebhookService $webhookService): JsonResponse
    {
        $webhookService->handleWebhook(array_merge(
            $request->all(),
            ['instance' => $instanceName]
        ));

        return response()->json(['status' => 'ok']);
    }

    private function authorizeTeam(Request $request, WhatsappAccount $account): void
    {
        if ($account->team_id !== $request->user()->team_id) {
            abort(403, 'Unauthorized');
        }
    }
}
