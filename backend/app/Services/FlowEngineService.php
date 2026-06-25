<?php

namespace App\Services;

use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Flow;
use App\Models\FlowSession;
use App\Models\Lead;
use App\Models\LeadStage;
use Illuminate\Support\Facades\Log;

class FlowEngineService
{
    private EvolutionApiService $evolutionApi;

    public function __construct(EvolutionApiService $evolutionApi)
    {
        $this->evolutionApi = $evolutionApi;
    }

    /**
     * Start a flow for a contact
     */
    public function startFlow(Flow $flow, Contact $contact, Conversation $conversation): FlowSession
    {
        // Cancel any existing active sessions for this contact in this flow
        FlowSession::where('flow_id', $flow->id)
            ->where('contact_id', $contact->id)
            ->where('status', 'active')
            ->update(['status' => 'cancelled']);

        $nodes = $flow->nodes ?? [];
        $startNode = collect($nodes)->firstWhere('type', 'start');

        $session = FlowSession::create([
            'flow_id' => $flow->id,
            'contact_id' => $contact->id,
            'conversation_id' => $conversation->id,
            'current_node_id' => $startNode['id'] ?? null,
            'data' => [],
            'status' => 'active',
            'expires_at' => now()->addHours(24),
        ]);

        $flow->increment('executions_count');

        // Process the start node
        $this->processNode($session, $startNode);

        return $session;
    }

    /**
     * Process incoming message for an active flow session
     */
    public function processMessage(FlowSession $session, string $message): void
    {
        if ($session->status !== 'active') {
            return;
        }

        $flow = $session->flow;
        $nodes = $flow->nodes ?? [];
        $edges = $flow->edges ?? [];
        $currentNode = collect($nodes)->firstWhere('id', $session->current_node_id);

        if (!$currentNode) {
            $session->update(['status' => 'completed']);
            return;
        }

        // Handle input collection
        if (in_array($currentNode['type'] ?? '', ['input', 'question', 'menu'])) {
            $data = $session->data ?? [];

            if (isset($currentNode['data']['variable'])) {
                $data[$currentNode['data']['variable']] = $message;
            }

            $session->update(['data' => $data]);

            // Find the next node based on the response
            $nextNodeId = $this->findNextNode($currentNode, $edges, $message);

            if ($nextNodeId) {
                $nextNode = collect($nodes)->firstWhere('id', $nextNodeId);
                $session->update(['current_node_id' => $nextNodeId]);
                $this->processNode($session, $nextNode);
            } else {
                $session->update(['status' => 'completed']);
            }
        }
    }

    /**
     * Process a flow node
     */
    private function processNode(FlowSession $session, ?array $node): void
    {
        if (!$node) {
            $session->update(['status' => 'completed']);
            return;
        }

        $conversation = $session->conversation;
        $contact = $session->contact;
        $instanceName = $conversation->whatsappAccount->instance_name;

        switch ($node['type'] ?? '') {
            case 'start':
                $this->moveToNextNode($session, $node);
                break;

            case 'message':
                $text = $this->replaceVariables($node['data']['text'] ?? '', $session->data ?? [], $contact);
                $this->evolutionApi->sendText($instanceName, $contact->phone, $text);
                $this->moveToNextNode($session, $node);
                break;

            case 'menu':
                $text = $node['data']['text'] ?? '';
                $options = $node['data']['options'] ?? [];
                $menuText = $text . "\n\n";
                foreach ($options as $i => $option) {
                    $menuText .= ($i + 1) . ". {$option['label']}\n";
                }
                $this->evolutionApi->sendText($instanceName, $contact->phone, $menuText);
                // Wait for user input - don't move to next node
                break;

            case 'question':
            case 'input':
                $text = $node['data']['text'] ?? '';
                $this->evolutionApi->sendText($instanceName, $contact->phone, $text);
                // Wait for user input
                break;

            case 'condition':
                $this->processCondition($session, $node);
                break;

            case 'assign_agent':
                $this->assignAgent($session, $node);
                $this->moveToNextNode($session, $node);
                break;

            case 'save_lead':
                $this->saveLead($session, $node);
                $this->moveToNextNode($session, $node);
                break;

            case 'send_media':
                $mediaUrl = $node['data']['media_url'] ?? '';
                $mediaType = $node['data']['media_type'] ?? 'image';
                $caption = $node['data']['caption'] ?? null;
                $this->evolutionApi->sendMedia($instanceName, $contact->phone, $mediaType, $mediaUrl, $caption);
                $this->moveToNextNode($session, $node);
                break;

            case 'delay':
                // Schedule delayed processing
                $delayMinutes = $node['data']['delay_minutes'] ?? 1;
                // In production, dispatch a delayed job
                $this->moveToNextNode($session, $node);
                break;

            case 'end':
                $session->update(['status' => 'completed']);
                break;

            default:
                $this->moveToNextNode($session, $node);
                break;
        }
    }

    /**
     * Move to the next node in the flow
     */
    private function moveToNextNode(FlowSession $session, array $currentNode): void
    {
        $edges = $session->flow->edges ?? [];
        $nodes = $session->flow->nodes ?? [];

        $nextEdge = collect($edges)->firstWhere('source', $currentNode['id']);

        if ($nextEdge) {
            $nextNode = collect($nodes)->firstWhere('id', $nextEdge['target']);
            $session->update(['current_node_id' => $nextEdge['target']]);
            $this->processNode($session, $nextNode);
        } else {
            $session->update(['status' => 'completed']);
        }
    }

    /**
     * Find next node based on user's menu selection
     */
    private function findNextNode(array $currentNode, array $edges, string $message): ?string
    {
        if (($currentNode['type'] ?? '') === 'menu') {
            $options = $currentNode['data']['options'] ?? [];
            $selectedIndex = intval($message) - 1;

            if (isset($options[$selectedIndex])) {
                $targetHandle = $options[$selectedIndex]['id'] ?? "option_{$selectedIndex}";
                $edge = collect($edges)->first(function ($edge) use ($currentNode, $targetHandle) {
                    return $edge['source'] === $currentNode['id'] &&
                        ($edge['sourceHandle'] ?? '') === $targetHandle;
                });

                if ($edge) {
                    return $edge['target'];
                }
            }
        }

        // Default: find any outgoing edge
        $edge = collect($edges)->firstWhere('source', $currentNode['id']);
        return $edge['target'] ?? null;
    }

    /**
     * Process a condition node
     */
    private function processCondition(FlowSession $session, array $node): void
    {
        $data = $session->data ?? [];
        $variable = $node['data']['variable'] ?? '';
        $operator = $node['data']['operator'] ?? 'equals';
        $value = $node['data']['value'] ?? '';
        $actual = $data[$variable] ?? '';

        $result = match ($operator) {
            'equals' => strtolower($actual) === strtolower($value),
            'contains' => str_contains(strtolower($actual), strtolower($value)),
            'not_equals' => strtolower($actual) !== strtolower($value),
            default => false,
        };

        $edges = $session->flow->edges ?? [];
        $nodes = $session->flow->nodes ?? [];

        $handle = $result ? 'true' : 'false';
        $edge = collect($edges)->first(function ($edge) use ($node, $handle) {
            return $edge['source'] === $node['id'] && ($edge['sourceHandle'] ?? '') === $handle;
        });

        if ($edge) {
            $nextNode = collect($nodes)->firstWhere('id', $edge['target']);
            $session->update(['current_node_id' => $edge['target']]);
            $this->processNode($session, $nextNode);
        } else {
            $this->moveToNextNode($session, $node);
        }
    }

    /**
     * Assign an agent to the conversation
     */
    private function assignAgent(FlowSession $session, array $node): void
    {
        $assignType = $node['data']['assign_type'] ?? 'round_robin';
        $conversation = $session->conversation;
        $team = $conversation->team;

        // Simple round-robin assignment
        $agents = $team->users()
            ->where('role', 'agent')
            ->where('is_active', true)
            ->get();

        if ($agents->isNotEmpty()) {
            $agent = $agents->random();
            $conversation->update(['assigned_to' => $agent->id]);
            $session->contact->update(['assigned_to' => $agent->id]);
        }
    }

    /**
     * Save collected data as a lead
     */
    private function saveLead(FlowSession $session, array $node): void
    {
        $data = $session->data ?? [];
        $contact = $session->contact;
        $team = $contact->team;

        // Update contact with collected data
        if (isset($data['name'])) $contact->update(['name' => $data['name']]);
        if (isset($data['place'])) $contact->update(['place' => $data['place']]);

        // Find default pipeline first stage
        $pipeline = $team->pipelines()->first();
        $stage = $pipeline ? $pipeline->stages()->orderBy('sort_order')->first() : null;

        if ($stage) {
            Lead::create([
                'team_id' => $team->id,
                'contact_id' => $contact->id,
                'stage_id' => $stage->id,
                'title' => $data['course_interest'] ?? 'New Lead from Flow',
                'course_interest' => $data['course_interest'] ?? null,
                'budget' => $data['budget'] ?? null,
                'status' => 'open',
                'last_activity_at' => now(),
            ]);
        }
    }

    /**
     * Replace variables in text with actual values
     */
    private function replaceVariables(string $text, array $data, Contact $contact): string
    {
        $replacements = array_merge($data, [
            'contact_name' => $contact->name ?? 'there',
            'contact_phone' => $contact->phone,
        ]);

        foreach ($replacements as $key => $value) {
            $text = str_replace("{{$key}}", $value, $text);
        }

        return $text;
    }
}
