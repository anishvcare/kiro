"use client";

import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, BookOpen, TrendingUp, Activity } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const subjectStats = [
  { name: "Medicine", attempts: 45200, avgScore: 72, questions: 680 },
  { name: "Surgery", attempts: 38900, avgScore: 68, questions: 520 },
  { name: "Pathology", attempts: 36500, avgScore: 71, questions: 520 },
  { name: "Pharmacology", attempts: 32000, avgScore: 58, questions: 480 },
  { name: "Anatomy", attempts: 29800, avgScore: 65, questions: 450 },
  { name: "Physiology", attempts: 27500, avgScore: 67, questions: 380 },
  { name: "Microbiology", attempts: 24000, avgScore: 62, questions: 350 },
  { name: "Community Med", attempts: 22000, avgScore: 70, questions: 380 },
  { name: "OBG", attempts: 20500, avgScore: 66, questions: 420 },
  { name: "Pediatrics", attempts: 18800, avgScore: 69, questions: 350 },
];

const dailyStats = [
  { day: "Mon", users: 3200, tests: 8500 },
  { day: "Tue", users: 3450, tests: 9100 },
  { day: "Wed", users: 3100, tests: 8200 },
  { day: "Thu", users: 3380, tests: 8800 },
  { day: "Fri", users: 2900, tests: 7600 },
  { day: "Sat", users: 3600, tests: 9500 },
  { day: "Sun", users: 3800, tests: 10200 },
];

export default function AdminAnalyticsPage() {
  return (
    <AdminLayout title="Platform Analytics">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        {/* Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <Activity className="w-5 h-5 text-blue-500 mb-2" />
              <p className="text-2xl font-bold">8.5K</p>
              <p className="text-xs text-gray-500">Tests Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <Users className="w-5 h-5 text-green-500 mb-2" />
              <p className="text-2xl font-bold">3.2K</p>
              <p className="text-xs text-gray-500">Active Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <BookOpen className="w-5 h-5 text-purple-500 mb-2" />
              <p className="text-2xl font-bold">255K</p>
              <p className="text-xs text-gray-500">Questions Answered</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <TrendingUp className="w-5 h-5 text-amber-500 mb-2" />
              <p className="text-2xl font-bold">67%</p>
              <p className="text-xs text-gray-500">Avg Accuracy</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Activity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 px-2">
              {dailyStats.map((day, index) => (
                <div key={day.day} className="flex flex-col items-center space-y-1 flex-1">
                  <span className="text-[10px] text-gray-500">{(day.tests / 1000).toFixed(1)}K</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(day.tests / 10200) * 100}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-6 md:w-10 bg-gradient-to-t from-primary-700 to-primary-400 rounded-t-md"
                    style={{ minHeight: "20px" }}
                  />
                  <span className="text-xs text-gray-500">{day.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subject Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subject Performance (Platform-wide)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectStats.map((subject) => (
                <div key={subject.name} className="flex items-center space-x-3">
                  <div className="w-28 text-sm font-medium text-gray-700 truncate">
                    {subject.name}
                  </div>
                  <div className="flex-1">
                    <Progress
                      value={subject.avgScore}
                      className="h-2.5"
                      indicatorClassName={
                        subject.avgScore >= 70 ? "bg-green-500" :
                        subject.avgScore >= 60 ? "bg-amber-500" : "bg-red-500"
                      }
                    />
                  </div>
                  <span className={`text-sm font-semibold w-10 text-right ${
                    subject.avgScore >= 70 ? "text-green-600" :
                    subject.avgScore >= 60 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {subject.avgScore}%
                  </span>
                  <span className="text-xs text-gray-400 w-16 text-right hidden md:inline">
                    {(subject.attempts / 1000).toFixed(1)}K
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AdminLayout>
  );
}
