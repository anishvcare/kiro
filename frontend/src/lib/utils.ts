import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

export function getScoreColor(percentage: number): string {
  if (percentage >= 80) return "text-green-600";
  if (percentage >= 60) return "text-yellow-600";
  return "text-red-600";
}

export function getScoreBg(percentage: number): string {
  if (percentage >= 80) return "bg-green-100 text-green-800";
  if (percentage >= 60) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function calculateFMGEReadiness(
  averageScore: number,
  testsCompleted: number,
  streakCount: number
): number {
  const scoreWeight = averageScore * 0.5;
  const testsWeight = Math.min(testsCompleted / 30, 1) * 30;
  const streakWeight = Math.min(streakCount / 30, 1) * 20;
  return Math.round(scoreWeight + testsWeight + streakWeight);
}
