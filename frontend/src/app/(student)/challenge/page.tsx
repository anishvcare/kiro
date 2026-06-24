"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, Trophy, CheckCircle, Lock, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export default function ChallengePage() {
  const challengeProgress = {
    currentDay: 12,
    totalDays: 30,
    testsCompleted: 12,
    averageScore: 72,
    passPercentage: 60,
    grandMockUnlocked: false,
  };

  const days = Array.from({ length: 30 }, (_, i) => ({
    day: i + 1,
    completed: i < 12,
    score: i < 12 ? Math.floor(Math.random() * 30) + 50 : null,
    passed: i < 12 ? Math.random() > 0.2 : false,
  }));

  const progress = (challengeProgress.currentDay / challengeProgress.totalDays) * 100;

  return (
    <AppLayout title="30-Day Challenge">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-3xl mx-auto"
      >
        {/* Challenge Header */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Flame className="w-7 h-7 text-orange-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">30-Day FMGE Challenge</h1>
                <p className="text-sm text-gray-500">Complete all 30 days to unlock Grand Mock Exam</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">Day {challengeProgress.currentDay}/30</span>
              </div>
              <Progress value={progress} className="h-3" indicatorClassName="bg-gradient-to-r from-orange-500 to-amber-400" />
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center p-2 bg-white/70 rounded-lg">
                <p className="text-lg font-bold text-orange-600">{challengeProgress.testsCompleted}</p>
                <p className="text-xs text-gray-500">Days Done</p>
              </div>
              <div className="text-center p-2 bg-white/70 rounded-lg">
                <p className="text-lg font-bold text-green-600">{challengeProgress.averageScore}%</p>
                <p className="text-xs text-gray-500">Avg Score</p>
              </div>
              <div className="text-center p-2 bg-white/70 rounded-lg">
                <p className="text-lg font-bold text-blue-600">18</p>
                <p className="text-xs text-gray-500">Days Left</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Challenge Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Complete daily tests for 30 consecutive days</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm">Maintain above 60% pass percentage</span>
              </div>
              <div className="flex items-center space-x-3">
                {challengeProgress.grandMockUnlocked ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Lock className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm">Unlock FMGE Grand Mock Exam (300 Questions)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Calendar Grid */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span>Daily Progress</span>
              </CardTitle>
              <div className="flex space-x-2 text-xs">
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span>Passed</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-red-400 rounded-sm" />
                  <span>Failed</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-sm" />
                  <span>Upcoming</span>
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 md:grid-cols-10 gap-2">
              {days.map((day) => (
                <motion.div
                  key={day.day}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: day.day * 0.02 }}
                  className={cn(
                    "aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-medium transition-all",
                    day.completed && day.passed && "bg-green-100 text-green-700 border border-green-300",
                    day.completed && !day.passed && "bg-red-100 text-red-700 border border-red-300",
                    !day.completed && day.day === challengeProgress.currentDay + 1 && "bg-primary/10 text-primary border-2 border-primary animate-pulse-glow",
                    !day.completed && day.day !== challengeProgress.currentDay + 1 && "bg-gray-100 text-gray-400 border border-gray-200"
                  )}
                >
                  <span>{day.day}</span>
                  {day.completed && (
                    <span className="text-[9px]">{day.score}%</span>
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Today's Challenge */}
        <Card className="border-primary/30">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Day {challengeProgress.currentDay + 1} Challenge</h3>
              <p className="text-sm text-gray-500">30 Questions • Pass mark: 60%</p>
            </div>
            <Link href="/daily-challenge">
              <Button>
                Start
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Grand Mock Preview */}
        <Card className={cn(
          "relative overflow-hidden",
          !challengeProgress.grandMockUnlocked && "opacity-75"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900">FMGE Grand Mock Exam</h3>
                <p className="text-sm text-gray-500">300 Questions • 300 Minutes • Full FMGE Simulation</p>
              </div>
              {challengeProgress.grandMockUnlocked ? (
                <Link href="/grand-mock">
                  <Button variant="accent">Attempt Now</Button>
                </Link>
              ) : (
                <Badge variant="secondary">
                  <Lock className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              )}
            </div>
            {!challengeProgress.grandMockUnlocked && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 font-medium">Complete 30-Day Challenge to unlock</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
