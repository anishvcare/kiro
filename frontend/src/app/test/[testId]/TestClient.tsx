"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, Flag, ChevronRight, SkipForward, CheckCircle,
  AlertCircle, Grid3X3, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatTime } from "@/lib/utils";
import { Question } from "@/types";

const mockQuestions: Question[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1, subject_id: Math.ceil(Math.random() * 19), topic_id: 1,
  question_text: i === 0
    ? "A 45-year-old male presents with sudden onset severe chest pain radiating to the back. His BP is 180/100 mmHg in the right arm and 140/80 in the left arm. What is the most likely diagnosis?"
    : i === 1 ? "Which of the following is NOT a feature of Nephrotic Syndrome?"
    : `Sample FMGE question ${i + 1} - Clinical scenario testing medical knowledge.`,
  question_type: "mcq",
  options: [
    { key: "A", text: i === 0 ? "Aortic Dissection" : "Option A" },
    { key: "B", text: i === 0 ? "Myocardial Infarction" : "Option B" },
    { key: "C", text: i === 0 ? "Pulmonary Embolism" : "Option C" },
    { key: "D", text: i === 0 ? "Pneumothorax" : "Option D" },
  ],
  correct_option: i === 0 ? "A" : ["A","B","C","D"][Math.floor(Math.random()*4)],
  explanation: "Detailed explanation for this question.",
  reference: "Harrison's Internal Medicine",
  learning_point: "Key concept for FMGE.",
  difficulty: (["easy","medium","hard"] as const)[Math.floor(Math.random()*3)],
  status: "active", tags: ["FMGE"],
}));

export default function TestClient() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, string>>(new Map());
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [timer, setTimer] = useState(30 * 60);

  const questions = mockQuestions;
  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const progress = ((currentIndex + 1) / totalQuestions) * 100;

  useEffect(() => {
    if (testCompleted) return;
    const interval = setInterval(() => {
      setTimer(prev => { if (prev <= 0) { setTestCompleted(true); return 0; } return prev - 1; });
    }, 1000);
    return () => clearInterval(interval);
  }, [testCompleted]);

  useEffect(() => { setSelectedOption(null); setShowResult(false); }, [currentIndex]);

  const handleConfirmAnswer = () => {
    if (!selectedOption) return;
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, selectedOption);
    setAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false); setSelectedOption(null);
    if (currentIndex < totalQuestions - 1) setCurrentIndex(currentIndex + 1);
    else setTestCompleted(true);
  };

  const handleSkip = () => {
    if (currentIndex < totalQuestions - 1) { setCurrentIndex(currentIndex + 1); setShowResult(false); setSelectedOption(null); }
  };

  const toggleMark = () => {
    const newMarked = new Set(markedForReview);
    if (newMarked.has(currentQuestion.id)) newMarked.delete(currentQuestion.id);
    else newMarked.add(currentQuestion.id);
    setMarkedForReview(newMarked);
  };

  const getOptionStyle = (key: string) => {
    if (!showResult) return selectedOption === key ? "border-primary bg-primary/5 ring-2 ring-primary" : "border-gray-200 hover:border-primary/50";
    if (key === currentQuestion.correct_option) return "border-green-500 bg-green-50 ring-2 ring-green-500";
    if (key === selectedOption && key !== currentQuestion.correct_option) return "border-red-500 bg-red-50 ring-2 ring-red-500";
    return "border-gray-200 opacity-50";
  };

  if (testCompleted) {
    const correctCount = Array.from(answers.entries()).filter(([qId, opt]) => mockQuestions.find(q => q.id === qId)?.correct_option === opt).length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} className="max-w-md w-full">
          <Card><CardContent className="p-8 text-center">
            <div className={cn("w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6", percentage >= 60 ? "bg-green-100" : "bg-red-100")}>
              {percentage >= 60 ? <CheckCircle className="w-12 h-12 text-green-600" /> : <AlertCircle className="w-12 h-12 text-red-600" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Completed!</h2>
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center"><p className="text-2xl font-bold text-green-600">{correctCount}</p><p className="text-xs text-gray-500">Correct</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-red-600">{answers.size - correctCount}</p><p className="text-xs text-gray-500">Wrong</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-gray-600">{totalQuestions - answers.size}</p><p className="text-xs text-gray-500">Skipped</p></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-500">Your Score</p>
              <p className={cn("text-4xl font-bold", percentage >= 60 ? "text-green-600" : "text-red-600")}>{percentage}%</p>
            </div>
            <div className="space-y-3">
              <Button className="w-full" size="lg" asChild><a href="/dashboard/">Back to Dashboard</a></Button>
              <Button variant="outline" className="w-full" size="lg" asChild><a href="/analytics/">View Analysis</a></Button>
            </div>
          </CardContent></Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">Q {currentIndex + 1}/{totalQuestions}</span>
            <Progress value={progress} className="w-20 h-2" />
          </div>
          <div className="flex items-center space-x-2">
            <div className={cn("flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium", timer < 300 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700")}>
              <Clock className="w-4 h-4" /><span>{formatTime(timer)}</span>
            </div>
            <button onClick={() => setShowNavigator(true)} className="p-2 hover:bg-gray-100 rounded-lg"><Grid3X3 className="w-5 h-5 text-gray-600" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }}>
            <Card className="mb-6"><CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={currentQuestion.difficulty === "easy" ? "success" : currentQuestion.difficulty === "medium" ? "warning" : "destructive"}>{currentQuestion.difficulty}</Badge>
                <button onClick={toggleMark} className={cn("p-2 rounded-lg", markedForReview.has(currentQuestion.id) ? "bg-amber-100 text-amber-600" : "hover:bg-gray-100 text-gray-400")}><Flag className="w-4 h-4" /></button>
              </div>
              <p className="text-base text-gray-900 leading-relaxed">{currentQuestion.question_text}</p>
            </CardContent></Card>

            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option) => (
                <button key={option.key} onClick={() => !showResult && setSelectedOption(option.key)} className={cn("w-full text-left p-4 rounded-xl border-2 transition-all", getOptionStyle(option.key))}>
                  <div className="flex items-start space-x-3">
                    <span className={cn("flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2", selectedOption === option.key && !showResult ? "border-primary bg-primary text-white" : showResult && option.key === currentQuestion.correct_option ? "border-green-500 bg-green-500 text-white" : showResult && option.key === selectedOption ? "border-red-500 bg-red-500 text-white" : "border-gray-300 text-gray-500")}>{option.key}</span>
                    <span className="text-sm text-gray-700 pt-1">{option.text}</span>
                  </div>
                </button>
              ))}
            </div>

            {showResult && currentQuestion.explanation && (
              <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}>
                <Card className="border-blue-200 bg-blue-50 mb-6"><CardContent className="p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📝 Explanation</h4>
                  <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
                  {currentQuestion.learning_point && <p className="text-xs text-blue-600 mt-2">💡 {currentQuestion.learning_point}</p>}
                </CardContent></Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleSkip} disabled={showResult}><SkipForward className="w-4 h-4 mr-1" />Skip</Button>
          {!showResult ? (
            <Button onClick={handleConfirmAnswer} disabled={!selectedOption} size="lg">Confirm Answer</Button>
          ) : (
            <Button onClick={handleNext} size="lg">{currentIndex < totalQuestions - 1 ? "Next Question" : "Finish Test"}<ChevronRight className="w-4 h-4 ml-1" /></Button>
          )}
        </div>
      </div>

      {/* Navigator Modal */}
      <AnimatePresence>
        {showNavigator && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center" onClick={() => setShowNavigator(false)}>
            <motion.div initial={{ y:"100%" }} animate={{ y:0 }} exit={{ y:"100%" }} onClick={e => e.stopPropagation()} className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[70vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Question Navigator</h3>
                <button onClick={() => setShowNavigator(false)}><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <div className="grid grid-cols-6 gap-2">
                {questions.map((q, index) => (
                  <button key={q.id} onClick={() => { setCurrentIndex(index); setShowNavigator(false); setShowResult(false); setSelectedOption(null); }}
                    className={cn("w-10 h-10 rounded-lg text-sm font-medium", index === currentIndex && "bg-primary text-white", index !== currentIndex && answers.has(q.id) && "bg-green-100 text-green-700 border border-green-300", index !== currentIndex && !answers.has(q.id) && "bg-gray-100 text-gray-600 border border-gray-200")}>{index + 1}</button>
                ))}
              </div>
              <Button className="w-full mt-4" variant="destructive" onClick={() => { setTestCompleted(true); setShowNavigator(false); }}>Submit Test</Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
