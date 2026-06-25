"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { UserPlus, Copy, DollarSign, Users, TrendingUp, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

interface ReferralStats {
  total_referrals: number;
  pending: number;
  qualified: number;
  converted: number;
  total_earned: number;
  pending_payout: number;
}

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/referrals/dashboard");
      setReferralCode(response.data.referral_code || "");
      setReferralLink(response.data.referral_link || "");
      setStats(response.data.stats || null);
      setReferrals(response.data.referrals || []);
    } catch {
      console.error("Failed to fetch");
    } finally {
      setLoading(false);
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Referral Program</h1>
        <p className="text-slate-400 mt-1">Share your link and earn commissions</p>
      </div>

      {/* Referral Link */}
      <div className="card mb-6">
        <h3 className="text-sm font-medium text-slate-300 mb-3">Your Referral Link</h3>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-slate-900 rounded-lg px-4 py-2.5 text-sm text-slate-300 border border-slate-700">
            {referralLink || "Generating..."}
          </div>
          <button onClick={copyReferralLink} className="btn-primary flex items-center gap-2">
            <Copy className="w-4 h-4" /> Copy
          </button>
        </div>
        <p className="text-xs text-slate-400 mt-2">Referral Code: <span className="text-emerald-400 font-mono">{referralCode}</span></p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats?.total_referrals || 0}</p>
            <p className="text-xs text-slate-400">Total Referrals</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{stats?.converted || 0}</p>
            <p className="text-xs text-slate-400">Converted</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">₹{stats?.total_earned || 0}</p>
            <p className="text-xs text-slate-400">Total Earned</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">₹{stats?.pending_payout || 0}</p>
            <p className="text-xs text-slate-400">Pending Payout</p>
          </div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Referral History</h3>
        {referrals.length === 0 ? (
          <div className="text-center py-8">
            <UserPlus className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No referrals yet. Share your link to get started!</p>
          </div>
        ) : (
          <p className="text-slate-400 text-sm">Referral history will appear here.</p>
        )}
      </div>
    </div>
  );
}
