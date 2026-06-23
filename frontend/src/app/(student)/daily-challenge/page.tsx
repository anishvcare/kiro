"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Clock, Play, CheckCircle2, Lock } from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DailyChallengePage() {
  const challenges = [
    {
      id: 1,
      type: "morning",
      title: "Morning Challenge",
      description: "Start your day with 30 FMGE questions",
      icon: Sun,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      time: "9:00 AM",
      questions: 30,
      status: "completed" as const,
      score: 23,
      gradient: "from-amber-50 to-orange-50",
      borderColor: "border-l-amber-400",
    },
    {
      id: 2,
      type: "evening",
      title: "Evening Challenge",
      description: "Test your knowledge with 30 more questions",
      icon: Moon,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      time: "7:00 PM",
      questions: 30,
      status: "available" as const,
      score: null,
      gradient: "from-indigo-50 to-purple-50",
      borderColor: "border-l-indigo-400",
    },
  ];

  return (
    <AppLayout title="Daily Challenge">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Daily Challenges</h1>
          <p className="text-gray-500 mt-1">Complete both challenges to maintain your streak</p>
        </div>

        {/* Progress */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Today&apos;s Progress</p>
                <p className="text-lg font-bold text-gray-900">1/2 Completed</p>
              </div>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
                <div className="w-3 h-3 bg-gray-300 rounded-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Cards */}
        <div className="space-y-4">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.15 }}
            >
              <Card className={`border-l-4 ${challenge.borderColor} overflow-hidden`}>
                <CardContent className={`p-5 bg-gradient-to-r ${challenge.gradient}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 ${challenge.iconBg} rounded-xl flex items-center justify-center`}>
                        <challenge.icon className={`w-6 h-6 ${challenge.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{challenge.title}</h3>
                        <p className="text-sm text-gray-500 mt-0.5">{challenge.description}</p>
                        <div className="flex items-center space-x-3 mt-2">
                          <span className="flex items-center text-xs text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {challenge.time}
                          </span>
                          <span className="text-xs text-gray-500">
                            {challenge.questions} Questions
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    {challenge.status === "completed" && (
                      <div className="flex items-center justify-between">
                        <Badge variant="success">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                        <span className="text-sm font-medium text-gray-700">
                          Score: {challenge.score}/{challenge.questions}
                        </span>
                      </div>
                    )}
                    {challenge.status === "available" && (
                      <Link href={`/test/daily-${challenge.type}`}>
                        <Button className="w-full" size="lg">
                          <Play className="w-4 h-4 mr-2" />
                          Start Challenge
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tips */}
        <Card className="bg-primary-50 border-primary-100">
          <CardContent className="p-4">
            <h4 className="font-medium text-primary-800 mb-2">💡 Tips for Today</h4>
            <ul className="text-sm text-primary-700 space-y-1">
              <li>• Focus on understanding explanations, not just answers</li>
              <li>• Review weak subjects from yesterday&apos;s test</li>
              <li>• Take notes on key learning points</li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
    </AppLayout>
  );
}
