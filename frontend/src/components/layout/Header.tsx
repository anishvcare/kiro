"use client";

import React from "react";
import Link from "next/link";
import { Bell, Menu, Flame } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export function Header({ title }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <div className="flex items-center justify-between h-14 px-4 md:px-6 md:ml-64">
        {/* Left - Title or Logo on mobile */}
        <div className="flex items-center space-x-3">
          <Link href="/dashboard" className="md:hidden flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">FM</span>
            </div>
          </Link>
          {title && (
            <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center space-x-3">
          {/* Streak */}
          <div className="flex items-center space-x-1 bg-orange-50 px-2.5 py-1 rounded-full">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold text-orange-600">
              {user?.streak_count || 0}
            </span>
          </div>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" />
            <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[10px]">
              2
            </Badge>
          </Link>

          {/* Profile */}
          <Link href="/profile" className="md:hidden">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-xs">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
