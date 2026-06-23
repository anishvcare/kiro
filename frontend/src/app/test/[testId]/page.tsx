"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  CheckCircle,
  AlertCircle,
  Grid3X3,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn, formatTime } from "@/lib/utils";
import { useTestStore } from "@/stores/testStore";
import { Question } from "@/types";

// Mock questions for demo
const mockQuestions: Question[] = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  subject_id: Math.ceil(Math.random() * 19),
  topic_id: 1,
  question_text: i === 0
    ? "A 45-year-old male presents with sudden onset severe chest pain radiating to the back. His BP is 180/100 mmHg in the right arm and 140/80 in the left arm. What is the most likely diagnosis?"
    : i === 1
    ? "Which of the following is NOT a feature of Nephrotic Syndrome?"
    : `Sample FMGE question ${i + 1} - This is a clinical scenario based question testing knowledge of medical sciences.`,
  question_type: "mcq",
  options: [
    { key: "A", text: i === 0 ? "Aortic Dissection" : i === 1 ? "Proteinuria > 3.5g/day" : "Option A - First answer choice" },
    { key: "B", text: i === 0 ? "Myocardial Infarction" : i === 1 ? "Hypoalbuminemia" : "Option B - Second answer choice" },
    { key: "C", text: i === 0 ? "Pulmonary Embolism" : i === 1 ? "Hematuria" : "Option C - Third answer choice" },
    { key: "D", text: i === 0 ? "Pneumothorax" : i === 1 ? "Hyperlipidemia" : "Option D - Fourth answer choice" },
  ],
  correct_option: i === 0 ? "A" : i === 1 ? "C" : ["A", "B", "C", "D"][Math.floor(Math.random() * 4)],
  explanation: "This is the detailed explanation for this question with key learning points.",
  reference: "Harrison's Principles of Internal Medicine, 21st Edition",
  learning_point: "Key concept to remember for FMGE examination.",
  difficulty: ["easy", "medium", "hard"][Math.floor(Math.random() * 3)] as "easy" | "medium" | "hard",
  image_url: undefined,
  tags: ["FMGE", "Medicine"],
  status: "active",
}));

export default function TestPage() {
  const {
    currentQuestionIndex,
    answers,
    markedForReview,
    timeRemaining,
    setCurrentQuestion,
    submitAnswer,
    toggleMarkForReview,
    skipQuestion,
    setTimeRemaining,
  } = useTestStore();

  const [showNavigator, setShowNavigator] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [testCompleted, setTestCompleted] = useState(false);

  const questions = mockQuestions;
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  // Timer
  const [timer, setTimer] = useState(30 * 60); // 30 minutes
  
  useEffect(() => {
    if (testCompleted) return;
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          setTestCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [testCompleted]);

  useEffect(() => {
    setSelectedOption(null);
    setQuestionStartTime(Date.now());
  }, [currentQuestionIndex]);

  const handleOptionSelect = (key: string) => {
    if (showResult) return;
    setSelectedOption(key);
  };

  const handleConfirmAnswer = () => {
    if (!selectedOption) return;
    const timeTaken = Math.round((Date.now() - questionStartTime) / 1000);
    submitAnswer(currentQuestion.id, selectedOption, timeTaken);
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedOption(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    } else {
      setTestCompleted(true);
    }
  };

  const handleSkip = () => {
    setShowResult(false);
    setSelectedOption(null);
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestion(currentQuestionIndex + 1);
    }
  };

  const getOptionStyle = (key: string) => {
    if (!showResult) {
      return selectedOption === key
        ? "border-primary bg-primary/5 ring-2 ring-primary"
        : "border-gray-200 hover:border-primary/50 hover:bg-gray-50";
    }
    if (key === currentQuestion.correct_option) {
      return "border-green-500 bg-green-50 ring-2 ring-green-500";
    }
    if (key === selectedOption && key !== currentQuestion.correct_option) {
      return "border-red-500 bg-red-50 ring-2 ring-red-500";
    }
    return "border-gray-200 opacity-50";
  };

  // Test Complete Screen
  if (testCompleted) {
    const correctCount = Array.from(answers.values()).filter(a => a.is_correct).length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);
    
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6",
                  percentage >= 60 ? "bg-green-100" : "bg-red-100"
                )}
              >
                {percentage >= 60 ? (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                ) : (
                  <AlertCircle className="w-12 h-12 text-red-600" />
                )}
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Completed!</h2>
              <p className="text-gray-500 mb-6">Here&apos;s your performance summary</p>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{correctCount}</p>
                  <p className="text-xs text-gray-500">Correct</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{answers.size - correctCount}</p>
                  <p className="text-xs text-gray-500">Wrong</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-600">{totalQuestions - answers.size}</p>
                  <p className="text-xs text-gray-500">Skipped</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-500">Your Score</p>
                <p className={cn("text-4xl font-bold", percentage >= 60 ? "text-green-600" : "text-red-600")}>
                  {percentage}%
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {correctCount}/{totalQuestions} correct answers
                </p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <a href="/dashboard">Back to Dashboard</a>
                </Button>
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <a href="/analytics">View Detailed Analysis</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14 max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-gray-900">
              Q {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <Progress value={progress} className="w-20 h-2" />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium",
              timer < 300 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
            )}>
              <Clock className="w-4 h-4" />
              <span>{formatTime(timer)}</span>
            </div>
            <button
              onClick={() => setShowNavigator(true)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <Grid3X3 className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Question Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            {/* Question */}
            <Card className="mb-6">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant={
                    currentQuestion.difficulty === "easy" ? "success" :
                    currentQuestion.difficulty === "medium" ? "warning" : "destructive"
                  }>
                    {currentQuestion.difficulty}
                  </Badge>
                  <button
                    onClick={() => toggleMarkForReview(currentQuestion.id)}
                    className={cn(
                      "p-2 rounded-lg transition-colors",
                      markedForReview.has(currentQuestion.id)
                        ? "bg-amber-100 text-amber-600"
                        : "hover:bg-gray-100 text-gray-400"
                    )}
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-base text-gray-900 leading-relaxed">
                  {currentQuestion.question_text}
                </p>
                {currentQuestion.image_url && (
                  <img
                    src={currentQuestion.image_url}
                    alt="Question image"
                    className="mt-4 rounded-lg max-h-48 object-contain"
                  />
                )}
              </CardContent>
            </Card>

            {/* Options */}
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option) => (
                <motion.button
                  key={option.key}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOptionSelect(option.key)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl border-2 transition-all duration-200",
                    getOptionStyle(option.key)
                  )}
                >
                  <div className="flex items-start space-x-3">
                    <span className={cn(
                      "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2",
                      selectedOption === option.key && !showResult
                        ? "border-primary bg-primary text-white"
                        : showResult && option.key === currentQuestion.correct_option
                        ? "border-green-500 bg-green-500 text-white"
                        : showResult && option.key === selectedOption
                        ? "border-red-500 bg-red-500 text-white"
                        : "border-gray-300 text-gray-500"
                    )}>
                      {option.key}
                    </span>
                    <span className="text-sm text-gray-700 pt-1">{option.text}</span>
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Explanation (shown after answer) */}
            {showResult && currentQuestion.explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-blue-200 bg-blue-50 mb-6">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">📝 Explanation</h4>
                    <p className="text-sm text-blue-700">{currentQuestion.explanation}</p>
                    {currentQuestion.learning_point && (
                      <div className="mt-3 p-2 bg-blue-100 rounded-lg">
                        <p className="text-xs font-medium text-blue-800">💡 Learning Point</p>
                        <p className="text-xs text-blue-700 mt-1">{currentQuestion.learning_point}</p>
                      </div>
                    )}
                    {currentQuestion.reference && (
                      <p className="text-xs text-blue-600 mt-2">📚 Ref: {currentQuestion.reference}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={showResult}
            className="text-gray-500"
          >
            <SkipForward className="w-4 h-4 mr-1" />
            Skip
          </Button>

          {!showResult ? (
            <Button
              onClick={handleConfirmAnswer}
              disabled={!selectedOption}
              size="lg"
            >
              Confirm Answer
            </Button>
          ) : (
            <Button onClick={handleNext} size="lg">
              {currentQuestionIndex < totalQuestions - 1 ? "Next Question" : "Finish Test"}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Question Navigator Modal */}
      <AnimatePresence>
        {showNavigator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end md:items-center justify-center"
            onClick={() => setShowNavigator(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-t-2xl md:rounded-2xl w-full max-w-md max-h-[70vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Question Navigator</h3>
                <button onClick={() => setShowNavigator(false)}>
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap gap-3 mb-4 text-xs">
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm" />
                  <span>Answered</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                  <span>Marked</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-sm" />
                  <span>Not visited</span>
                </span>
                <span className="flex items-center space-x-1">
                  <div className="w-3 h-3 bg-primary rounded-sm" />
                  <span>Current</span>
                </span>
              </div>

              {/* Grid */}
              <div className="grid grid-cols-6 gap-2">
                {questions.map((q, index) => {
                  const isAnswered = answers.has(q.id);
                  const isMarked = markedForReview.has(q.id);
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestion(index);
                        setShowNavigator(false);
                        setShowResult(false);
                        setSelectedOption(null);
                      }}
                      className={cn(
                        "w-10 h-10 rounded-lg text-sm font-medium transition-all",
                        isCurrent && "bg-primary text-white ring-2 ring-primary/50",
                        !isCurrent && isAnswered && "bg-green-100 text-green-700 border border-green-300",
                        !isCurrent && isMarked && !isAnswered && "bg-amber-100 text-amber-700 border border-amber-300",
                        !isCurrent && !isAnswered && !isMarked && "bg-gray-100 text-gray-600 border border-gray-200"
                      )}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>

              {/* Stats */}
              <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-lg font-bold text-green-600">{answers.size}</p>
                  <p className="text-xs text-gray-500">Answered</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-amber-600">{markedForReview.size}</p>
                  <p className="text-xs text-gray-500">Marked</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-gray-600">{totalQuestions - answers.size}</p>
                  <p className="text-xs text-gray-500">Remaining</p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className="w-full mt-4"
                variant="destructive"
                onClick={() => { setTestCompleted(true); setShowNavigator(false); }}
              >
                Submit Test
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
