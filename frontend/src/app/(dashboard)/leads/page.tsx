"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { LeadStage } from "@/lib/types";
import { Plus, MoreVertical, User, Calendar } from "lucide-react";
import toast from "react-hot-toast";

export default function LeadsPage() {
  const [stages, setStages] = useState<LeadStage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  const fetchPipeline = async () => {
    try {
      const response = await api.get("/leads/pipeline");
      setStages(response.data.stages || []);
    } catch {
      console.error("Failed to fetch pipeline");
    } finally {
      setLoading(false);
    }
  };

  const moveLeadToStage = async (leadId: number, newStageId: number) => {
    try {
      await api.put(`/leads/${leadId}`, { stage_id: newStageId });
      toast.success("Lead moved");
      fetchPipeline();
    } catch {
      toast.error("Failed to move lead");
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
          <h1 className="text-2xl font-bold text-white">Lead Pipeline</h1>
          <p className="text-slate-400 mt-1">Drag leads across stages to track progress</p>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <div key={stage.id} className="flex-shrink-0 w-72">
            {/* Stage Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }}></div>
                <h3 className="text-sm font-semibold text-white">{stage.name}</h3>
                <span className="badge bg-slate-700 text-slate-300 text-xs">
                  {stage.leads?.length || 0}
                </span>
              </div>
            </div>

            {/* Stage Column */}
            <div className="space-y-3 min-h-[200px] bg-slate-800/30 rounded-xl p-3 border border-slate-700/50">
              {(stage.leads || []).length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No leads</div>
              ) : (
                (stage.leads || []).map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-white">
                        {lead.title || lead.contact?.name || lead.contact?.phone}
                      </h4>
                      <button className="text-slate-400 hover:text-white">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    {lead.contact && (
                      <p className="text-xs text-slate-400 mb-2">{lead.contact.phone}</p>
                    )}
                    {lead.course_interest && (
                      <span className="badge-purple text-xs mb-2 inline-block">
                        {lead.course_interest}
                      </span>
                    )}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-700">
                      <div className="flex items-center gap-1 text-xs text-slate-400">
                        <User className="w-3 h-3" />
                        {lead.assigned_user?.name || "Unassigned"}
                      </div>
                      <span className={`badge text-xs ${
                        lead.priority === "urgent" ? "badge-red" :
                        lead.priority === "high" ? "badge-yellow" :
                        "badge-blue"
                      }`}>
                        {lead.priority}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
