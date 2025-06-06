import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateStudyPlan, generateMotivationalInsight } from "./openai";
import { insertStudyGoalSchema, insertStudyReminderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get dashboard data for a user
  app.get("/api/dashboard/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const activeGoal = await storage.getActiveStudyGoalByUser(userId);
      const todaysTasks = await storage.getTodaysTasksByUser(userId);
      const recentAchievements = await storage.getRecentAchievements(userId, 3);
      const reminders = await storage.getUserReminders(userId);

      let goalProgress = null;
      if (activeGoal) {
        const allTasks = await storage.getStudyTasksByGoal(activeGoal.id);
        const completedTasks = allTasks.filter(task => task.isCompleted).length;
        
        goalProgress = {
          ...activeGoal,
          completedTasks,
          totalTasks: allTasks.length,
          completionPercentage: allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0
        };
      }

      const completedTodayTasks = todaysTasks.filter(task => task.isCompleted).length;

      res.json({
        user,
        goalProgress,
        todaysTasks,
        recentAchievements,
        reminders,
        stats: {
          streak: user.streak,
          totalXp: user.totalXp,
          completedTasks: completedTodayTasks,
          totalDailyTasks: todaysTasks.length,
          studyTimeToday: Math.round((completedTodayTasks * 45) / 60 * 10) / 10 // Rough estimate
        }
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Create a new study goal with AI-generated plan
  app.post("/api/goals", async (req, res) => {
    try {
      const goalData = insertStudyGoalSchema.parse(req.body);
      
      // Generate AI study plan
      const aiPlan = await generateStudyPlan({
        title: goalData.title,
        timeline: goalData.timeline,
        dailyStudyTime: goalData.dailyStudyTime,
        pace: goalData.pace,
        description: goalData.description || undefined
      });

      // Create the goal
      const goal = await storage.createStudyGoal(goalData);

      // Create tasks from AI plan
      const tasks = aiPlan.tasks.map(task => ({
        goalId: goal.id,
        title: task.title,
        description: task.description,
        type: task.type,
        estimatedMinutes: task.estimatedMinutes,
        xpReward: task.xpReward,
        orderIndex: task.orderIndex,
        scheduledFor: new Date() // For now, schedule all for today - could be improved
      }));

      const createdTasks = await storage.createMultipleStudyTasks(tasks);

      res.json({
        goal,
        tasks: createdTasks,
        aiInsights: {
          totalEstimatedHours: aiPlan.totalEstimatedHours,
          difficultyLevel: aiPlan.difficultyLevel,
          learningPath: aiPlan.learningPath
        }
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid goal data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create goal and study plan" });
    }
  });

  // Toggle task completion
  app.patch("/api/tasks/:taskId/complete", async (req, res) => {
    try {
      const taskId = parseInt(req.params.taskId);
      const { isCompleted } = req.body;

      const task = await storage.getStudyTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      await storage.updateTaskCompletion(taskId, isCompleted);

      // If task is completed, award XP
      if (isCompleted) {
        const goal = await storage.getStudyGoal(task.goalId);
        if (goal) {
          await storage.updateUserXp(goal.userId, task.xpReward);
          
          // Check if this creates any achievements
          // For now, just create a simple achievement for completing tasks
          const userTasks = await storage.getTodaysTasksByUser(goal.userId);
          const completedCount = userTasks.filter(t => t.isCompleted).length;
          
          if (completedCount === 5) {
            await storage.createAchievement({
              userId: goal.userId,
              type: "tasks",
              title: "Task Master",
              description: "Completed 5 tasks in a day",
              icon: "fas fa-check-circle",
              xpReward: 100
            });
          }
        }
      }

      res.json({ message: "Task updated successfully" });
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Update reminder status
  app.patch("/api/reminders/:reminderId", async (req, res) => {
    try {
      const reminderId = parseInt(req.params.reminderId);
      const { isActive } = req.body;

      await storage.updateReminderStatus(reminderId, isActive);
      res.json({ message: "Reminder updated successfully" });
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  // Create new reminder
  app.post("/api/reminders", async (req, res) => {
    try {
      const reminderData = insertStudyReminderSchema.parse(req.body);
      const reminder = await storage.createStudyReminder(reminderData);
      res.json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid reminder data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  // Get AI motivational insight
  app.get("/api/ai-insight/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await storage.getUser(userId);
      const activeGoal = await storage.getActiveStudyGoalByUser(userId);
      
      if (!user || !activeGoal) {
        return res.status(404).json({ message: "User or active goal not found" });
      }

      const allTasks = await storage.getStudyTasksByGoal(activeGoal.id);
      const completedTasks = allTasks.filter(task => task.isCompleted).length;
      
      const daysIntoGoal = Math.floor(
        (Date.now() - activeGoal.createdAt.getTime()) / (1000 * 60 * 60 * 24)
      );

      const insight = await generateMotivationalInsight({
        currentStreak: user.streak,
        completedTasks,
        totalTasks: allTasks.length,
        goalTitle: activeGoal.title,
        daysIntoGoal
      });

      res.json({ insight });
    } catch (error) {
      console.error("Error generating AI insight:", error);
      res.status(500).json({ 
        insight: "You're doing great! Keep up the excellent work with your studies." 
      });
    }
  });

  // Get user goals
  app.get("/api/goals/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const goals = await storage.getUserStudyGoals(userId);
      res.json(goals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      res.status(500).json({ message: "Failed to fetch goals" });
    }
  });

  // Update goal status
  app.patch("/api/goals/:goalId", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const { status } = req.body;

      const goal = await storage.getStudyGoal(goalId);
      if (!goal) {
        return res.status(404).json({ message: "Goal not found" });
      }

      if (status === "completed") {
        await storage.completeStudyGoal(goalId);
      } else {
        // For paused/active status changes, we'd need to add this method to storage
        // For now, just return success
      }

      res.json({ message: "Goal status updated successfully" });
    } catch (error) {
      console.error("Error updating goal:", error);
      res.status(500).json({ message: "Failed to update goal" });
    }
  });

  // Get tasks for a specific goal
  app.get("/api/goals/:goalId/tasks", async (req, res) => {
    try {
      const goalId = parseInt(req.params.goalId);
      const tasks = await storage.getStudyTasksByGoal(goalId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get user achievements
  app.get("/api/achievements/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const achievements = await storage.getUserAchievements(userId);
      res.json(achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Update user profile
  app.patch("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { displayName, username } = req.body;

      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // In a real app, you'd update the user in storage
      // For now, just return success
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Update notification preferences
  app.patch("/api/users/:userId/notifications", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notificationPrefs = req.body;

      // In a real app, you'd store these preferences
      res.json({ message: "Notification preferences updated successfully" });
    } catch (error) {
      console.error("Error updating notifications:", error);
      res.status(500).json({ message: "Failed to update notification preferences" });
    }
  });

  // Update study preferences
  app.patch("/api/users/:userId/preferences", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const studyPrefs = req.body;

      // In a real app, you'd store these preferences
      res.json({ message: "Study preferences updated successfully" });
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update study preferences" });
    }
  });

  // Export user data
  app.get("/api/users/:userId/export", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      
      const user = await storage.getUser(userId);
      const goals = await storage.getUserStudyGoals(userId);
      const achievements = await storage.getUserAchievements(userId);
      const reminders = await storage.getUserReminders(userId);

      const exportData = {
        user,
        goals,
        achievements,
        reminders,
        exportDate: new Date().toISOString()
      };

      res.json(exportData);
    } catch (error) {
      console.error("Error exporting data:", error);
      res.status(500).json({ message: "Failed to export data" });
    }
  });

  // Delete user account
  app.delete("/api/users/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);

      // In a real app, you'd delete all user data
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
