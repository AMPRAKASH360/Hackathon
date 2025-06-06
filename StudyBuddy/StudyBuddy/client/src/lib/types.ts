import { User, StudyGoal, StudyTask, Achievement, StudyReminder } from "@shared/schema";

export interface GoalProgress extends StudyGoal {
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
}

export interface DashboardStats {
  streak: number;
  totalXp: number;
  completedTasks: number;
  totalDailyTasks: number;
  studyTimeToday: number;
}

export interface DashboardData {
  user: User;
  goalProgress: GoalProgress | null;
  todaysTasks: StudyTask[];
  recentAchievements: Achievement[];
  reminders: StudyReminder[];
  stats: DashboardStats;
}
