"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { testAPI } from "@/lib/api";
import { useTestStore } from "@/stores/testStore";
import toast from "react-hot-toast";

/**
 * Hook for managing daily challenges
 */
export function useDailyChallenge(type: "morning" | "evening") {
  return useQuery({
    queryKey: ["daily-challenge", type],
    queryFn: async () => {
      const response = await testAPI.getDailyChallenge(type);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for starting a test
 */
export function useStartTest() {
  const { setTest } = useTestStore();

  return useMutation({
    mutationFn: async (testId: number) => {
      const response = await testAPI.startTest(testId);
      return response.data.data;
    },
    onSuccess: (data) => {
      setTest({
        id: data.test.id,
        attemptId: data.attempt.id,
        title: data.test.title,
        type: data.test.type,
        questions: data.questions,
        duration: data.test.duration_minutes,
        totalQuestions: data.test.question_count,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to start test");
    },
  });
}

/**
 * Hook for submitting an answer
 */
export function useSubmitAnswer() {
  return useMutation({
    mutationFn: async ({
      attemptId,
      questionId,
      selectedOption,
      timeTaken,
    }: {
      attemptId: number;
      questionId: number;
      selectedOption: string;
      timeTaken: number;
    }) => {
      const response = await testAPI.submitAnswer(attemptId, {
        question_id: questionId,
        selected_option: selectedOption,
        time_taken: timeTaken,
      });
      return response.data.data;
    },
  });
}

/**
 * Hook for completing a test
 */
export function useCompleteTest() {
  const { setResult, resetTest } = useTestStore();

  return useMutation({
    mutationFn: async (attemptId: number) => {
      const response = await testAPI.completeTest(attemptId);
      return response.data.data;
    },
    onSuccess: (data) => {
      setResult(data);
      toast.success(`Test completed! Score: ${data.percentage}%`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit test");
    },
  });
}

/**
 * Hook for test timer with auto-submit
 */
export function useTestTimer(
  durationMinutes: number,
  onTimeUp: () => void,
  isActive: boolean = true
) {
  const [timeRemaining, setTimeRemaining] = useState(durationMinutes * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onTimeUpRef = useRef(onTimeUp);

  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          onTimeUpRef.current();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive]);

  const formatTime = useCallback((seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  return {
    timeRemaining,
    formattedTime: formatTime(timeRemaining),
    isLowTime: timeRemaining < 300, // Less than 5 minutes
    isCritical: timeRemaining < 60, // Less than 1 minute
  };
}

/**
 * Hook for getting test result
 */
export function useTestResult(attemptId: number) {
  return useQuery({
    queryKey: ["test-result", attemptId],
    queryFn: async () => {
      const response = await testAPI.getTestResult(attemptId);
      return response.data.data;
    },
    enabled: !!attemptId,
  });
}
