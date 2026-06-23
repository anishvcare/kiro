"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Play, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock data
const subjectData = {
  id: 11,
  name: "Medicine",
  icon: "🩺",
  description: "Internal Medicine - Complete FMGE syllabus coverage",
  totalQuestions: 680,
  completedQuestions: 420,
  topics: [
    {
      id: 1,
      name: "Cardiology",
      questions: 95,
      completed: 60,
      subtopics: ["Heart Failure", "Valvular Diseases", "Arrhythmias", "IHD", "Hypertension"],
    },
    {
      id: 2,
      name: "Neurology",
      questions: 80,
      completed: 45,
      subtopics: ["Stroke", "Epilepsy", "Headache", "Movement Disorders", "Neuropathies"],
    },
    {
      id: 3,
      name: "Respiratory",
      questions: 70,
      completed: 55,
      subtopics: ["COPD", "Asthma", "Pneumonia", "TB", "Lung Cancer"],
    },
    {
      id: 4,
      name: "Gastroenterology",
      questions: 75,
      completed: 40,
      subtopics: ["Liver Diseases", "IBD", "Pancreatitis", "GI Bleeding", "Malabsorption"],
    },
    {
      id: 5,
      name: "Endocrinology",
      questions: 65,
      completed: 50,
      subtopics: ["Diabetes", "Thyroid", "Adrenal", "Pituitary", "Calcium Disorders"],
    },
    {
      id: 6,
      name: "Nephrology",
      questions: 60,
      completed: 35,
      subtopics: ["AKI", "CKD", "Glomerulonephritis", "Electrolytes", "Dialysis"],
    },
    {
      id: 7,
      name: "Hematology",
      questions: 55,
      completed: 30,
      subtopics: ["Anemia", "Leukemia", "Lymphoma", "Bleeding Disorders", "Transfusion"],
    },
    {
      id: 8,
      name: "Rheumatology",
      questions: 50,
      completed: 40,
      subtopics: ["RA", "SLE", "Vasculitis", "Gout", "OA"],
    },
    {
      id: 9,
      name: "Infectious Diseases",
      questions: 80,
      completed: 65,
      subtopics: ["HIV", "Malaria", "Dengue", "Typhoid", "Sepsis"],
    },
    {
      id: 10,
      name: "Dermatology",
      questions: 50,
      completed: 25,
      subtopics: ["Psoriasis", "Eczema", "Infections", "Autoimmune", "Drug Reactions"],
    },
  ],
};

export default function SubjectPracticePage() {
  const params = useParams();
  const overallProgress = Math.round((subjectData.completedQuestions / subjectData.totalQuestions) * 100);

  return (
    <AppLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-6 max-w-4xl mx-auto"
      >
        {/* Back Button */}
        <Link
          href="/practice"
          className="inline-flex items-center text-sm text-gray-500 hover:text-primary"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Subjects
        </Link>

        {/* Subject Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-4xl">{subjectData.icon}</span>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{subjectData.name}</h1>
                <p className="text-sm text-gray-500 mt-1">{subjectData.description}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Questions</p>
              <p className="text-xl font-bold text-gray-900">{subjectData.totalQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-xl font-bold text-green-600">{subjectData.completedQuestions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Progress</p>
              <p className="text-xl font-bold text-primary">{overallProgress}%</p>
            </div>
          </div>
          <Progress value={overallProgress} className="mt-4 h-2" />
        </div>

        {/* Quick Practice */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Quick Practice</h3>
              <p className="text-sm text-gray-500">Random 30 questions from all topics</p>
            </div>
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          </CardContent>
        </Card>

        {/* Topics */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Topics</h2>
          <div className="space-y-3">
            {subjectData.topics.map((topic, index) => {
              const topicProgress = Math.round((topic.completed / topic.questions) * 100);
              return (
                <motion.div
                  key={topic.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="hover:shadow-md transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="font-medium text-gray-900">{topic.name}</h3>
                            <Badge variant="secondary" className="text-xs">
                              {topic.completed}/{topic.questions}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {topic.subtopics.slice(0, 4).map((subtopic) => (
                              <span
                                key={subtopic}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full"
                              >
                                {subtopic}
                              </span>
                            ))}
                            {topic.subtopics.length > 4 && (
                              <span className="text-xs text-gray-400">
                                +{topic.subtopics.length - 4} more
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-3">
                            <Progress value={topicProgress} className="flex-1 h-1.5" />
                            <span className="text-xs font-medium text-gray-500">{topicProgress}%</span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" className="ml-4">
                          <Play className="w-3 h-3 mr-1" />
                          Practice
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
