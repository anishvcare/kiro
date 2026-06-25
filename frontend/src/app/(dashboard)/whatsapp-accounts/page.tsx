"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { WhatsappAccount } from "@/lib/types";
import { Smartphone, Plus, QrCode, Wifi, WifiOff, Trash2, RefreshCw, X } from "lucide-react";
import toast from "react-hot-toast";

export default function WhatsAppAccountsPage() {
  const [accounts, setAccounts] = useState<WhatsappAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeQr, setActiveQr] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await api.get("/whatsapp/accounts");
      setAccounts(response.data.accounts || []);
    } catch {
      console.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const response = await api.post("/whatsapp/accounts", { display_name: displayName });
      toast.success("WhatsApp instance created!");
      setShowCreateModal(false);
      setDisplayName("");

      if (response.data.qr_code) {
        setActiveQr(response.data.qr_code);
        setShowQrModal(true);
      }
      fetchAccounts();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to create instance");
    } finally {
      setCreating(false);
    }
  };

  const refreshQr = async (account: WhatsappAccount) => {
    try {
      const response = await api.get(`/whatsapp/accounts/${account.id}/qr`);
      setActiveQr(response.data.qr_code);
      setShowQrModal(true);
    } catch {
      toast.error("Failed to get QR code");
    }
  };

  const checkStatus = async (account: WhatsappAccount) => {
    try {
      const response = await api.get(`/whatsapp/accounts/${account.id}/status`);
      toast.success(`Status: ${response.data.status}`);
      fetchAccounts();
    } catch {
      toast.error("Failed to check status");
    }
  };

  const disconnectAccount = async (account: WhatsappAccount) => {
    if (!confirm("Disconnect this WhatsApp account?")) return;
    try {
      await api.post(`/whatsapp/accounts/${account.id}/disconnect`);
      toast.success("Disconnected");
      fetchAccounts();
    } catch {
      toast.error("Failed to disconnect");
    }
  };

  const deleteAccount = async (account: WhatsappAccount) => {
    if (!confirm("Delete this WhatsApp account permanently?")) return;
    try {
      await api.delete(`/whatsapp/accounts/${account.id}`);
      toast.success("Account deleted");
      fetchAccounts();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected": return <span className="badge-green">Connected</span>;
      case "connecting": return <span className="badge-yellow">Connecting</span>;
      case "disconnected": return <span className="badge-red">Disconnected</span>;
      case "banned": return <span className="badge-red">Banned</span>;
      default: return <span className="badge-blue">{status}</span>;
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
          <h1 className="text-2xl font-bold text-white">WhatsApp Accounts</h1>
          <p className="text-slate-400 mt-1">Connect and manage your WhatsApp numbers</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Connect Number
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <Smartphone className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-4">No WhatsApp accounts connected yet.</p>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              Connect Your First Number
            </button>
          </div>
        ) : (
          accounts.map((account) => (
            <div key={account.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    account.status === "connected" ? "bg-emerald-500/20" : "bg-slate-700"
                  }`}>
                    {account.status === "connected" ? (
                      <Wifi className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <WifiOff className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{account.display_name}</h3>
                    <p className="text-xs text-slate-400">{account.phone_number || "No number yet"}</p>
                  </div>
                </div>
                {getStatusBadge(account.status)}
              </div>

              {account.connected_at && (
                <p className="text-xs text-slate-400 mb-4">
                  Connected since {new Date(account.connected_at).toLocaleDateString()}
                </p>
              )}

              <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                {account.status !== "connected" && (
                  <button onClick={() => refreshQr(account)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                    <QrCode className="w-3 h-3" /> Scan QR
                  </button>
                )}
                <button onClick={() => checkStatus(account)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Refresh
                </button>
                {account.status === "connected" && (
                  <button onClick={() => disconnectAccount(account)} className="text-yellow-400 hover:text-yellow-300 p-1.5">
                    <WifiOff className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => deleteAccount(account)} className="text-red-400 hover:text-red-300 ml-auto p-1.5">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Connect WhatsApp</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 mb-4">
              <p className="text-sm text-slate-300 mb-2">How it works:</p>
              <ol className="text-xs text-slate-400 space-y-1 list-decimal list-inside">
                <li>Enter a display name for this account</li>
                <li>Scan the QR code with your WhatsApp</li>
                <li>Your existing number will be connected</li>
              </ol>
            </div>
            <form onSubmit={createAccount} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Display Name *</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="input-field"
                  placeholder="e.g., Main Business Line"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? "Creating..." : "Create & Get QR"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQrModal && activeQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-sm mx-4 text-center">
            <h2 className="text-lg font-semibold text-white mb-4">Scan QR Code</h2>
            <p className="text-sm text-slate-400 mb-4">
              Open WhatsApp &gt; Linked Devices &gt; Link a Device
            </p>
            <div className="bg-white rounded-xl p-4 inline-block mb-4">
              <img src={`data:image/png;base64,${activeQr}`} alt="QR Code" className="w-48 h-48" />
            </div>
            <button onClick={() => setShowQrModal(false)} className="btn-secondary w-full">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
