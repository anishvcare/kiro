"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { User } from "@/lib/types";
import { Users, Plus, Shield, X, Trash2, Edit } from "lucide-react";
import toast from "react-hot-toast";

export default function TeamPage() {
  const [members, setMembers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "agent",
    password: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await api.get("/team/members");
      setMembers(response.data.members || []);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/team/members", formData);
      toast.success("Team member added");
      setShowModal(false);
      setFormData({ name: "", email: "", phone: "", role: "agent", password: "" });
      fetchMembers();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to add member");
    }
  };

  const removeMember = async (id: number) => {
    if (!confirm("Remove this team member?")) return;
    try {
      await api.delete(`/team/members/${id}`);
      toast.success("Member removed");
      fetchMembers();
    } catch {
      toast.error("Failed to remove");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin": return <span className="badge-red">Admin</span>;
      case "manager": return <span className="badge-purple">Manager</span>;
      case "counsellor": return <span className="badge-blue">Counsellor</span>;
      case "agent": return <span className="badge-green">Agent</span>;
      default: return <span className="badge-blue">{role}</span>;
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
          <h1 className="text-2xl font-bold text-white">Team Management</h1>
          <p className="text-slate-400 mt-1">Manage your team members and roles</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      {/* Role Hierarchy */}
      <div className="card mb-6">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Role Hierarchy</h3>
        <div className="flex items-center gap-2 text-sm">
          <span className="badge-red">Admin</span>
          <span className="text-slate-500">→</span>
          <span className="badge-purple">Manager</span>
          <span className="text-slate-500">→</span>
          <span className="badge-blue">Counsellor</span>
          <span className="text-slate-500">→</span>
          <span className="badge-green">Agent</span>
        </div>
      </div>

      {/* Members Table */}
      <div className="card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Member</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Role</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Phone</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Status</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-700 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium">{member.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.email}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">{getRoleBadge(member.role)}</td>
                <td className="py-3 px-4 text-sm text-slate-300">{member.phone || "—"}</td>
                <td className="py-3 px-4">
                  <span className={member.is_active ? "badge-green" : "badge-red"}>
                    {member.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <button onClick={() => removeMember(member.id)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="card w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white">Add Team Member</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={addMember} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                  className="input-field"
                >
                  <option value="agent">Agent</option>
                  <option value="counsellor">Counsellor</option>
                  <option value="manager">Manager</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                  className="input-field"
                  placeholder="Default: password123"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
