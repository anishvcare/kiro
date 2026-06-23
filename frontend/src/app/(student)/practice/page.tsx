"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Brain } from "lucide-react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const subjects = [
  { id: 1, name: "Anatomy", icon: "🦴", questions: 450, progress: 35, color: "bg-red-50 border-red-200" },
  { id: 2, name: "Physiology", icon: "💓", questions: 380, progress: 42, color: "bg-pink-50 border-pink-200" },
  { id: 3, name: "Biochemistry", icon: "🧬", questions: 320, progress: 28, color: "bg-purple-50 border-purple-200" },
  { id: 4, name: "Pathology", icon: "🔬", questions: 520, progress: 55, color: "bg-blue-50 border-blue-200" },
  { id: 5, name: "Pharmacology", icon: "💊", questions: 480, progress: 20, color: "bg-green-50 border-green-200" },
  { id: 6, name: "Microbiology", icon: "🦠", questions: 350, progress: 38, color: "bg-teal-50 border-teal-200" },
  { id: 7, name: "Forensic Medicine", icon: "⚖️", questions: 200, progress: 60, color: "bg-gray-50 border-gray-200" },
  { id: 8, name: "Community Medicine", icon: "🏥", questions: 380, progress: 45, color: "bg-cyan-50 border-cyan-200" },
  { id: 9, name: "ENT", icon: "👂", questions: 220, progress: 30, color: "bg-amber-50 border-amber-200" },
  { id: 10, name: "Ophthalmology", icon: "👁️", questions: 250, progress: 48, color: "bg-indigo-50 border-indigo-200" },
  { id: 11, name: "Medicine", icon: "🩺", questions: 680, progress: 62, color: "bg-emerald-50 border-emerald-200" },
  { id: 12, name: "Surgery", icon: "🔪", questions: 520, progress: 40, color: "bg-orange-50 border-orange-200" },
  { id: 13, name: "Orthopedics", icon: "🦿", questions: 280, progress: 33, color: "bg-lime-50 border-lime-200" },
  { id: 14, name: "Pediatrics", icon: "👶", questions: 350, progress: 50, color: "bg-sky-50 border-sky-200" },
  { id: 15, name: "OBG", icon: "🤰", questions: 420, progress: 44, color: "bg-rose-50 border-rose-200" },
  { id: 16, name: "Dermatology", icon: "🧴", questions: 180, progress: 65, color: "bg-yellow-50 border-yellow-200" },
  { id: 17, name: "Psychiatry", icon: "🧠", questions: 200, progress: 55, color: "bg-violet-50 border-violet-200" },
  { id: 18, name: "Radiology", icon: "📡", questions: 180, progress: 25, color: "bg-slate-50 border-slate-200" },
  { id: 19, name: "Anesthesia", icon: "😷", questions: 150, progress: 70, color: "bg-stone-50 border-stone-200" },
];

export default function PracticePage() {
  return (
    <AppLayout title="Subject Practice">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subject Practice</h1>
          <p className="text-gray-500 mt-1">Choose a subject to start practicing</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="text-center">
            <CardContent className="p-3">
              <p className="text-xl font-bold text-primary">19</p>
              <p className="text-xs text-gray-500">Subjects</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <p className="text-xl font-bold text-primary">6,320</p>
              <p className="text-xs text-gray-500">Questions</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-3">
              <p className="text-xl font-bold text-primary">42%</p>
              <p className="text-xs text-gray-500">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Subject Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link href={`/practice/${subject.id}`}>
                <Card className={`hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 border ${subject.color}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{subject.icon}</span>
                        <div>
                          <h3 className="font-semibold text-gray-900">{subject.name}</h3>
                          <p className="text-xs text-gray-500">{subject.questions} Questions</p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-gray-700">{subject.progress}%</span>
                      </div>
                      <Progress value={subject.progress} className="h-1.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
