"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Target,
  TrendingUp,
  DollarSign,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  { title: "Total Users", value: "12,450", change: "+12%", icon: Users, color: "bg-blue-500", trend: "up" },
  { title: "Active Today", value: "3,280", change: "+8%", icon: Activity, color: "bg-green-500", trend: "up" },
  { title: "Questions", value: "6,320", change: "+45", icon: BookOpen, color: "bg-purple-500", trend: "up" },
  { title: "Tests Today", value: "8,540", change: "+15%", icon: Target, color: "bg-amber-500", trend: "up" },
  { title: "Revenue (Month)", value: "₹4.5L", change: "+22%", icon: DollarSign, color: "bg-emerald-500", trend: "up" },
  { title: "Avg Score", value: "67%", change: "-2%", icon: TrendingUp, color: "bg-red-500", trend: "down" },
];

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-xs text-gray-500">FMGE Daily Trainer Management</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {["Dashboard", "Users", "Questions", "Subjects", "Notifications", "Subscriptions"].map((item) => (
              <a
                key={item}
                href={`/admin/${item.toLowerCase()}`}
                className="text-sm text-gray-600 hover:text-primary font-medium"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                        <div className={`flex items-center space-x-1 mt-1 text-xs font-medium ${stat.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                          {stat.trend === "up" ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          <span>{stat.change}</span>
                          <span className="text-gray-400">vs last month</span>
                        </div>
                      </div>
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <stat.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent Registrations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Dr. Anish Kumar", email: "anish@email.com", time: "2 min ago" },
                    { name: "Priya Sharma", email: "priya@email.com", time: "15 min ago" },
                    { name: "Rahul Verma", email: "rahul@email.com", time: "1 hr ago" },
                    { name: "Sarah Johnson", email: "sarah@email.com", time: "2 hrs ago" },
                    { name: "Mohammed Ali", email: "ali@email.com", time: "3 hrs ago" },
                  ].map((user, index) => (
                    <div key={index} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {user.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{user.time}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Subject Completion Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: "Medicine", attempts: 4520, avgScore: 72 },
                    { name: "Surgery", attempts: 3890, avgScore: 68 },
                    { name: "Pathology", attempts: 3650, avgScore: 71 },
                    { name: "Pharmacology", attempts: 3200, avgScore: 58 },
                    { name: "Anatomy", attempts: 2980, avgScore: 65 },
                  ].map((subject, index) => (
                    <div key={index} className="flex items-center justify-between p-2">
                      <span className="text-sm font-medium">{subject.name}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-xs text-gray-500">{subject.attempts.toLocaleString()} attempts</span>
                        <span className={`text-sm font-bold ${subject.avgScore >= 70 ? "text-green-600" : subject.avgScore >= 60 ? "text-amber-600" : "text-red-600"}`}>
                          {subject.avgScore}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
