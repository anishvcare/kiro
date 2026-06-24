"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Target,
  GitBranch,
  Send,
  Smartphone,
  FileText,
  Link2,
  UserPlus,
  BarChart3,
  Settings,
  LogOut,
  Zap,
  Clock,
} from "lucide-react";

const navItems = [
  { href: "/(dashboard)", label: "Dashboard", icon: LayoutDashboard },
  { href: "/(dashboard)/inbox", label: "Inbox", icon: MessageSquare },
  { href: "/(dashboard)/contacts", label: "Contacts", icon: Users },
  { href: "/(dashboard)/leads", label: "Leads", icon: Target },
  { href: "/(dashboard)/flows", label: "Flow Builder", icon: GitBranch },
  { href: "/(dashboard)/campaigns", label: "Campaigns", icon: Send },
  { href: "/(dashboard)/whatsapp-accounts", label: "WhatsApp", icon: Smartphone },
  { href: "/(dashboard)/landing-pages", label: "Landing Pages", icon: FileText },
  { href: "/(dashboard)/wa-links", label: "WA Links", icon: Link2 },
  { href: "/(dashboard)/referrals", label: "Referrals", icon: UserPlus },
  { href: "/(dashboard)/reports", label: "Reports", icon: BarChart3 },
  { href: "/(dashboard)/team", label: "Team", icon: Users },
  { href: "/(dashboard)/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-800 flex flex-col z-50">
      {/* Logo */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">LeadFlow</h1>
            <p className="text-xs text-slate-400">WhatsApp CRM</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={isActive ? "sidebar-link-active" : "sidebar-link"}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-slate-300">
              {user?.name?.charAt(0)?.toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={() => logout()}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
