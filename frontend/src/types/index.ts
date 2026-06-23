// User Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'student' | 'admin';
  university?: string;
  country?: string;
  subscription_plan: 'free' | 'premium';
  subscription_expires_at?: string;
  streak_count: number;
  total_tests_completed: number;
  average_score: number;
  created_at: string;
  updated_at: string;
}

// Subject Types
export interface Subject {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  question_count: number;
  topics: Topic[];
}

export interface Topic {
  id: number;
  subject_id: number;
  name: string;
  slug: string;
  description?: string;
  question_count: number;
  subtopics: Subtopic[];
}

export interface Subtopic {
  id: number;
  topic_id: number;
  name: string;
  slug: string;
  question_count: number;
}

// Question Types
export interface Question {
  id: number;
  subject_id: number;
  topic_id: number;
  subtopic_id?: number;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'clinical_scenario' | 'image_based';
  options: QuestionOption[];
  correct_option: string;
  explanation?: string;
  reference?: string;
  learning_point?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'draft';
}

export interface QuestionOption {
  key: string;
  text: string;
}

// Test Types
export interface Test {
  id: number;
  title: string;
  type: 'daily_morning' | 'daily_evening' | 'practice' | 'grand_mock';
  subject_id?: number;
  topic_id?: number;
  question_count: number;
  duration_minutes: number;
  scheduled_at?: string;
  status: 'upcoming' | 'active' | 'completed';
  questions?: Question[];
}

export interface TestAttempt {
  id: number;
  test_id: number;
  user_id: number;
  score: number;
  total_questions: number;
  correct_answers: number;
  wrong_answers: number;
  skipped: number;
  percentage: number;
  time_taken_seconds: number;
  rank?: number;
  answers: UserAnswer[];
  started_at: string;
  completed_at?: string;
  subject_performance: SubjectPerformance[];
}

export interface UserAnswer {
  question_id: number;
  selected_option?: string;
  is_correct: boolean;
  time_taken_seconds: number;
  is_marked_for_review: boolean;
}

export interface SubjectPerformance {
  subject_id: number;
  subject_name: string;
  total: number;
  correct: number;
  percentage: number;
}

// Analytics Types
export interface Analytics {
  total_tests: number;
  average_score: number;
  total_questions_attempted: number;
  accuracy_rate: number;
  streak_count: number;
  fmge_readiness_score: number;
  weak_subjects: WeakSubject[];
  strong_subjects: WeakSubject[];
  daily_performance: DailyPerformance[];
  subject_performance: SubjectPerformance[];
}

export interface WeakSubject {
  subject_id: number;
  subject_name: string;
  accuracy: number;
  questions_attempted: number;
}

export interface DailyPerformance {
  date: string;
  score: number;
  tests_completed: number;
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  user_name: string;
  avatar?: string;
  score: number;
  tests_completed: number;
  university?: string;
  country?: string;
}

// Challenge Types
export interface Challenge {
  id: number;
  user_id: number;
  day: number;
  total_days: number;
  tests_completed: number;
  pass_percentage: number;
  is_completed: boolean;
  grand_mock_unlocked: boolean;
  started_at: string;
  daily_progress: ChallengeDay[];
}

export interface ChallengeDay {
  day: number;
  date: string;
  test_completed: boolean;
  score?: number;
  passed: boolean;
}

// Subscription Types
export interface Subscription {
  id: number;
  plan: 'free' | 'premium';
  price: number;
  currency: string;
  features: string[];
  is_active: boolean;
  starts_at: string;
  expires_at: string;
}

// Notification Types
export interface Notification {
  id: number;
  title: string;
  body: string;
  type: 'challenge' | 'streak' | 'mock' | 'general';
  is_read: boolean;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
