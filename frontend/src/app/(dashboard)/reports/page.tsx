"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { BarChart3, TrendingUp, Target, MessageSquare } from "lucide-react";

interface ReportData {
  leads_over_time: { date: string; count: number }[];
  messages_over_time: { date: string; count: number }[];
  funnel: { total_leads: number; won: number; lost: number; open: number };
  campaign_stats: { id: number; name: string; total_recipients: number; sent_count: number; delivered_count: number; read_count: number }[];
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const fetchReports = async () => {
    try {
      const response = await api.get("/reports", { params: dateRange });
      setData(response.data);
    } catch {
      console.error("Failed to fetch reports");
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports</h1>
          <p className="text-slate-400 mt-1">Analytics and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            className="input-field text-sm py-1.5"
          />
          <span className="text-slate-400">to</span>
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            className="input-field text-sm py-1.5"
          />
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card text-center">
          <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{data?.funnel.total_leads || 0}</p>
          <p className="text-xs text-slate-400">Total Leads</p>
        </div>
        <div className="card text-center">
          <TrendingUp className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{data?.funnel.open || 0}</p>
          <p className="text-xs text-slate-400">Open / Active</p>
        </div>
        <div className="card text-center">
          <BarChart3 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{data?.funnel.won || 0}</p>
          <p className="text-xs text-slate-400">Converted</p>
        </div>
        <div className="card text-center">
          <MessageSquare className="w-8 h-8 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-white">{data?.funnel.lost || 0}</p>
          <p className="text-xs text-slate-400">Lost</p>
        </div>
      </div>

      {/* Leads Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Leads Over Time</h3>
          {(data?.leads_over_time || []).length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data for selected period</p>
          ) : (
            <div className="space-y-2">
              {(data?.leads_over_time || []).slice(-14).map((item) => (
                <div key={item.date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-20">{new Date(item.date).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  <div className="flex-1 h-5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{ width: `${Math.min((item.count / (Math.max(...(data?.leads_over_time || []).map(d => d.count)) || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Messages Over Time</h3>
          {(data?.messages_over_time || []).length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-8">No data for selected period</p>
          ) : (
            <div className="space-y-2">
              {(data?.messages_over_time || []).slice(-14).map((item) => (
                <div key={item.date} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-20">{new Date(item.date).toLocaleDateString([], { month: "short", day: "numeric" })}</span>
                  <div className="flex-1 h-5 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${Math.min((item.count / (Math.max(...(data?.messages_over_time || []).map(d => d.count)) || 1)) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-white w-8 text-right">{item.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaign Performance */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Campaign Performance</h3>
        {(data?.campaign_stats || []).length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No completed campaigns in this period</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Campaign</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Recipients</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Sent</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Delivered</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Read</th>
              </tr>
            </thead>
            <tbody>
              {(data?.campaign_stats || []).map((camp) => (
                <tr key={camp.id} className="border-b border-slate-700/50">
                  <td className="py-3 px-4 text-sm text-white">{camp.name}</td>
                  <td className="py-3 px-4 text-sm text-slate-300">{camp.total_recipients}</td>
                  <td className="py-3 px-4 text-sm text-slate-300">{camp.sent_count}</td>
                  <td className="py-3 px-4 text-sm text-slate-300">{camp.delivered_count}</td>
                  <td className="py-3 px-4 text-sm text-slate-300">{camp.read_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
