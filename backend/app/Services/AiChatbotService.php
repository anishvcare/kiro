<?php

namespace App\Services;

use App\Models\AiChatbotSetting;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

class AiChatbotService
{
    /**
     * Generate AI response for a message
     */
    public function generateResponse(Conversation $conversation, string $userMessage): ?string
    {
        $settings = AiChatbotSetting::where('team_id', $conversation->team_id)
            ->where('is_active', true)
            ->first();

        if (!$settings) {
            return null;
        }

        // Check if AI should respond (based on triggers/exclusions)
        if (!$this->shouldRespond($settings, $userMessage)) {
            return null;
        }

        try {
            $contact = $conversation->contact;
            $recentMessages = $conversation->messages()
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get()
                ->reverse();

            $messages = $this->buildConversationContext($settings, $contact, $recentMessages, $userMessage);

            $response = OpenAI::chat()->create([
                'model' => $settings->model,
                'messages' => $messages,
                'temperature' => $settings->temperature,
                'max_tokens' => $settings->max_tokens,
            ]);

            $aiResponse = $response->choices[0]->message->content ?? null;
            $tokensUsed = $response->usage->totalTokens ?? 0;

            // Log the AI interaction
            \DB::table('ai_chat_logs')->insert([
                'team_id' => $conversation->team_id,
                'conversation_id' => $conversation->id,
                'contact_id' => $contact->id,
                'user_message' => $userMessage,
                'ai_response' => $aiResponse ?? '',
                'tokens_used' => $tokensUsed,
                'response_time' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return $aiResponse;
        } catch (\Exception $e) {
            Log::error('AI Chatbot Error', [
                'conversation_id' => $conversation->id,
                'error' => $e->getMessage(),
            ]);
            return null;
        }
    }

    /**
     * Check if AI should respond to this message
     */
    private function shouldRespond(AiChatbotSetting $settings, string $message): bool
    {
        // Check excluded keywords
        $excludedKeywords = $settings->excluded_keywords ?? [];
        foreach ($excludedKeywords as $keyword) {
            if (str_contains(strtolower($message), strtolower($keyword))) {
                return false;
            }
        }

        // Check triggers (if set, only respond to specific patterns)
        $triggers = $settings->triggers ?? [];
        if (!empty($triggers)) {
            foreach ($triggers as $trigger) {
                if (str_contains(strtolower($message), strtolower($trigger))) {
                    return true;
                }
            }
            return false; // No trigger matched
        }

        return true; // No triggers set, respond to all
    }

    /**
     * Build conversation context for OpenAI
     */
    private function buildConversationContext(AiChatbotSetting $settings, Contact $contact, $recentMessages, string $currentMessage): array
    {
        $systemPrompt = $settings->system_prompt ?? "You are a helpful customer support assistant.";

        // Add knowledge base context
        if ($settings->knowledge_base) {
            $systemPrompt .= "\n\nKnowledge Base:\n" . $settings->knowledge_base;
        }

        // Add contact context
        $systemPrompt .= "\n\nCustomer Info:";
        if ($contact->name) $systemPrompt .= "\nName: {$contact->name}";
        if ($contact->phone) $systemPrompt .= "\nPhone: {$contact->phone}";
        if ($contact->place) $systemPrompt .= "\nLocation: {$contact->place}";

        $messages = [
            ['role' => 'system', 'content' => $systemPrompt],
        ];

        // Add recent conversation history
        foreach ($recentMessages as $msg) {
            $role = $msg->direction === 'inbound' ? 'user' : 'assistant';
            if ($msg->body) {
                $messages[] = ['role' => $role, 'content' => $msg->body];
            }
        }

        // Add current message
        $messages[] = ['role' => 'user', 'content' => $currentMessage];

        return $messages;
    }
}
