"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Flow, KeywordAutomation } from "@/lib/types";
import {
  GitBranch,
  Plus,
  Zap,
  Play,
  Pause,
  Trash2,
  Edit,
  X,
  MessageSquare,
  Hash,
} from "lucide-react";
import toast from "react-hot-toast";

export default function FlowsPage() {
  const [flows, setFlows] = useState<Flow[]>([]);
  const [keywords, setKeywords] = useState<KeywordAutomation[]>([]);
  const [activeTab, setActiveTab] = useState<"flows" | "keywords">("flows");
  const [loading, setLoading] = useState(true);
  const [showFlowModal, setShowFlowModal] = useState(false);
  const [showKeywordModal, setShowKeywordModal] = useState(false);
  const [flowForm, setFlowForm] = useState({
    name: "",
    description: "",
    trigger_type: "keyword" as string,
    trigger_keywords: "",
  });
  const [keywordForm, setKeywordForm] = useState({
    keyword: "",
    match_type: "contains" as string,
    response_type: "text" as string,
    response_text: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [flowsRes, keywordsRes] = await Promise.all([
        api.get("/flows"),
        api.get("/keywords"),
      ]);
      setFlows(flowsRes.data.flows || []);
      setKeywords(keywordsRes.data.keywords || []);
    } catch {
      console.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const createFlow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/flows", {
        ...flowForm,
        trigger_keywords: flowForm.trigger_keywords
          ? flowForm.trigger_keywords.split(",").map((k) => k.trim())
          : [],
        nodes: [
          { id: "start_1", type: "start", position: { x: 250, y: 50 }, data: { label: "Start" } },
          { id: "msg_1", type: "message", position: { x: 250, y: 200 }, data: { text: "Hello! How can I help you?" } },
        ],
        edges: [{ id: "e_start_msg", source: "start_1", target: "msg_1" }],
      });
      toast.success("Flow created");
      setShowFlowModal(false);
      setFlowForm({ name: "", description: "", trigger_type: "keyword", trigger_keywords: "" });
      fetchData();
    } catch {
      toast.error("Failed to create flow");
    }
  };

  const createKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/keywords", keywordForm);
      toast.success("Keyword automation created");
      setShowKeywordModal(false);
      setKeywordForm({ keyword: "", match_type: "contains", response_type: "text", response_text: "" });
      fetchData();
    } catch {
      toast.error("Failed to create keyword");
    }
  };

  const toggleFlow = async (flow: Flow) => {
    try {
      await api.put(`/flows/${flow.id}`, { is_active: !flow.is_active });
      toast.success(flow.is_active ? "Flow paused" : "Flow activated");
      fetchData();
    } catch {
      toast.error("Failed to update flow");
    }
  };

  const deleteFlow = async (id: number) => {
    if (!confirm("Delete this flow?")) return;
    try {
      await api.delete(`/flows/${id}`);
      toast.success("Flow deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const deleteKeyword = async (id: number) => {
    if (!confirm("Delete this keyword automation?")) return;
    try {
      await api.delete(`/keywords/${id}`);
      toast.success("Keyword deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete");
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
          <h1 className="text-2xl font-bold text-white">Automation</h1>
          <p className="text-slate-400 mt-1">Build flows and keyword automations</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowKeywordModal(true)} className="btn-secondary flex items-center gap-2">
            <Hash className="w-4 h-4" /> Add Keyword
          </button>
          <button onClick={() => setShowFlowModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Flow
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("flows")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "flows" ? "border-emerald-500 text-white" : "border-transparent text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4" /> Flows ({flows.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab("keywords")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "keywords" ? "border-emerald-500 text-white" : "border-transparent text-slate-400"
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" /> Keywords ({keywords.length})
          </div>
        </button>
      </div>

      {/* Flows List */}
      {activeTab === "flows" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flows.length === 0 ? (
            <div className="col-span-full text-center py-12 card">
              <GitBranch className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400">No flows yet. Create your first automation flow.</p>
            </div>
          ) : (
            flows.map((flow) => (
              <div key={flow.id} className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-white">{flow.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{flow.description || "No description"}</p>
                  </div>
                  <span className={flow.is_active ? "badge-green" : "badge-red"}>
                    {flow.is_active ? "Active" : "Paused"}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                  <span>Trigger: {flow.trigger_type}</span>
                  <span>{flow.executions_count} runs</span>
                </div>
                {flow.trigger_keywords && flow.trigger_keywords.length > 0 && (
                  <div className="flex gap-1 flex-wrap mb-4">
                    {flow.trigger_keywords.map((kw) => (
                      <span key={kw} className="badge-blue text-xs">{kw}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                  <button onClick={() => toggleFlow(flow)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                    {flow.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                    {flow.is_active ? "Pause" : "Activate"}
                  </button>
                  <button onClick={() => deleteFlow(flow.id)} className="text-red-400 hover:text-red-300 p-1.5">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Keywords List */}
      {activeTab === "keywords" && (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Keyword</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Match</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Response</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Triggered</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {keywords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No keyword automations yet.
                  </td>
                </tr>
              ) : (
                keywords.map((kw) => (
                  <tr key={kw.id} className="border-b border-slate-700/50">
                    <td className="py-3 px-4">
                      <span className="badge-purple">{kw.keyword}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300 capitalize">{kw.match_type}</td>
                    <td className="py-3 px-4 text-sm text-slate-300 max-w-xs truncate">
                      {kw.response_text || `Flow #${kw.flow_id}`}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400">{kw.triggered_count}</td>
                    <td className="py-3 px-4">
                      <span className={kw.is_active ? "badge-green" : "badge-red"}>
                        {kw.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button onClick={() => deleteKeyword(kw.id)} className="text-red-400 hover:text-red-300">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Flow Modal */}
      {showFlowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Create Flow</h2>
              <button onClick={() => setShowFlowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createFlow} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Flow Name *</label>
                <input
                  type="text"
                  value={flowForm.name}
                  onChange={(e) => setFlowForm((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., MBBS Admission Flow"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Description</label>
                <textarea
                  value={flowForm.description}
                  onChange={(e) => setFlowForm((p) => ({ ...p, description: e.target.value }))}
                  className="input-field"
                  rows={2}
                  placeholder="What does this flow do?"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Trigger Type</label>
                <select
                  value={flowForm.trigger_type}
                  onChange={(e) => setFlowForm((p) => ({ ...p, trigger_type: e.target.value }))}
                  className="input-field"
                >
                  <option value="keyword">Keyword</option>
                  <option value="new_contact">New Contact</option>
                  <option value="webhook">Webhook</option>
                  <option value="manual">Manual</option>
                </select>
              </div>
              {flowForm.trigger_type === "keyword" && (
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Keywords (comma separated)</label>
                  <input
                    type="text"
                    value={flowForm.trigger_keywords}
                    onChange={(e) => setFlowForm((p) => ({ ...p, trigger_keywords: e.target.value }))}
                    className="input-field"
                    placeholder="MBBS, admission, fee"
                  />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowFlowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Flow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Keyword Modal */}
      {showKeywordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Add Keyword Automation</h2>
              <button onClick={() => setShowKeywordModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createKeyword} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Keyword *</label>
                <input
                  type="text"
                  value={keywordForm.keyword}
                  onChange={(e) => setKeywordForm((p) => ({ ...p, keyword: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Fee"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Match Type</label>
                <select
                  value={keywordForm.match_type}
                  onChange={(e) => setKeywordForm((p) => ({ ...p, match_type: e.target.value }))}
                  className="input-field"
                >
                  <option value="contains">Contains</option>
                  <option value="exact">Exact Match</option>
                  <option value="starts_with">Starts With</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Response Text *</label>
                <textarea
                  value={keywordForm.response_text}
                  onChange={(e) => setKeywordForm((p) => ({ ...p, response_text: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Auto-reply message..."
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowKeywordModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
