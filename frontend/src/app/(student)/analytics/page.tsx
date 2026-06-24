"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  BarChart3,
  PieChart,
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const subjectPerformance = [
  { name: "Medicine", accuracy: 78, total: 120, color: "bg-emerald-500" },
  { name: "Surgery", accuracy: 65, total: 90, color: "bg-blue-500" },
  { name: "Pathology", accuracy: 72, total: 100, color: "bg-purple-500" },
  { name: "Pharmacology", accuracy: 45, total: 85, color: "bg-red-500" },
  { name: "Anatomy", accuracy: 60, total: 75, color: "bg-amber-500" },
  { name: "Physiology", accuracy: 68, total: 70, color: "bg-pink-500" },
  { name: "Microbiology", accuracy: 52, total: 60, color: "bg-teal-500" },
  { name: "Biochemistry", accuracy: 55, total: 55, color: "bg-indigo-500" },
  { name: "Community Med", accuracy: 70, total: 50, color: "bg-cyan-500" },
  { name: "Forensic Med", accuracy: 75, total: 40, color: "bg-gray-500" },
];

const weakTopics = [
  { subject: "Pharmacology", topic: "Autonomic Nervous System", accuracy: 30 },
  { subject: "Microbiology", topic: "Virology", accuracy: 35 },
  { subject: "Biochemistry", topic: "Lipid Metabolism", accuracy: 38 },
  { subject: "Anatomy", topic: "Neuroanatomy", accuracy: 40 },
  { subject: "Pharmacology", topic: "Chemotherapy", accuracy: 42 },
];

const dailyScores = [
  { day: "Mon", score: 70 },
  { day: "Tue", score: 65 },
  { day: "Wed", score: 78 },
  { day: "Thu", score: 72 },
  { day: "Fri", score: 80 },
  { day: "Sat", score: 75 },
  { day: "Sun", score: 82 },
];

export default function AnalyticsPage() {
  return (
    <AppLayout title="Analytics">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">2,450</p>
              <p className="text-xs text-gray-500">Questions Attempted</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">67%</p>
              <p className="text-xs text-gray-500">Overall Accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Brain className="w-4 h-4 text-purple-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">65%</p>
              <p className="text-xs text-gray-500">FMGE Readiness</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                </div>
              </div>
              <p className="text-2xl font-bold">48</p>
              <p className="text-xs text-gray-500">Tests Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Performance Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Weekly Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-40 px-2">
              {dailyScores.map((day, index) => (
                <div key={day.day} className="flex flex-col items-center space-y-2">
                  <span className="text-xs font-medium text-gray-600">{day.score}%</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${day.score}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="w-8 md:w-12 bg-gradient-to-t from-primary-700 to-primary-400 rounded-t-lg"
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
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Subject Performance</CardTitle>
              <Badge variant="secondary">All Subjects</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {subjectPerformance.map((subject, index) => (
                <motion.div
                  key={subject.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-3"
                >
                  <div className="w-24 md:w-32 text-sm font-medium text-gray-700 truncate">
                    {subject.name}
                  </div>
                  <div className="flex-1">
                    <Progress
                      value={subject.accuracy}
                      className="h-3"
                      indicatorClassName={subject.accuracy >= 70 ? "bg-green-500" : subject.accuracy >= 50 ? "bg-amber-500" : "bg-red-500"}
                    />
                  </div>
                  <span className={`text-sm font-semibold w-12 text-right ${
                    subject.accuracy >= 70 ? "text-green-600" : subject.accuracy >= 50 ? "text-amber-600" : "text-red-600"
                  }`}>
                    {subject.accuracy}%
                  </span>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weak Topics (AI Recommendations) */}
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-base flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <span>Weak Areas - Focus Required</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {weakTopics.map((topic, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{topic.topic}</p>
                    <p className="text-xs text-gray-500">{topic.subject}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-red-600">{topic.accuracy}%</p>
                    <p className="text-xs text-gray-500">accuracy</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm font-medium text-blue-800">🤖 AI Recommendation</p>
              <p className="text-xs text-blue-600 mt-1">
                Focus on Pharmacology (ANS & Chemotherapy) and Microbiology (Virology) this week. 
                Practice at least 20 questions daily from these topics.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
