"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Filter,
  Upload,
  Edit,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const mockQuestions = [
  {
    id: 1,
    text: "A 45-year-old male presents with sudden onset severe chest pain...",
    subject: "Medicine",
    topic: "Cardiology",
    difficulty: "hard",
    type: "clinical_scenario",
    status: "active",
    createdAt: "2026-06-20",
  },
  {
    id: 2,
    text: "Which of the following is NOT a feature of Nephrotic Syndrome?",
    subject: "Medicine",
    topic: "Nephrology",
    difficulty: "medium",
    type: "mcq",
    status: "active",
    createdAt: "2026-06-19",
  },
  {
    id: 3,
    text: "The most common cause of neonatal sepsis in India is...",
    subject: "Pediatrics",
    topic: "Neonatology",
    difficulty: "easy",
    type: "mcq",
    status: "active",
    createdAt: "2026-06-18",
  },
  {
    id: 4,
    text: "Identify the structure marked by arrow in the given X-ray",
    subject: "Radiology",
    topic: "Chest X-ray",
    difficulty: "hard",
    type: "image_based",
    status: "draft",
    createdAt: "2026-06-17",
  },
  {
    id: 5,
    text: "True or False: Rifampicin causes orange discoloration of urine",
    subject: "Pharmacology",
    topic: "Antitubercular drugs",
    difficulty: "easy",
    type: "true_false",
    status: "active",
    createdAt: "2026-06-16",
  },
];

export default function AdminQuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-gray-900">Question Bank</h1>
            <p className="text-xs text-gray-500">Manage all FMGE questions</p>
          </div>
          <nav className="hidden md:flex items-center space-x-4">
            {["Dashboard", "Users", "Questions", "Subjects", "Notifications", "Subscriptions"].map((item) => (
              <a
                key={item}
                href={`/admin/${item.toLowerCase()}`}
                className={`text-sm font-medium ${item === "Questions" ? "text-primary" : "text-gray-600 hover:text-primary"}`}
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
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">6,320</p>
                <p className="text-xs text-gray-500">Total Questions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">5,890</p>
                <p className="text-xs text-gray-500">Active</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">320</p>
                <p className="text-xs text-gray-500">Draft</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-gray-600">110</p>
                <p className="text-xs text-gray-500">Inactive</p>
              </CardContent>
            </Card>
          </div>

          {/* Questions Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Question</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Subject</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Type</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Difficulty</th>
                      <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Status</th>
                      <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockQuestions.map((question) => (
                      <tr key={question.id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="text-sm text-gray-900 truncate max-w-xs">{question.text}</p>
                          <p className="text-xs text-gray-500">{question.topic}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{question.subject}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="secondary" className="text-xs capitalize">
                            {question.type.replace("_", " ")}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={
                            question.difficulty === "easy" ? "success" :
                            question.difficulty === "medium" ? "warning" : "destructive"
                          } className="text-xs capitalize">
                            {question.difficulty}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={question.status === "active" ? "success" : "secondary"} className="text-xs capitalize">
                            {question.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end space-x-1">
                            <button className="p-1.5 hover:bg-blue-50 rounded text-blue-600">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-amber-50 rounded text-amber-600">
                              <Edit className="w-4 h-4" />
                            </button>
                            <button className="p-1.5 hover:bg-red-50 rounded text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
