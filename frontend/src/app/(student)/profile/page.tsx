"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Crown,
  LogOut,
  Settings,
  Bell,
  Shield,
  CreditCard,
  ChevronRight,
  Flame,
  Target,
  Award,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/stores/authStore";

export default function ProfilePage() {
  const { user, logout } = useAuthStore();

  const menuItems = [
    { icon: Bell, label: "Notifications", href: "/notifications" },
    { icon: CreditCard, label: "Subscription", href: "/subscription" },
    { icon: Shield, label: "Privacy & Security", href: "/privacy" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <AppLayout title="Profile">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        {/* Profile Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-xl bg-primary/10 text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl font-bold text-gray-900">{user?.name || "Student"}</h2>
                  {user?.subscription_plan === "premium" && (
                    <Badge className="bg-gradient-to-r from-amber-400 to-amber-600">
                      <Crown className="w-3 h-3 mr-1" />
                      Premium
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-500">{user?.email || "student@example.com"}</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center p-3 bg-orange-50 rounded-xl">
                <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{user?.streak_count || 7}</p>
                <p className="text-xs text-gray-500">Streak</p>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <Target className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{user?.total_tests_completed || 24}</p>
                <p className="text-xs text-gray-500">Tests</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <Award className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-gray-900">{user?.average_score || 72}%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badges */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Badges Earned</h3>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {[
                { emoji: "🔥", label: "7-Day Streak" },
                { emoji: "⭐", label: "First 80%" },
                { emoji: "📚", label: "50 Tests" },
                { emoji: "🎯", label: "Perfect Score" },
                { emoji: "🏆", label: "Top 10" },
              ].map((badge, index) => (
                <div key={index} className="flex flex-col items-center min-w-[60px]">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {badge.emoji}
                  </div>
                  <span className="text-[10px] text-gray-500 mt-1 text-center">{badge.label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card>
          <CardContent className="p-2">
            {menuItems.map((item, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                    <item.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">{item.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          onClick={() => logout()}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </motion.div>
    </AppLayout>
  );
}
