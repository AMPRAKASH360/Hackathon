import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || ""
});

export interface StudyPlanRequest {
  title: string;
  timeline: string;
  dailyStudyTime: string;
  pace: string;
  description?: string;
}

export interface GeneratedTask {
  title: string;
  description: string;
  type: "video" | "reading" | "quiz" | "practice" | "project";
  estimatedMinutes: number;
  xpReward: number;
  orderIndex: number;
}

export interface StudyPlanResponse {
  tasks: GeneratedTask[];
  totalEstimatedHours: number;
  difficultyLevel: string;
  learningPath: string[];
}

export async function generateStudyPlan(request: StudyPlanRequest): Promise<StudyPlanResponse> {
  try {
    const prompt = `Create a detailed, personalized study plan for learning "${request.title}" with the following requirements:

Timeline: ${request.timeline}
Daily Study Time: ${request.dailyStudyTime}
Learning Pace: ${request.pace}
Additional Details: ${request.description || "None provided"}

Please generate a comprehensive study plan that includes:
1. A series of specific tasks (videos to watch, readings, quizzes, practice exercises, projects)
2. Each task should have a clear title, description, type, estimated time in minutes, and XP reward
3. Tasks should be ordered logically from beginner to advanced
4. The plan should realistically fit within the specified timeline and daily study time
5. Include a mix of different learning activities (videos, reading, hands-on practice, assessments)

Respond with a JSON object in this exact format:
{
  "tasks": [
    {
      "title": "Task title",
      "description": "Detailed description of what the learner will do",
      "type": "video|reading|quiz|practice|project",
      "estimatedMinutes": number,
      "xpReward": number,
      "orderIndex": number
    }
  ],
  "totalEstimatedHours": number,
  "difficultyLevel": "Beginner|Intermediate|Advanced",
  "learningPath": ["Phase 1 description", "Phase 2 description", "etc"]
}

Make sure the XP rewards are balanced (videos: 30-50, reading: 40-60, quizzes: 50-75, practice: 60-100, projects: 100-200) and the total time aligns with the specified constraints.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert educational curriculum designer who creates personalized, effective study plans. Always respond with valid JSON format."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    // Validate the response structure
    if (!result.tasks || !Array.isArray(result.tasks)) {
      throw new Error("Invalid response format: missing tasks array");
    }

    return {
      tasks: result.tasks.map((task: any, index: number) => ({
        title: task.title || `Task ${index + 1}`,
        description: task.description || "",
        type: task.type || "reading",
        estimatedMinutes: task.estimatedMinutes || 30,
        xpReward: task.xpReward || 50,
        orderIndex: task.orderIndex || index
      })),
      totalEstimatedHours: result.totalEstimatedHours || 0,
      difficultyLevel: result.difficultyLevel || "Beginner",
      learningPath: result.learningPath || []
    };

  } catch (error) {
    console.error("Failed to generate study plan:", error);
    throw new Error("Failed to generate study plan: " + (error as Error).message);
  }
}

export async function generateMotivationalInsight(userProgress: {
  currentStreak: number;
  completedTasks: number;
  totalTasks: number;
  goalTitle: string;
  daysIntoGoal: number;
}): Promise<string> {
  try {
    const prompt = `Generate a personalized, motivational insight for a student with the following progress:

- Current study streak: ${userProgress.currentStreak} days
- Completed tasks: ${userProgress.completedTasks} out of ${userProgress.totalTasks}
- Current goal: ${userProgress.goalTitle}
- Days into their learning journey: ${userProgress.daysIntoGoal}

Create a brief, encouraging message (2-3 sentences) that:
1. Acknowledges their progress
2. Provides specific motivation based on their stats
3. Gives a helpful tip or suggestion for continued success

Keep it personal, positive, and actionable. Respond with just the motivational text, no JSON formatting.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a supportive and knowledgeable learning coach who provides personalized motivation and guidance to students."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.8,
      max_tokens: 150
    });

    return response.choices[0].message.content || "Great job on your learning journey! Keep up the excellent work.";

  } catch (error) {
    console.error("Failed to generate motivational insight:", error);
    return "You're making excellent progress! Stay consistent with your daily studies and you'll achieve your goals.";
  }
}
