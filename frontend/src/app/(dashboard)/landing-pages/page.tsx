"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LandingPage } from "@/lib/types";
import { FileText, Plus, Eye, MousePointer, Globe, X, Trash2, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

export default function LandingPagesPage() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    template: "default",
    description: "",
    whatsapp_number: "",
    pre_filled_message: "",
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await api.get("/landing-pages");
      setPages(response.data.pages || []);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const createPage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/landing-pages", formData);
      toast.success("Landing page created");
      setShowModal(false);
      setFormData({ title: "", template: "default", description: "", whatsapp_number: "", pre_filled_message: "" });
      fetchPages();
    } catch {
      toast.error("Failed to create page");
    }
  };

  const togglePublish = async (page: LandingPage) => {
    try {
      await api.put(`/landing-pages/${page.id}`, { is_published: !page.is_published });
      toast.success(page.is_published ? "Page unpublished" : "Page published");
      fetchPages();
    } catch {
      toast.error("Failed to update");
    }
  };

  const deletePage = async (id: number) => {
    if (!confirm("Delete this landing page?")) return;
    try {
      await api.delete(`/landing-pages/${id}`);
      toast.success("Page deleted");
      fetchPages();
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
          <h1 className="text-2xl font-bold text-white">Landing Pages</h1>
          <p className="text-slate-400 mt-1">Create pages integrated with WhatsApp</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.length === 0 ? (
          <div className="col-span-full card text-center py-12">
            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No landing pages yet.</p>
          </div>
        ) : (
          pages.map((page) => (
            <div key={page.id} className="card">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">{page.title}</h3>
                <span className={page.is_published ? "badge-green" : "badge-yellow"}>
                  {page.is_published ? "Published" : "Draft"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-3">{page.description || "No description"}</p>
              <div className="flex items-center gap-4 text-xs text-slate-400 mb-4">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {page.views_count} views</span>
                <span className="flex items-center gap-1"><MousePointer className="w-3 h-3" /> {page.clicks_count} clicks</span>
              </div>
              <div className="badge-blue text-xs mb-4 inline-block">{page.template}</div>
              <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                <button onClick={() => togglePublish(page)} className="btn-secondary text-xs py-1.5 px-3">
                  {page.is_published ? "Unpublish" : "Publish"}
                </button>
                <button className="text-blue-400 hover:text-blue-300 p-1.5">
                  <ExternalLink className="w-4 h-4" />
                </button>
                <button onClick={() => deletePage(page.id)} className="text-red-400 hover:text-red-300 ml-auto p-1.5">
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
              <h2 className="text-lg font-semibold text-white">Create Landing Page</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createPage} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Page Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  className="input-field"
                  placeholder="e.g., MBBS Admission 2024"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Template</label>
                <select
                  value={formData.template}
                  onChange={(e) => setFormData((p) => ({ ...p, template: e.target.value }))}
                  className="input-field"
                >
                  <option value="default">Default</option>
                  <option value="mbbs">MBBS Admission</option>
                  <option value="russia_job">Russia Jobs</option>
                  <option value="ielts">IELTS Coaching</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                  className="input-field"
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">WhatsApp Number</label>
                <input
                  type="text"
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData((p) => ({ ...p, whatsapp_number: e.target.value }))}
                  className="input-field"
                  placeholder="919876543210"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Pre-filled Message</label>
                <input
                  type="text"
                  value={formData.pre_filled_message}
                  onChange={(e) => setFormData((p) => ({ ...p, pre_filled_message: e.target.value }))}
                  className="input-field"
                  placeholder="Hi, I'm interested in..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create Page
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
