<?php

namespace App\Jobs;

use App\Models\FollowUpEnrollment;
use App\Models\FollowUpStep;
use App\Models\Message;
use App\Services\EvolutionApiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessFollowUpsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function handle(EvolutionApiService $evolutionApi): void
    {
        $enrollments = FollowUpEnrollment::where('status', 'active')
            ->where('next_send_at', '<=', now())
            ->with(['sequence.steps', 'contact', 'conversation.whatsappAccount'])
            ->get();

        foreach ($enrollments as $enrollment) {
            try {
                $steps = $enrollment->sequence->steps()->orderBy('sort_order')->get();
                $currentStep = $steps->get($enrollment->current_step);

                if (!$currentStep) {
                    $enrollment->update(['status' => 'completed']);
                    continue;
                }

                $conversation = $enrollment->conversation;
                $contact = $enrollment->contact;
                $instanceName = $conversation->whatsappAccount->instance_name;

                // Send the message
                $evolutionApi->sendText($instanceName, $contact->phone, $currentStep->message_body);

                // Save as message
                Message::create([
                    'conversation_id' => $conversation->id,
                    'type' => $currentStep->message_type,
                    'direction' => 'outbound',
                    'body' => $currentStep->message_body,
                    'media' => $currentStep->media,
                    'status' => 'sent',
                    'is_from_bot' => true,
                    'sent_at' => now(),
                ]);

                // Move to next step
                $nextStepIndex = $enrollment->current_step + 1;
                $nextStep = $steps->get($nextStepIndex);

                if ($nextStep) {
                    $enrollment->update([
                        'current_step' => $nextStepIndex,
                        'next_send_at' => now()->addDays($nextStep->delay_days)->addHours($nextStep->delay_hours),
                    ]);
                } else {
                    $enrollment->update(['status' => 'completed']);
                }
            } catch (\Exception $e) {
                Log::error('Follow-up send failed', [
                    'enrollment_id' => $enrollment->id,
                    'error' => $e->getMessage(),
                ]);
            }
        }
    }
}
