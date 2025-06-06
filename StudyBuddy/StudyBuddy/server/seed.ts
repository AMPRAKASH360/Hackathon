import { db } from "./db";
import { users, studyReminders } from "@shared/schema";

async function seedDatabase() {
  try {
    // Create default user
    const [defaultUser] = await db
      .insert(users)
      .values({
        username: "johndoe",
        password: "password",
        displayName: "John Doe",
        streak: 7,
        totalXp: 1247,
      })
      .returning();

    console.log("Created default user:", defaultUser);

    // Create default reminders
    const defaultReminders = [
      {
        userId: defaultUser.id,
        title: "Daily Study Time",
        description: "Time to study!",
        type: "daily",
        time: "09:00",
        frequency: "daily",
        isActive: true,
      },
      {
        userId: defaultUser.id,
        title: "Break Reminder",
        description: "Take a break!",
        type: "break",
        time: null,
        frequency: "every_45_min",
        isActive: true,
      },
      {
        userId: defaultUser.id,
        title: "Weekly Goal Check",
        description: "Review your weekly progress",
        type: "weekly",
        time: "19:00",
        frequency: "weekly",
        isActive: false,
      },
    ];

    const createdReminders = await db
      .insert(studyReminders)
      .values(defaultReminders)
      .returning();

    console.log("Created default reminders:", createdReminders);
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Only seed if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { seedDatabase };