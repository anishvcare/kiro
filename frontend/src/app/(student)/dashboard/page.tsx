"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  Flame,
  Target,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuthStore } from "@/stores/authStore";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const { user } = useAuthStore();

  // Mock data - would come from API
  const stats = {
    streak: user?.streak_count || 7,
    totalTests: user?.total_tests_completed || 24,
    averageScore: user?.average_score || 72,
    fmgeReadiness: 65,
  };

  const weakSubjects = [
    { name: "Pharmacology", accuracy: 45 },
    { name: "Microbiology", accuracy: 52 },
    { name: "Biochemistry", accuracy: 55 },
  ];

  const todayMorning = {
    status: "completed",
    score: 23,
    total: 30,
  };

  const todayEvening = {
    status: "available",
    time: "7:00 PM",
  };

  return (
    <AppLayout title="Dashboard">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants}>
          <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-2xl p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10" />
            <div className="absolute bottom-0 right-10 w-20 h-20 bg-white/5 rounded-full -mb-5" />
            <div className="relative">
              <p className="text-primary-100 text-sm">Good morning,</p>
              <h2 className="text-2xl font-bold mt-1">{user?.name || "Student"} 👋</h2>
              <p className="text-primary-100 text-sm mt-2">
                Keep up the great work! You&apos;re on a {stats.streak}-day streak.
              </p>
              <div className="flex items-center mt-4 space-x-4">
                <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                  <Flame className="w-4 h-4 text-orange-300" />
                  <span className="text-sm font-medium">{stats.streak} days</span>
                </div>
                <div className="flex items-center space-x-1 bg-white/20 rounded-full px-3 py-1">
                  <Target className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm font-medium">{stats.fmgeReadiness}% ready</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Today's Tests */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Today&apos;s Challenges</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Morning Test */}
            <Card className="border-l-4 border-l-amber-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <Sun className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Morning Challenge</p>
                      <p className="text-xs text-gray-500">9:00 AM • 30 Questions</p>
                    </div>
                  </div>
                  <Badge variant="success">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Done
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-2xl font-bold text-gray-900">{todayMorning.score}</span>
                    <span className="text-sm text-gray-500">/{todayMorning.total}</span>
                  </div>
                  <Progress value={(todayMorning.score / todayMorning.total) * 100} className="w-24 h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Evening Test */}
            <Card className="border-l-4 border-l-indigo-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Moon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Evening Challenge</p>
                      <p className="text-xs text-gray-500">7:00 PM • 30 Questions</p>
                    </div>
                  </div>
                  <Badge variant="warning">
                    <Clock className="w-3 h-3 mr-1" />
                    {todayEvening.time}
                  </Badge>
                </div>
                <Link href="/daily-challenge">
                  <Button size="sm" className="w-full mt-2">
                    Start Challenge
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Flame className="w-5 h-5 text-orange-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.streak}</p>
                <p className="text-xs text-gray-500">Day Streak</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-5 h-5 text-blue-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalTests}</p>
                <p className="text-xs text-gray-500">Tests Done</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.averageScore}%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-5 h-5 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.fmgeReadiness}%</p>
                <p className="text-xs text-gray-500">FMGE Ready</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* FMGE Readiness Score */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center space-x-2">
                <Award className="w-5 h-5 text-primary" />
                <span>FMGE Readiness Score</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="relative w-20 h-20">
                  <svg className="w-20 h-20 transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="#E5E7EB" strokeWidth="6" fill="none" />
                    <circle
                      cx="40" cy="40" r="34"
                      stroke="#0F766E"
                      strokeWidth="6"
                      fill="none"
                      strokeDasharray={`${(stats.fmgeReadiness / 100) * 213.6} 213.6`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-primary">
                    {stats.fmgeReadiness}%
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-2">
                    Based on your performance, streaks, and test completion.
                  </p>
                  <Progress value={stats.fmgeReadiness} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Complete 30-day challenge to unlock Grand Mock Exam
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weak Subjects */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Weak Subjects</span>
                </CardTitle>
                <Link href="/analytics" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {weakSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center">
                        <BookOpen className="w-4 h-4 text-red-500" />
                      </div>
                      <span className="text-sm font-medium">{subject.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Progress value={subject.accuracy} className="w-16 h-2" indicatorClassName="bg-red-400" />
                      <span className="text-sm font-medium text-red-500">{subject.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/practice">
              <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium">Subject Practice</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/challenge">
              <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">30-Day Challenge</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/grand-mock">
              <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <Award className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">Grand Mock</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/leaderboard">
              <Card className="hover:border-primary/50 cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium">Leaderboard</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
}
