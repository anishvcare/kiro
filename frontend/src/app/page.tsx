"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Target, Flame, Trophy, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-teal-50">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <span className="font-bold text-lg text-gray-900">FMGE Trainer</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Login</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Flame className="w-4 h-4" />
              <span>Join 10,000+ FMGE Aspirants</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
              Ace Your <span className="text-gradient">FMGE Exam</span> with
              <br /> Daily Practice
            </h1>
            <p className="text-lg text-gray-600 mt-6 max-w-2xl mx-auto">
              The most comprehensive FMGE preparation platform. Daily challenges, 
              subject-wise practice, AI-powered analytics, and realistic mock exams.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <Link href="/register">
                <Button size="xl" className="px-8">
                  Start Free Preparation
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="xl">
                  I have an account
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Clear FMGE</h2>
            <p className="text-gray-500 mt-2">Structured preparation designed by medical educators</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Target,
                title: "Daily Challenges",
                description: "Morning & evening tests with 30 questions each. Build consistency with daily practice.",
                color: "bg-blue-100 text-blue-600",
              },
              {
                icon: BookOpen,
                title: "19 Subjects Covered",
                description: "Complete FMGE syllabus coverage with topic-wise practice and unlimited questions.",
                color: "bg-green-100 text-green-600",
              },
              {
                icon: Flame,
                title: "30-Day Challenge",
                description: "Complete the challenge to unlock the Grand Mock Exam. Build exam readiness.",
                color: "bg-orange-100 text-orange-600",
              },
              {
                icon: Trophy,
                title: "Grand Mock Exam",
                description: "300-question, 5-hour realistic FMGE simulation with detailed analysis.",
                color: "bg-purple-100 text-purple-600",
              },
              {
                icon: CheckCircle,
                title: "AI Analytics",
                description: "Track weak subjects, get personalized recommendations, and FMGE readiness score.",
                color: "bg-teal-100 text-teal-600",
              },
              {
                icon: Trophy,
                title: "Leaderboard",
                description: "Compete with peers globally, by university, or country. Track your rank.",
                color: "bg-amber-100 text-amber-600",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="p-6 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${feature.color}`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mt-4">{feature.title}</h3>
                <p className="text-sm text-gray-500 mt-2">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-primary-700 to-primary-500 rounded-3xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold">Ready to Start Your FMGE Journey?</h2>
            <p className="text-primary-100 mt-3 max-w-xl mx-auto">
              Join thousands of successful candidates who cleared FMGE with our platform.
            </p>
            <Link href="/register">
              <Button size="xl" variant="accent" className="mt-6">
                Start Free Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">FM</span>
            </div>
            <span className="font-semibold text-gray-900">FMGE Daily Trainer</span>
          </div>
          <p className="text-sm text-gray-500 mt-4 md:mt-0">
            &copy; 2026 FMGE Daily Trainer. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
