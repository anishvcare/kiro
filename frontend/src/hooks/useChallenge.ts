"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { challengeAPI } from "@/lib/api";
import toast from "react-hot-toast";

/**
 * Hook for current challenge status
 */
export function useCurrentChallenge() {
  return useQuery({
    queryKey: ["challenge-current"],
    queryFn: async () => {
      const response = await challengeAPI.getCurrent();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for challenge progress
 */
export function useChallengeProgress() {
  return useQuery({
    queryKey: ["challenge-progress"],
    queryFn: async () => {
      const response = await challengeAPI.getProgress();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to start a new challenge
 */
export function useStartChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await challengeAPI.start();
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("30-Day Challenge started! Good luck! 🔥");
      queryClient.invalidateQueries({ queryKey: ["challenge-current"] });
      queryClient.invalidateQueries({ queryKey: ["challenge-progress"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to start challenge");
    },
  });
}
