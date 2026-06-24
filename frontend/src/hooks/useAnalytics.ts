"use client";

import { useQuery } from "@tanstack/react-query";
import { analyticsAPI, dashboardAPI } from "@/lib/api";

/**
 * Hook for dashboard stats
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await dashboardAPI.getStats();
      return response.data.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook for today's tests
 */
export function useTodayTests() {
  return useQuery({
    queryKey: ["today-tests"],
    queryFn: async () => {
      const response = await dashboardAPI.getTodayTests();
      return response.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook for analytics overview
 */
export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["analytics-overview"],
    queryFn: async () => {
      const response = await analyticsAPI.getOverview();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for subject performance
 */
export function useSubjectPerformance() {
  return useQuery({
    queryKey: ["subject-performance"],
    queryFn: async () => {
      const response = await analyticsAPI.getSubjectPerformance();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for weakness analysis
 */
export function useWeaknessAnalysis() {
  return useQuery({
    queryKey: ["weakness-analysis"],
    queryFn: async () => {
      const response = await analyticsAPI.getWeaknesses();
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for daily progress chart data
 */
export function useDailyProgress(days: number = 30) {
  return useQuery({
    queryKey: ["daily-progress", days],
    queryFn: async () => {
      const response = await analyticsAPI.getDailyProgress(days);
      return response.data.data;
    },
    staleTime: 10 * 60 * 1000,
  });
}
