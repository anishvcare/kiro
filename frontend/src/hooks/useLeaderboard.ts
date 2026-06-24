"use client";

import { useQuery } from "@tanstack/react-query";
import { leaderboardAPI } from "@/lib/api";

/**
 * Hook for global leaderboard
 */
export function useLeaderboard(period: string = "weekly", page: number = 1) {
  return useQuery({
    queryKey: ["leaderboard", period, page],
    queryFn: async () => {
      const response = await leaderboardAPI.getGlobal({ period, page });
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for university leaderboard
 */
export function useUniversityLeaderboard(university: string) {
  return useQuery({
    queryKey: ["leaderboard-university", university],
    queryFn: async () => {
      const response = await leaderboardAPI.getByUniversity(university);
      return response.data.data;
    },
    enabled: !!university,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for country leaderboard
 */
export function useCountryLeaderboard(country: string) {
  return useQuery({
    queryKey: ["leaderboard-country", country],
    queryFn: async () => {
      const response = await leaderboardAPI.getByCountry(country);
      return response.data.data;
    },
    enabled: !!country,
    staleTime: 5 * 60 * 1000,
  });
}
