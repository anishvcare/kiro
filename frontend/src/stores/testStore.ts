import { create } from "zustand";
import { Question, UserAnswer, TestAttempt } from "@/types";

interface TestState {
  // Test State
  currentTest: {
    id: number;
    attemptId: number;
    title: string;
    type: string;
    questions: Question[];
    duration: number;
    totalQuestions: number;
  } | null;
  
  // Progress
  currentQuestionIndex: number;
  answers: Map<number, UserAnswer>;
  markedForReview: Set<number>;
  timeRemaining: number;
  isSubmitting: boolean;
  
  // Results
  result: TestAttempt | null;
  
  // Actions
  setTest: (test: any) => void;
  setCurrentQuestion: (index: number) => void;
  submitAnswer: (questionId: number, selectedOption: string, timeTaken: number) => void;
  toggleMarkForReview: (questionId: number) => void;
  skipQuestion: () => void;
  setTimeRemaining: (time: number) => void;
  setResult: (result: TestAttempt) => void;
  resetTest: () => void;
  getAnsweredCount: () => number;
  getSkippedCount: () => number;
  getMarkedCount: () => number;
}

export const useTestStore = create<TestState>((set, get) => ({
  currentTest: null,
  currentQuestionIndex: 0,
  answers: new Map(),
  markedForReview: new Set(),
  timeRemaining: 0,
  isSubmitting: false,
  result: null,

  setTest: (test) => {
    set({
      currentTest: test,
      currentQuestionIndex: 0,
      answers: new Map(),
      markedForReview: new Set(),
      timeRemaining: test.duration * 60,
      result: null,
    });
  },

  setCurrentQuestion: (index) => {
    const test = get().currentTest;
    if (test && index >= 0 && index < test.questions.length) {
      set({ currentQuestionIndex: index });
    }
  },

  submitAnswer: (questionId, selectedOption, timeTaken) => {
    const answers = new Map(get().answers);
    const question = get().currentTest?.questions.find(q => q.id === questionId);
    
    answers.set(questionId, {
      question_id: questionId,
      selected_option: selectedOption,
      is_correct: question?.correct_option === selectedOption,
      time_taken_seconds: timeTaken,
      is_marked_for_review: get().markedForReview.has(questionId),
    });
    
    set({ answers });
  },

  toggleMarkForReview: (questionId) => {
    const markedForReview = new Set(get().markedForReview);
    if (markedForReview.has(questionId)) {
      markedForReview.delete(questionId);
    } else {
      markedForReview.add(questionId);
    }
    set({ markedForReview });
  },

  skipQuestion: () => {
    const { currentQuestionIndex, currentTest } = get();
    if (currentTest && currentQuestionIndex < currentTest.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    }
  },

  setTimeRemaining: (time) => set({ timeRemaining: time }),
  
  setResult: (result) => set({ result }),
  
  resetTest: () => set({
    currentTest: null,
    currentQuestionIndex: 0,
    answers: new Map(),
    markedForReview: new Set(),
    timeRemaining: 0,
    isSubmitting: false,
    result: null,
  }),

  getAnsweredCount: () => get().answers.size,
  getSkippedCount: () => {
    const test = get().currentTest;
    if (!test) return 0;
    return test.questions.length - get().answers.size;
  },
  getMarkedCount: () => get().markedForReview.size,
}));
