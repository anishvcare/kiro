"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { subjectAPI } from "@/lib/api";

/**
 * Hook to get all subjects
 */
export function useSubjects() {
  return useQuery({
    queryKey: ["subjects"],
    queryFn: async () => {
      const response = await subjectAPI.getAll();
      return response.data.data;
    },
    staleTime: 30 * 60 * 1000, // 30 minutes (subjects rarely change)
  });
}

/**
 * Hook to get subject details
 */
export function useSubjectDetails(subjectId: number) {
  return useQuery({
    queryKey: ["subject", subjectId],
    queryFn: async () => {
      const response = await subjectAPI.getById(subjectId);
      return response.data.data;
    },
    enabled: !!subjectId,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook to get topics for a subject
 */
export function useTopics(subjectId: number) {
  return useQuery({
    queryKey: ["topics", subjectId],
    queryFn: async () => {
      const response = await subjectAPI.getTopics(subjectId);
      return response.data.data;
    },
    enabled: !!subjectId,
    staleTime: 15 * 60 * 1000,
  });
}

/**
 * Hook to start a practice test
 */
export function usePracticeTest() {
  return useMutation({
    mutationFn: async ({
      subjectId,
      topicId,
    }: {
      subjectId: number;
      topicId?: number;
    }) => {
      const response = await subjectAPI.getPracticeTest(subjectId, topicId);
      return response.data.data;
    },
  });
}
