"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { WaLink } from "@/lib/types";
import { Link2, Plus, Copy, Trash2, X, QrCode, MousePointer } from "lucide-react";
import toast from "react-hot-toast";

export default function WaLinksPage() {
  const [links, setLinks] = useState<WaLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    whatsapp_number: "",
    pre_filled_message: "",
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    try {
      const response = await api.get("/wa-links");
      setLinks(response.data.links || []);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const createLink = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/wa-links", formData);
      toast.success("Link created");
      setShowModal(false);
      setFormData({ name: "", whatsapp_number: "", pre_filled_message: "" });
      fetchLinks();
    } catch {
      toast.error("Failed to create link");
    }
  };

  const copyLink = (link: WaLink) => {
    const url = `https://wa.me/${link.whatsapp_number}${link.pre_filled_message ? `?text=${encodeURIComponent(link.pre_filled_message)}` : ""}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  const deleteLink = async (id: number) => {
    if (!confirm("Delete this link?")) return;
    try {
      await api.delete(`/wa-links/${id}`);
      toast.success("Link deleted");
      fetchLinks();
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
          <h1 className="text-2xl font-bold text-white">Click-to-WhatsApp Links</h1>
          <p className="text-slate-400 mt-1">Generate wa.me links with pre-filled messages</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create Link
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {links.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <Link2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No links created yet.</p>
          </div>
        ) : (
          links.map((link) => (
            <div key={link.id} className="card">
              <h3 className="text-sm font-semibold text-white mb-2">{link.name}</h3>
              <p className="text-xs text-slate-400 mb-1">+{link.whatsapp_number}</p>
              {link.pre_filled_message && (
                <p className="text-xs text-slate-300 mb-3 bg-slate-900/50 rounded p-2">
                  &quot;{link.pre_filled_message}&quot;
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                <MousePointer className="w-3 h-3" /> {link.clicks_count} clicks
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                <button onClick={() => copyLink(link)} className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copy Link
                </button>
                <button onClick={() => deleteLink(link.id)} className="text-red-400 hover:text-red-300 ml-auto p-1.5">
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
              <h2 className="text-lg font-semibold text-white">Create WA Link</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createLink} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Link Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., Facebook Ad Link"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">WhatsApp Number *</label>
                <input
                  type="text"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp_number: e.target.value }))}
                  className="input-field"
                  placeholder="919876543210"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Pre-filled Message</label>
                <textarea
                  value={formData.pre_filled_message}
                  onChange={(e) => setFormData((p) => ({ ...p, pre_filled_message: e.target.value }))}
                  className="input-field"
                  rows={3}
                  placeholder="Hi, I want to know about..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
