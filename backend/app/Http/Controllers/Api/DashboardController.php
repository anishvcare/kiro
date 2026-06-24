<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Campaign;
use App\Models\Contact;
use App\Models\Conversation;
use App\Models\Lead;
use App\Models\Message;
use App\Models\Referral;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $teamId = $request->user()->team_id;
        $today = now()->startOfDay();
        $thisWeek = now()->startOfWeek();
        $thisMonth = now()->startOfMonth();

        // Today's stats
        $leadsToday = Lead::where('team_id', $teamId)
            ->whereDate('created_at', today())
            ->count();

        $messagesToday = Message::whereHas('conversation', fn($q) => $q->where('team_id', $teamId))
            ->whereDate('created_at', today())
            ->count();

        $conversionsThisMonth = Lead::where('team_id', $teamId)
            ->where('status', 'won')
            ->where('won_at', '>=', $thisMonth)
            ->count();

        $totalLeadsThisMonth = Lead::where('team_id', $teamId)
            ->where('created_at', '>=', $thisMonth)
            ->count();

        $conversionRate = $totalLeadsThisMonth > 0
            ? round(($conversionsThisMonth / $totalLeadsThisMonth) * 100, 1)
            : 0;

        // Active conversations
        $activeConversations = Conversation::where('team_id', $teamId)
            ->where('status', 'open')
            ->count();

        $unreadMessages = Conversation::where('team_id', $teamId)
            ->where('is_unread', true)
            ->sum('unread_count');

        // Campaign stats
        $activeCampaigns = Campaign::where('team_id', $teamId)
            ->whereIn('status', ['sending', 'scheduled'])
            ->count();

        // Total contacts
        $totalContacts = Contact::where('team_id', $teamId)->count();

        // Leads by stage (for pipeline overview)
        $leadsByStage = Lead::where('team_id', $teamId)
            ->where('status', 'open')
            ->selectRaw('stage_id, COUNT(*) as count')
            ->groupBy('stage_id')
            ->with('stage:id,name,color')
            ->get();

        // Recent leads
        $recentLeads = Lead::where('team_id', $teamId)
            ->with(['contact', 'stage', 'assignedUser'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        // Agent performance
        $agentPerformance = Lead::where('team_id', $teamId)
            ->whereNotNull('assigned_to')
            ->where('created_at', '>=', $thisMonth)
            ->selectRaw('assigned_to, COUNT(*) as total_leads, SUM(CASE WHEN status = "won" THEN 1 ELSE 0 END) as won_leads')
            ->groupBy('assigned_to')
            ->with('assignedUser:id,name')
            ->get();

        return response()->json([
            'stats' => [
                'leads_today' => $leadsToday,
                'messages_today' => $messagesToday,
                'conversion_rate' => $conversionRate,
                'active_conversations' => $activeConversations,
                'unread_messages' => $unreadMessages,
                'active_campaigns' => $activeCampaigns,
                'total_contacts' => $totalContacts,
            ],
            'leads_by_stage' => $leadsByStage,
            'recent_leads' => $recentLeads,
            'agent_performance' => $agentPerformance,
        ]);
    }

    /**
     * Reports endpoint with date filtering
     */
    public function reports(Request $request): JsonResponse
    {
        $teamId = $request->user()->team_id;
        $from = $request->get('from', now()->subDays(30)->toDateString());
        $to = $request->get('to', now()->toDateString());

        // Leads over time
        $leadsOverTime = Lead::where('team_id', $teamId)
            ->whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Messages over time
        $messagesOverTime = Message::whereHas('conversation', fn($q) => $q->where('team_id', $teamId))
            ->whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Campaign performance
        $campaignStats = Campaign::where('team_id', $teamId)
            ->where('status', 'completed')
            ->whereBetween('completed_at', [$from, $to . ' 23:59:59'])
            ->get(['id', 'name', 'total_recipients', 'sent_count', 'delivered_count', 'read_count', 'failed_count']);

        // Conversion funnel
        $totalLeads = Lead::where('team_id', $teamId)->whereBetween('created_at', [$from, $to . ' 23:59:59'])->count();
        $wonLeads = Lead::where('team_id', $teamId)->where('status', 'won')->whereBetween('won_at', [$from, $to . ' 23:59:59'])->count();
        $lostLeads = Lead::where('team_id', $teamId)->where('status', 'lost')->whereBetween('lost_at', [$from, $to . ' 23:59:59'])->count();

        // Referral stats
        $referralStats = Referral::where('team_id', $teamId)
            ->whereBetween('created_at', [$from, $to . ' 23:59:59'])
            ->selectRaw('status, COUNT(*) as count, SUM(commission_amount) as total_commission')
            ->groupBy('status')
            ->get();

        return response()->json([
            'leads_over_time' => $leadsOverTime,
            'messages_over_time' => $messagesOverTime,
            'campaign_stats' => $campaignStats,
            'funnel' => [
                'total_leads' => $totalLeads,
                'won' => $wonLeads,
                'lost' => $lostLeads,
                'open' => $totalLeads - $wonLeads - $lostLeads,
            ],
            'referral_stats' => $referralStats,
        ]);
    }
}
