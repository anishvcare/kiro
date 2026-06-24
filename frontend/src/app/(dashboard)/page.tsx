"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { DashboardStats, Lead } from "@/lib/types";
import {
  Target,
  MessageSquare,
  TrendingUp,
  Users,
  Mail,
  Send,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentLeads, setRecentLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard");
      setStats(response.data.stats);
      setRecentLeads(response.data.recent_leads || []);
    } catch (error) {
      console.error("Failed to load dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  const statCards = [
    {
      label: "Leads Today",
      value: stats?.leads_today || 0,
      icon: Target,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      label: "Messages Today",
      value: stats?.messages_today || 0,
      icon: MessageSquare,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      trend: "+8%",
      trendUp: true,
    },
    {
      label: "Conversion Rate",
      value: `${stats?.conversion_rate || 0}%`,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      trend: "+3%",
      trendUp: true,
    },
    {
      label: "Total Contacts",
      value: stats?.total_contacts || 0,
      icon: Users,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      trend: "+25",
      trendUp: true,
    },
    {
      label: "Unread Messages",
      value: stats?.unread_messages || 0,
      icon: Mail,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/10",
      trend: "",
      trendUp: false,
    },
    {
      label: "Active Campaigns",
      value: stats?.active_campaigns || 0,
      icon: Send,
      color: "text-pink-400",
      bgColor: "bg-pink-500/10",
      trend: "",
      trendUp: false,
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome back! Here&apos;s your overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="card flex items-center gap-4">
              <div className={`w-12 h-12 ${card.bgColor} rounded-xl flex items-center justify-center`}>
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-400">{card.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">{card.value}</p>
                  {card.trend && (
                    <span className={`flex items-center text-xs ${card.trendUp ? "text-emerald-400" : "text-red-400"}`}>
                      {card.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {card.trend}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Leads */}
      <div className="card">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Leads</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Stage</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Priority</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Assigned To</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentLeads.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-400">
                    No leads yet. Connect WhatsApp to start receiving leads.
                  </td>
                </tr>
              ) : (
                recentLeads.map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm font-medium text-white">{lead.contact?.name || lead.contact?.phone}</p>
                        <p className="text-xs text-slate-400">{lead.contact?.phone}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="badge"
                        style={{ backgroundColor: `${lead.stage?.color}20`, color: lead.stage?.color }}
                      >
                        {lead.stage?.name}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        lead.priority === "urgent" ? "badge-red" :
                        lead.priority === "high" ? "badge-yellow" :
                        lead.priority === "medium" ? "badge-blue" : "badge-green"
                      }`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">
                      {lead.assigned_user?.name || "Unassigned"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
