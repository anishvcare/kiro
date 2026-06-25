"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store";
import { Settings, Bot, Bell, Key, Globe } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState("general");
  const [aiSettings, setAiSettings] = useState({
    name: "AI Assistant",
    system_prompt: "You are a helpful customer support assistant for an educational consultancy. Answer queries about MBBS admission, study abroad programs, and visa services in a friendly manner.",
    knowledge_base: "",
    model: "gpt-4o-mini",
    temperature: 0.7,
    max_tokens: 500,
    is_active: false,
  });

  const saveAiSettings = async () => {
    try {
      // This would call a settings API endpoint
      toast.success("AI settings saved");
    } catch {
      toast.error("Failed to save");
    }
  };

  const tabs = [
    { key: "general", label: "General", icon: Settings },
    { key: "ai", label: "AI Chatbot", icon: Bot },
    { key: "notifications", label: "Notifications", icon: Bell },
    { key: "api", label: "API Keys", icon: Key },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 mt-1">Configure your CRM platform</p>
      </div>

      <div className="flex gap-6">
        {/* Settings Nav */}
        <div className="w-48 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`w-full text-left px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 transition-colors ${
                  activeTab === tab.key
                    ? "bg-emerald-600/20 text-white border border-emerald-500/30"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content */}
        <div className="flex-1">
          {activeTab === "general" && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">General Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Business Name</label>
                  <input type="text" defaultValue={user?.team?.name} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Plan</label>
                  <div className="flex items-center gap-3">
                    <span className="badge-green capitalize">{user?.team?.plan || "free"}</span>
                    <button className="text-sm text-emerald-400 hover:text-emerald-300">Upgrade</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Timezone</label>
                  <select className="input-field">
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </div>
                <button className="btn-primary">Save Changes</button>
              </div>
            </div>
          )}

          {activeTab === "ai" && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">AI Chatbot Configuration</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Enable AI Chatbot</p>
                    <p className="text-xs text-slate-400">AI will respond when no keyword or flow matches</p>
                  </div>
                  <button
                    onClick={() => setAiSettings((p) => ({ ...p, is_active: !p.is_active }))}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      aiSettings.is_active ? "bg-emerald-600" : "bg-slate-700"
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      aiSettings.is_active ? "translate-x-6" : "translate-x-0.5"
                    }`}></div>
                  </button>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Bot Name</label>
                  <input
                    type="text"
                    value={aiSettings.name}
                    onChange={(e) => setAiSettings((p) => ({ ...p, name: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">System Prompt</label>
                  <textarea
                    value={aiSettings.system_prompt}
                    onChange={(e) => setAiSettings((p) => ({ ...p, system_prompt: e.target.value }))}
                    className="input-field"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Knowledge Base</label>
                  <textarea
                    value={aiSettings.knowledge_base}
                    onChange={(e) => setAiSettings((p) => ({ ...p, knowledge_base: e.target.value }))}
                    className="input-field"
                    rows={4}
                    placeholder="Add information about your business, services, pricing..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Model</label>
                    <select
                      value={aiSettings.model}
                      onChange={(e) => setAiSettings((p) => ({ ...p, model: e.target.value }))}
                      className="input-field"
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini (Faster)</option>
                      <option value="gpt-4o">GPT-4o (Smarter)</option>
                      <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Budget)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-300 mb-1">Temperature ({aiSettings.temperature})</label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={aiSettings.temperature}
                      onChange={(e) => setAiSettings((p) => ({ ...p, temperature: parseFloat(e.target.value) }))}
                      className="w-full mt-2"
                    />
                  </div>
                </div>
                <button onClick={saveAiSettings} className="btn-primary">Save AI Settings</button>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">Notification Settings</h2>
              <div className="space-y-4">
                {["New Lead", "New Message", "Campaign Completed", "Follow-up Due"].map((item) => (
                  <div key={item} className="flex items-center justify-between py-2">
                    <span className="text-sm text-slate-300">{item}</span>
                    <button className="w-12 h-6 rounded-full bg-emerald-600">
                      <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "api" && (
            <div className="card">
              <h2 className="text-lg font-semibold text-white mb-4">API Configuration</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Evolution API URL</label>
                  <input type="text" className="input-field" placeholder="http://localhost:8080" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Evolution API Key</label>
                  <input type="password" className="input-field" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">OpenAI API Key</label>
                  <input type="password" className="input-field" placeholder="sk-••••••••" />
                </div>
                <button className="btn-primary">Save API Keys</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
