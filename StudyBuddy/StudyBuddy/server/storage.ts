import { 
  users, studyGoals, studyTasks, achievements, studyReminders,
  type User, type InsertUser,
  type StudyGoal, type InsertStudyGoal,
  type StudyTask, type InsertStudyTask,
  type Achievement, type InsertAchievement,
  type StudyReminder, type InsertStudyReminder
} from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lt } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserStreak(userId: number, streak: number): Promise<void>;
  updateUserXp(userId: number, xp: number): Promise<void>;

  // Study Goals
  getStudyGoal(id: number): Promise<StudyGoal | undefined>;
  getActiveStudyGoalByUser(userId: number): Promise<StudyGoal | undefined>;
  getUserStudyGoals(userId: number): Promise<StudyGoal[]>;
  createStudyGoal(goal: InsertStudyGoal): Promise<StudyGoal>;
  updateStudyGoalProgress(goalId: number, progress: number): Promise<void>;
  completeStudyGoal(goalId: number): Promise<void>;

  // Study Tasks
  getStudyTask(id: number): Promise<StudyTask | undefined>;
  getStudyTasksByGoal(goalId: number): Promise<StudyTask[]>;
  getTodaysTasksByUser(userId: number): Promise<StudyTask[]>;
  createStudyTask(task: InsertStudyTask): Promise<StudyTask>;
  createMultipleStudyTasks(tasks: InsertStudyTask[]): Promise<StudyTask[]>;
  completeStudyTask(taskId: number): Promise<void>;
  updateTaskCompletion(taskId: number, isCompleted: boolean): Promise<void>;

  // Achievements
  getUserAchievements(userId: number): Promise<Achievement[]>;
  getRecentAchievements(userId: number, limit: number): Promise<Achievement[]>;
  createAchievement(achievement: InsertAchievement): Promise<Achievement>;

  // Study Reminders
  getUserReminders(userId: number): Promise<StudyReminder[]>;
  createStudyReminder(reminder: InsertStudyReminder): Promise<StudyReminder>;
  updateReminderStatus(reminderId: number, isActive: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private studyGoals: Map<number, StudyGoal> = new Map();
  private studyTasks: Map<number, StudyTask> = new Map();
  private achievements: Map<number, Achievement> = new Map();
  private studyReminders: Map<number, StudyReminder> = new Map();
  
  private currentUserId = 1;
  private currentGoalId = 1;
  private currentTaskId = 1;
  private currentAchievementId = 1;
  private currentReminderId = 1;

  constructor() {
    // Create a default user for demo purposes
    const defaultUser: User = {
      id: 1,
      username: "johndoe",
      password: "password",
      displayName: "John Doe",
      streak: 7,
      totalXp: 1247,
      createdAt: new Date(),
    };
    this.users.set(1, defaultUser);
    this.currentUserId = 2;

    // Create default reminders
    const defaultReminders: StudyReminder[] = [
      {
        id: 1,
        userId: 1,
        title: "Daily Study Time",
        description: "Time to study!",
        type: "daily",
        time: "09:00",
        frequency: "daily",
        isActive: true,
      },
      {
        id: 2,
        userId: 1,
        title: "Break Reminder",
        description: "Take a break!",
        type: "break",
        time: "",
        frequency: "every_45_min",
        isActive: true,
      },
      {
        id: 3,
        userId: 1,
        title: "Weekly Goal Check",
        description: "Review your weekly progress",
        type: "weekly",
        time: "19:00",
        frequency: "weekly",
        isActive: false,
      },
    ];

    defaultReminders.forEach(reminder => {
      this.studyReminders.set(reminder.id, reminder);
    });
    this.currentReminderId = 4;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      streak: 0,
      totalXp: 0,
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStreak(userId: number, streak: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, streak });
    }
  }

  async updateUserXp(userId: number, xp: number): Promise<void> {
    const user = this.users.get(userId);
    if (user) {
      this.users.set(userId, { ...user, totalXp: user.totalXp + xp });
    }
  }

  // Study Goals
  async getStudyGoal(id: number): Promise<StudyGoal | undefined> {
    return this.studyGoals.get(id);
  }

  async getActiveStudyGoalByUser(userId: number): Promise<StudyGoal | undefined> {
    return Array.from(this.studyGoals.values()).find(
      goal => goal.userId === userId && goal.status === "active"
    );
  }

  async getUserStudyGoals(userId: number): Promise<StudyGoal[]> {
    return Array.from(this.studyGoals.values()).filter(goal => goal.userId === userId);
  }

  async createStudyGoal(insertGoal: InsertStudyGoal): Promise<StudyGoal> {
    const id = this.currentGoalId++;
    const goal: StudyGoal = { 
      ...insertGoal, 
      id, 
      progress: 0,
      status: "active",
      createdAt: new Date(),
      completedAt: null,
      description: insertGoal.description || null
    };
    this.studyGoals.set(id, goal);
    return goal;
  }

  async updateStudyGoalProgress(goalId: number, progress: number): Promise<void> {
    const goal = this.studyGoals.get(goalId);
    if (goal) {
      this.studyGoals.set(goalId, { ...goal, progress });
    }
  }

  async completeStudyGoal(goalId: number): Promise<void> {
    const goal = this.studyGoals.get(goalId);
    if (goal) {
      this.studyGoals.set(goalId, { 
        ...goal, 
        status: "completed", 
        progress: 100,
        completedAt: new Date() 
      });
    }
  }

  // Study Tasks
  async getStudyTask(id: number): Promise<StudyTask | undefined> {
    return this.studyTasks.get(id);
  }

  async getStudyTasksByGoal(goalId: number): Promise<StudyTask[]> {
    return Array.from(this.studyTasks.values())
      .filter(task => task.goalId === goalId)
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async getTodaysTasksByUser(userId: number): Promise<StudyTask[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userGoals = Array.from(this.studyGoals.values()).filter(goal => goal.userId === userId);
    const goalIds = userGoals.map(goal => goal.id);

    return Array.from(this.studyTasks.values())
      .filter(task => 
        goalIds.includes(task.goalId) &&
        task.scheduledFor &&
        task.scheduledFor >= today &&
        task.scheduledFor < tomorrow
      )
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }

  async createStudyTask(insertTask: InsertStudyTask): Promise<StudyTask> {
    const id = this.currentTaskId++;
    const task: StudyTask = { 
      ...insertTask, 
      id, 
      isCompleted: false,
      completedAt: null,
      description: insertTask.description || null,
      scheduledFor: insertTask.scheduledFor || null
    };
    this.studyTasks.set(id, task);
    return task;
  }

  async createMultipleStudyTasks(tasks: InsertStudyTask[]): Promise<StudyTask[]> {
    const createdTasks: StudyTask[] = [];
    for (const insertTask of tasks) {
      const task = await this.createStudyTask(insertTask);
      createdTasks.push(task);
    }
    return createdTasks;
  }

  async completeStudyTask(taskId: number): Promise<void> {
    const task = this.studyTasks.get(taskId);
    if (task) {
      this.studyTasks.set(taskId, { 
        ...task, 
        isCompleted: true, 
        completedAt: new Date() 
      });
    }
  }

  async updateTaskCompletion(taskId: number, isCompleted: boolean): Promise<void> {
    const task = this.studyTasks.get(taskId);
    if (task) {
      this.studyTasks.set(taskId, { 
        ...task, 
        isCompleted, 
        completedAt: isCompleted ? new Date() : null 
      });
    }
  }

  // Achievements
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return Array.from(this.achievements.values())
      .filter(achievement => achievement.userId === userId)
      .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime());
  }

  async getRecentAchievements(userId: number, limit: number): Promise<Achievement[]> {
    const userAchievements = await this.getUserAchievements(userId);
    return userAchievements.slice(0, limit);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const id = this.currentAchievementId++;
    const achievement: Achievement = { 
      ...insertAchievement, 
      id, 
      unlockedAt: new Date() 
    };
    this.achievements.set(id, achievement);
    return achievement;
  }

  // Study Reminders
  async getUserReminders(userId: number): Promise<StudyReminder[]> {
    return Array.from(this.studyReminders.values()).filter(reminder => reminder.userId === userId);
  }

  async createStudyReminder(insertReminder: InsertStudyReminder): Promise<StudyReminder> {
    const id = this.currentReminderId++;
    const reminder: StudyReminder = { 
      ...insertReminder, 
      id,
      description: insertReminder.description || null,
      time: insertReminder.time || null,
      frequency: insertReminder.frequency || null,
      isActive: insertReminder.isActive !== undefined ? insertReminder.isActive : true
    };
    this.studyReminders.set(id, reminder);
    return reminder;
  }

  async updateReminderStatus(reminderId: number, isActive: boolean): Promise<void> {
    const reminder = this.studyReminders.get(reminderId);
    if (reminder) {
      this.studyReminders.set(reminderId, { ...reminder, isActive });
    }
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserStreak(userId: number, streak: number): Promise<void> {
    await db
      .update(users)
      .set({ streak })
      .where(eq(users.id, userId));
  }

  async updateUserXp(userId: number, xp: number): Promise<void> {
    await db
      .update(users)
      .set({ totalXp: xp })
      .where(eq(users.id, userId));
  }

  // Study Goals
  async getStudyGoal(id: number): Promise<StudyGoal | undefined> {
    const [goal] = await db.select().from(studyGoals).where(eq(studyGoals.id, id));
    return goal || undefined;
  }

  async getActiveStudyGoalByUser(userId: number): Promise<StudyGoal | undefined> {
    const [goal] = await db
      .select()
      .from(studyGoals)
      .where(and(eq(studyGoals.userId, userId), eq(studyGoals.status, "active")))
      .limit(1);
    return goal || undefined;
  }

  async getUserStudyGoals(userId: number): Promise<StudyGoal[]> {
    return await db
      .select()
      .from(studyGoals)
      .where(eq(studyGoals.userId, userId));
  }

  async createStudyGoal(insertGoal: InsertStudyGoal): Promise<StudyGoal> {
    const [goal] = await db
      .insert(studyGoals)
      .values(insertGoal)
      .returning();
    return goal;
  }

  async updateStudyGoalProgress(goalId: number, progress: number): Promise<void> {
    await db
      .update(studyGoals)
      .set({ progress })
      .where(eq(studyGoals.id, goalId));
  }

  async completeStudyGoal(goalId: number): Promise<void> {
    await db
      .update(studyGoals)
      .set({ 
        status: "completed", 
        progress: 100,
        completedAt: new Date() 
      })
      .where(eq(studyGoals.id, goalId));
  }

  // Study Tasks
  async getStudyTask(id: number): Promise<StudyTask | undefined> {
    const [task] = await db.select().from(studyTasks).where(eq(studyTasks.id, id));
    return task || undefined;
  }

  async getStudyTasksByGoal(goalId: number): Promise<StudyTask[]> {
    return await db
      .select()
      .from(studyTasks)
      .where(eq(studyTasks.goalId, goalId))
      .orderBy(studyTasks.orderIndex);
  }

  async getTodaysTasksByUser(userId: number): Promise<StudyTask[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const userGoals = await db
      .select({ id: studyGoals.id })
      .from(studyGoals)
      .where(eq(studyGoals.userId, userId));
    
    const goalIds = userGoals.map(goal => goal.id);

    if (goalIds.length === 0) return [];

    return await db
      .select()
      .from(studyTasks)
      .where(
        and(
          eq(studyTasks.goalId, goalIds[0]), // Simplified for demo
          gte(studyTasks.scheduledFor, today),
          lt(studyTasks.scheduledFor, tomorrow)
        )
      )
      .orderBy(studyTasks.orderIndex);
  }

  async createStudyTask(insertTask: InsertStudyTask): Promise<StudyTask> {
    const [task] = await db
      .insert(studyTasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async createMultipleStudyTasks(tasks: InsertStudyTask[]): Promise<StudyTask[]> {
    if (tasks.length === 0) return [];
    
    const createdTasks = await db
      .insert(studyTasks)
      .values(tasks)
      .returning();
    return createdTasks;
  }

  async completeStudyTask(taskId: number): Promise<void> {
    await db
      .update(studyTasks)
      .set({ 
        isCompleted: true, 
        completedAt: new Date() 
      })
      .where(eq(studyTasks.id, taskId));
  }

  async updateTaskCompletion(taskId: number, isCompleted: boolean): Promise<void> {
    await db
      .update(studyTasks)
      .set({ 
        isCompleted, 
        completedAt: isCompleted ? new Date() : null 
      })
      .where(eq(studyTasks.id, taskId));
  }

  // Achievements
  async getUserAchievements(userId: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(achievements.unlockedAt);
  }

  async getRecentAchievements(userId: number, limit: number): Promise<Achievement[]> {
    return await db
      .select()
      .from(achievements)
      .where(eq(achievements.userId, userId))
      .orderBy(achievements.unlockedAt)
      .limit(limit);
  }

  async createAchievement(insertAchievement: InsertAchievement): Promise<Achievement> {
    const [achievement] = await db
      .insert(achievements)
      .values(insertAchievement)
      .returning();
    return achievement;
  }

  // Study Reminders
  async getUserReminders(userId: number): Promise<StudyReminder[]> {
    return await db
      .select()
      .from(studyReminders)
      .where(eq(studyReminders.userId, userId));
  }

  async createStudyReminder(insertReminder: InsertStudyReminder): Promise<StudyReminder> {
    const [reminder] = await db
      .insert(studyReminders)
      .values(insertReminder)
      .returning();
    return reminder;
  }

  async updateReminderStatus(reminderId: number, isActive: boolean): Promise<void> {
    await db
      .update(studyReminders)
      .set({ isActive })
      .where(eq(studyReminders.id, reminderId));
  }
}

export const storage = new DatabaseStorage();
