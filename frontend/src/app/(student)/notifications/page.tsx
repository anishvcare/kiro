"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Target, Flame, Trophy, Megaphone, Check } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const notifications = [
  { id: 1, title: "Evening Challenge Ready", body: "Your FMGE Evening Challenge is waiting! 30 questions to boost your prep.", type: "challenge", time: "2 hours ago", read: false },
  { id: 2, title: "7-Day Streak!", body: "Congratulations! You've maintained a 7-day streak. Keep going! 🔥", type: "streak", time: "5 hours ago", read: false },
  { id: 3, title: "Morning Challenge Completed", body: "Great job! You scored 23/30 in today's morning challenge.", type: "challenge", time: "Today 9:45 AM", read: true },
  { id: 4, title: "New Grand Mock Available", body: "A new 300-question Grand Mock Exam is now available for premium users.", type: "mock", time: "Yesterday", read: true },
  { id: 5, title: "Weekly Progress Report", body: "Your accuracy improved by 5% this week. Keep up the great work!", type: "general", time: "2 days ago", read: true },
  { id: 6, title: "Streak Reminder", body: "Don't forget to complete today's challenge to maintain your streak!", type: "streak", time: "3 days ago", read: true },
];

const iconMap = {
  challenge: { icon: Target, color: "bg-blue-100 text-blue-600" },
  streak: { icon: Flame, color: "bg-orange-100 text-orange-600" },
  mock: { icon: Trophy, color: "bg-purple-100 text-purple-600" },
  general: { icon: Megaphone, color: "bg-green-100 text-green-600" },
};

export default function NotificationsPage() {
  return (
    <AppLayout title="Notifications">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4 max-w-2xl mx-auto"
      >
        {/* Mark all read */}
        <div className="flex justify-end">
          <button className="flex items-center space-x-1 text-sm text-primary hover:underline">
            <Check className="w-4 h-4" />
            <span>Mark all as read</span>
          </button>
        </div>

        {/* Notification list */}
        <div className="space-y-2">
          {notifications.map((notif, index) => {
            const iconConfig = iconMap[notif.type as keyof typeof iconMap];
            const IconComponent = iconConfig.icon;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className={cn(
                  "transition-all cursor-pointer hover:shadow-md",
                  !notif.read && "border-l-4 border-l-primary bg-primary-50/30"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", iconConfig.color)}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h3 className={cn("text-sm", !notif.read ? "font-semibold text-gray-900" : "font-medium text-gray-700")}>
                            {notif.title}
                          </h3>
                          {!notif.read && (
                            <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1.5" />
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{notif.body}</p>
                        <p className="text-[10px] text-gray-400 mt-1.5">{notif.time}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AppLayout>
  );
}
