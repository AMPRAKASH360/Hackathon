import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  streak: integer("streak").notNull().default(0),
  totalXp: integer("total_xp").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const studyGoals = pgTable("study_goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  timeline: text("timeline").notNull(), // "1 week", "1 month", etc.
  dailyStudyTime: text("daily_study_time").notNull(), // "1 hour", "2 hours", etc.
  pace: text("pace").notNull(), // "relaxed", "moderate", "intensive"
  status: text("status").notNull().default("active"), // "active", "completed", "paused"
  progress: integer("progress").notNull().default(0), // percentage 0-100
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const studyTasks = pgTable("study_tasks", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "video", "reading", "quiz", "practice", "project"
  estimatedMinutes: integer("estimated_minutes").notNull(),
  xpReward: integer("xp_reward").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  orderIndex: integer("order_index").notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // "streak", "xp", "tasks", "goals"
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  xpReward: integer("xp_reward").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

export const studyReminders = pgTable("study_reminders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(), // "daily", "break", "weekly"
  time: text("time"), // "09:00", "21:00"
  frequency: text("frequency"), // "daily", "weekly", "every_45_min"
  isActive: boolean("is_active").notNull().default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStudyGoalSchema = createInsertSchema(studyGoals).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertStudyTaskSchema = createInsertSchema(studyTasks).omit({
  id: true,
  completedAt: true,
});

export const insertAchievementSchema = createInsertSchema(achievements).omit({
  id: true,
  unlockedAt: true,
});

export const insertStudyReminderSchema = createInsertSchema(studyReminders).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type StudyGoal = typeof studyGoals.$inferSelect;
export type InsertStudyGoal = z.infer<typeof insertStudyGoalSchema>;

export type StudyTask = typeof studyTasks.$inferSelect;
export type InsertStudyTask = z.infer<typeof insertStudyTaskSchema>;

export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = z.infer<typeof insertAchievementSchema>;

export type StudyReminder = typeof studyReminders.$inferSelect;
export type InsertStudyReminder = z.infer<typeof insertStudyReminderSchema>;
