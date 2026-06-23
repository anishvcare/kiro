"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  ChevronDown,
  ChevronRight,
  GripVertical,
} from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const subjects = [
  { id: 1, name: "Anatomy", icon: "🦴", topics: 9, questions: 450, weight: 8, active: true },
  { id: 2, name: "Physiology", icon: "💓", topics: 9, questions: 380, weight: 8, active: true },
  { id: 3, name: "Biochemistry", icon: "🧬", topics: 9, questions: 320, weight: 7, active: true },
  { id: 4, name: "Pathology", icon: "🔬", topics: 8, questions: 520, weight: 12, active: true },
  { id: 5, name: "Pharmacology", icon: "💊", topics: 9, questions: 480, weight: 12, active: true },
  { id: 6, name: "Microbiology", icon: "🦠", topics: 7, questions: 350, weight: 9, active: true },
  { id: 7, name: "Forensic Medicine", icon: "⚖️", topics: 5, questions: 200, weight: 5, active: true },
  { id: 8, name: "Community Medicine", icon: "🏥", topics: 8, questions: 380, weight: 10, active: true },
  { id: 9, name: "ENT", icon: "👂", topics: 5, questions: 220, weight: 5, active: true },
  { id: 10, name: "Ophthalmology", icon: "👁️", topics: 8, questions: 250, weight: 6, active: true },
  { id: 11, name: "Medicine", icon: "🩺", topics: 10, questions: 680, weight: 15, active: true },
  { id: 12, name: "Surgery", icon: "🔪", topics: 9, questions: 520, weight: 12, active: true },
  { id: 13, name: "Orthopedics", icon: "🦿", topics: 7, questions: 280, weight: 6, active: true },
  { id: 14, name: "Pediatrics", icon: "👶", topics: 8, questions: 350, weight: 8, active: true },
  { id: 15, name: "OBG", icon: "🤰", topics: 8, questions: 420, weight: 10, active: true },
  { id: 16, name: "Dermatology", icon: "🧴", topics: 7, questions: 180, weight: 4, active: true },
  { id: 17, name: "Psychiatry", icon: "🧠", topics: 7, questions: 200, weight: 5, active: true },
  { id: 18, name: "Radiology", icon: "📡", topics: 6, questions: 180, weight: 4, active: true },
  { id: 19, name: "Anesthesia", icon: "😷", topics: 6, questions: 150, weight: 4, active: true },
];

export default function AdminSubjectsPage() {
  const [expandedSubject, setExpandedSubject] = useState<number | null>(null);

  const totalQuestions = subjects.reduce((sum, s) => sum + s.questions, 0);
  const totalTopics = subjects.reduce((sum, s) => sum + s.topics, 0);

  return (
    <AdminLayout title="Subject Management">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6"
      >
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-primary">{subjects.length}</p>
              <p className="text-xs text-gray-500">Subjects</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{totalTopics}</p>
              <p className="text-xs text-gray-500">Topics</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{totalQuestions.toLocaleString()}</p>
              <p className="text-xs text-gray-500">Questions</p>
            </CardContent>
          </Card>
        </div>

        {/* Add Subject Button */}
        <div className="flex justify-end">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Subject
          </Button>
        </div>

        {/* Subjects List */}
        <div className="space-y-2">
          {subjects.map((subject, index) => (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className="hover:shadow-sm transition-all">
                <CardContent className="p-0">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer"
                    onClick={() => setExpandedSubject(expandedSubject === subject.id ? null : subject.id)}
                  >
                    <div className="flex items-center space-x-4">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                      <span className="text-2xl">{subject.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{subject.name}</h3>
                        <p className="text-xs text-gray-500">
                          {subject.topics} topics • {subject.questions} questions • Weight: {subject.weight}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant={subject.active ? "success" : "secondary"} className="text-xs">
                        {subject.active ? "Active" : "Inactive"}
                      </Badge>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 hover:bg-blue-50 rounded text-blue-600"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); }}
                        className="p-1.5 hover:bg-red-50 rounded text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      {expandedSubject === subject.id ? (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Topics */}
                  {expandedSubject === subject.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="border-t px-4 pb-4"
                    >
                      <div className="pt-3 flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Topics</h4>
                        <Button size="sm" variant="outline">
                          <Plus className="w-3 h-3 mr-1" />
                          Add Topic
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Array.from({ length: subject.topics }, (_, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-2">
                              <BookOpen className="w-3 h-3 text-gray-400" />
                              <span className="text-xs text-gray-700">Topic {i + 1}</span>
                            </div>
                            <div className="flex space-x-1">
                              <button className="p-1 hover:bg-blue-50 rounded text-blue-500">
                                <Edit className="w-3 h-3" />
                              </button>
                              <button className="p-1 hover:bg-red-50 rounded text-red-500">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AdminLayout>
  );
}
