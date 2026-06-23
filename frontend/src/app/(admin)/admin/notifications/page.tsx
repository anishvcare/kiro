"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send, Bell, Clock, Users, CheckCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const sentNotifications = [
  { id: 1, title: "Morning Challenge Ready", body: "Your FMGE Morning Challenge is ready!", target: "all", sentAt: "Today 8:55 AM", sentCount: 12450 },
  { id: 2, title: "Evening Challenge Ready", body: "Your FMGE Evening Challenge is ready!", target: "all", sentAt: "Yesterday 6:55 PM", sentCount: 12320 },
  { id: 3, title: "Grand Mock Available", body: "New Grand Mock Exam is live!", target: "premium", sentAt: "2 days ago", sentCount: 1850 },
  { id: 4, title: "Streak Reminder", body: "Don't break your streak! Complete today's challenge.", target: "all", sentAt: "3 days ago", sentCount: 8540 },
];

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState("all");

  const handleSend = () => {
    alert(`Notification sent: "${title}" to ${target} users`);
    setTitle("");
    setBody("");
  };

  return (
    <AdminLayout title="Notifications">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Send Notification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Send className="w-5 h-5 text-primary" />
              <span>Send Push Notification</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
              <Input
                placeholder="Notification title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">Body</label>
              <textarea
                placeholder="Notification message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full h-24 px-4 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Target Audience</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "all", label: "All Users", count: "12,450" },
                  { value: "premium", label: "Premium Only", count: "1,850" },
                  { value: "free", label: "Free Users", count: "10,600" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setTarget(opt.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                      target === opt.value
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
                    }`}
                  >
                    {opt.label} ({opt.count})
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleSend} disabled={!title || !body} className="w-full sm:w-auto">
              <Send className="w-4 h-4 mr-2" />
              Send Notification
            </Button>
          </CardContent>
        </Card>

        {/* Scheduled Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Automated Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "8:55 AM", title: "Morning Challenge Ready", status: "active" },
                { time: "6:55 PM", title: "Evening Challenge Ready", status: "active" },
                { time: "9:00 PM", title: "Streak Reminder", status: "active" },
                { time: "8:00 AM (Mon)", title: "Weekly Progress Report", status: "active" },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-500">Every day at {item.time}</p>
                    </div>
                  </div>
                  <Badge variant="success" className="text-xs">{item.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sent History */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentNotifications.map((notif) => (
                <div key={notif.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div>
                      <p className="text-sm font-medium">{notif.title}</p>
                      <p className="text-xs text-gray-500">{notif.body}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary" className="text-xs capitalize">{notif.target}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {notif.sentAt} • {notif.sentCount.toLocaleString()} sent
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
