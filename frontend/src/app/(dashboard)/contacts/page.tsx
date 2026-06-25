"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Contact } from "@/lib/types";
import { Search, Plus, Phone, Mail, MapPin, Tag, MoreVertical, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    place: "",
    notes: "",
    tags: "",
  });

  useEffect(() => {
    fetchContacts();
  }, [searchQuery]);

  const fetchContacts = async () => {
    try {
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      const response = await api.get("/contacts", { params });
      setContacts(response.data.data || []);
    } catch {
      console.error("Failed to fetch contacts");
    } finally {
      setLoading(false);
    }
  };

  const createContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/contacts", {
        ...formData,
        tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()) : [],
      });
      toast.success("Contact created");
      setShowCreateModal(false);
      setFormData({ name: "", phone: "", email: "", place: "", notes: "", tags: "" });
      fetchContacts();
    } catch {
      toast.error("Failed to create contact");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <p className="text-slate-400 mt-1">Manage your contacts database</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-11"
            placeholder="Search by name, phone, or email..."
          />
        </div>
      </div>

      {/* Contacts Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Name</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Phone</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Email</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Location</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Tags</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Source</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Added</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mx-auto"></div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No contacts found. Add contacts manually or they&apos;ll be created when someone messages you.
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr key={contact.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-slate-300">
                            {(contact.name || contact.phone).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-white">{contact.name || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-300">{contact.phone}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{contact.email || "—"}</td>
                    <td className="py-3 px-4 text-sm text-slate-300">{contact.place || "—"}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 flex-wrap">
                        {(contact.tags || []).map((tag) => (
                          <span key={tag} className="badge-blue text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-400 capitalize">{contact.source || "—"}</td>
                    <td className="py-3 px-4 text-sm text-slate-400">
                      {new Date(contact.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Add Contact</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={createContact} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Phone *</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="input-field"
                  placeholder="919876543210"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  placeholder="Full name"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="input-field"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.place}
                  onChange={(e) => setFormData((p) => ({ ...p, place: e.target.value }))}
                  className="input-field"
                  placeholder="City, State"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                  className="input-field"
                  placeholder="mbbs, interested"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
