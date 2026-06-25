"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Campaign, WhatsappAccount } from "@/lib/types";
import { Send, Plus, Play, X, Trash2, StopCircle, BarChart3 } from "lucide-react";
import toast from "react-hot-toast";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [accounts, setAccounts] = useState<WhatsappAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp_account_id: "",
    type: "text",
    message_body: "",
    recipients: [] as number[],
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, accountsRes] = await Promise.all([
        api.get("/campaigns"),
        api.get("/whatsapp/accounts"),
      ]);
      setCampaigns(campaignsRes.data.data || []);
      setAccounts(accountsRes.data.accounts || []);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/campaigns", {
        ...formData,
        whatsapp_account_id: parseInt(formData.whatsapp_account_id),
        recipients: [], // Will be added later
      });
      toast.success("Campaign created");
      setShowModal(false);
      fetchData();
    } catch {
      toast.error("Failed to create campaign");
    }
  };

  const sendCampaign = async (id: number) => {
    if (!confirm("Start sending this campaign?")) return;
    try {
      await api.post(`/campaigns/${id}/send`);
      toast.success("Campaign started");
      fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to send");
    }
  };

  const cancelCampaign = async (id: number) => {
    try {
      await api.post(`/campaigns/${id}/cancel`);
      toast.success("Campaign cancelled");
      fetchData();
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm("Delete this campaign?")) return;
    try {
      await api.delete(`/campaigns/${id}`);
      toast.success("Campaign deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "badge-blue";
      case "scheduled": return "badge-purple";
      case "sending": return "badge-yellow";
      case "completed": return "badge-green";
      case "cancelled": return "badge-red";
      default: return "badge-blue";
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
          <h1 className="text-2xl font-bold text-white">Campaigns</h1>
          <p className="text-slate-400 mt-1">Send bulk WhatsApp messages</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {campaigns.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <Send className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No campaigns yet. Create your first campaign.</p>
          </div>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{campaign.name}</h3>
                <span className={getStatusColor(campaign.status)}>{campaign.status}</span>
              </div>
              <p className="text-xs text-slate-400 mb-4 line-clamp-2">{campaign.message_body}</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-white">{campaign.total_recipients}</p>
                  <p className="text-xs text-slate-400">Recipients</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-emerald-400">{campaign.sent_count}</p>
                  <p className="text-xs text-slate-400">Sent</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-blue-400">{campaign.delivered_count}</p>
                  <p className="text-xs text-slate-400">Delivered</p>
                </div>
                <div className="bg-slate-900/50 rounded-lg p-2 text-center">
                  <p className="text-lg font-bold text-red-400">{campaign.failed_count}</p>
                  <p className="text-xs text-slate-400">Failed</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                {campaign.status === "draft" && (
                  <button onClick={() => sendCampaign(campaign.id)} className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                    <Play className="w-3 h-3" /> Send
                  </button>
                )}
                {campaign.status === "sending" && (
                  <button onClick={() => cancelCampaign(campaign.id)} className="btn-danger text-xs py-1.5 px-3 flex items-center gap-1">
                    <StopCircle className="w-3 h-3" /> Cancel
                  </button>
                )}
                <button onClick={() => deleteCampaign(campaign.id)} className="text-red-400 hover:text-red-300 ml-auto p-1.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">New Campaign</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createCampaign} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Campaign Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">WhatsApp Account *</label>
                <select
                  value={formData.whatsapp_account_id}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp_account_id: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">Select account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.display_name} ({acc.status})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Message Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                  className="input-field"
                >
                  <option value="text">Text</option>
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="document">Document (PDF)</option>
                  <option value="button">Button Message</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Message *</label>
                <textarea
                  value={formData.message_body}
                  onChange={(e) => setFormData((p) => ({ ...p, message_body: e.target.value }))}
                  className="input-field"
                  rows={4}
                  placeholder="Type your campaign message..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
