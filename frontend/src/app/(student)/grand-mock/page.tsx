"use client";

import React from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, BookOpen, AlertTriangle, Lock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function GrandMockPage() {
  const isUnlocked = true; // Would come from API
  const previousAttempts = [
    { id: 1, date: "2026-06-15", score: 185, total: 300, percentage: 62, rank: 45 },
    { id: 2, date: "2026-06-01", score: 168, total: 300, percentage: 56, rank: 78 },
  ];

  return (
    <AppLayout title="Grand Mock Exam">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        {/* Hero Card */}
        <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-0 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-10 -mb-10" />
          <CardContent className="p-6 relative">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-yellow-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">FMGE Grand Mock Exam</h1>
                <p className="text-purple-200 text-sm">Full simulation of the actual FMGE exam</p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <p className="text-2xl font-bold">300</p>
                <p className="text-xs text-purple-200">Questions</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <p className="text-2xl font-bold">300</p>
                <p className="text-xs text-purple-200">Minutes</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg">
                <p className="text-2xl font-bold">19</p>
                <p className="text-xs text-purple-200">Subjects</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Exam Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: "⏱️", text: "Real FMGE Timer" },
                { icon: "🔖", text: "Mark for Review" },
                { icon: "⏭️", text: "Skip & Navigate" },
                { icon: "💾", text: "Auto Save" },
                { icon: "📊", text: "Detailed Analysis" },
                { icon: "🏆", text: "All India Rank" },
                { icon: "📈", text: "Subject Breakdown" },
                { icon: "🧠", text: "FMGE Prediction" },
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                  <span className="text-lg">{feature.icon}</span>
                  <span className="text-sm text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-amber-800">Important Instructions</h4>
                <ul className="mt-2 space-y-1 text-sm text-amber-700">
                  <li>• Ensure stable internet connection</li>
                  <li>• Allocate full 5 hours without interruption</li>
                  <li>• Test will auto-submit when timer expires</li>
                  <li>• You can mark questions for review and navigate freely</li>
                  <li>• No negative marking for wrong answers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Start Button */}
        {isUnlocked ? (
          <Link href="/test/grand-mock">
            <Button size="xl" className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <Trophy className="w-5 h-5 mr-2" />
              Start Grand Mock Exam
            </Button>
          </Link>
        ) : (
          <Button size="xl" className="w-full" disabled>
            <Lock className="w-5 h-5 mr-2" />
            Complete 30-Day Challenge to Unlock
          </Button>
        )}

        {/* Previous Attempts */}
        {previousAttempts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Previous Attempts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {previousAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{new Date(attempt.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                      <p className="text-xs text-gray-500">Rank #{attempt.rank}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${attempt.percentage >= 60 ? "text-green-600" : "text-red-600"}`}>
                        {attempt.percentage}%
                      </p>
                      <p className="text-xs text-gray-500">{attempt.score}/{attempt.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </AppLayout>
  );
}
