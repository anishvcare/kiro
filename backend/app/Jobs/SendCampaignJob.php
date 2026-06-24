<?php

namespace App\Jobs;

use App\Models\Campaign;
use App\Models\CampaignLog;
use App\Models\Contact;
use App\Services\EvolutionApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendCampaignJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $timeout = 3600;
    public int $tries = 1;

    public function __construct(private Campaign $campaign)
    {
    }

    public function handle(EvolutionApiService $evolutionApi): void
    {
        $campaign = $this->campaign;
        $instanceName = $campaign->whatsappAccount->instance_name;
        $recipients = $campaign->recipients ?? [];

        $contacts = Contact::whereIn('id', $recipients)->get();

        foreach ($contacts as $contact) {
            try {
                match ($campaign->type) {
                    'text' => $evolutionApi->sendText($instanceName, $contact->phone, $campaign->message_body),
                    'image', 'video', 'document' => $evolutionApi->sendMedia(
                        $instanceName,
                        $contact->phone,
                        $campaign->type,
                        $campaign->media['url'] ?? '',
                        $campaign->message_body
                    ),
                    'button' => $evolutionApi->sendButtons(
                        $instanceName,
                        $contact->phone,
                        $campaign->name,
                        $campaign->message_body,
                        $campaign->buttons ?? []
                    ),
                    default => $evolutionApi->sendText($instanceName, $contact->phone, $campaign->message_body),
                };

                CampaignLog::create([
                    'campaign_id' => $campaign->id,
                    'contact_id' => $contact->id,
                    'status' => 'sent',
                    'sent_at' => now(),
                ]);

                $campaign->increment('sent_count');

                // Rate limiting: wait between messages
                usleep(500000); // 0.5 second delay
            } catch (\Exception $e) {
                CampaignLog::create([
                    'campaign_id' => $campaign->id,
                    'contact_id' => $contact->id,
                    'status' => 'failed',
                    'error_message' => $e->getMessage(),
                ]);

                $campaign->increment('failed_count');
                Log::error('Campaign send failed', [
                    'campaign_id' => $campaign->id,
                    'contact_id' => $contact->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        $campaign->update([
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}
