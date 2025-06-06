import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Star, Flame, Target, BookOpen, Clock, CheckCircle, Award, Lock, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDashboardData } from "@/hooks/use-dashboard-data";

interface AchievementCategory {
  id: string;
  name: string;
  icon: any;
  color: string;
  description: string;
}

const categories: AchievementCategory[] = [
  {
    id: "streak",
    name: "Consistency",
    icon: Flame,
    color: "amber",
    description: "Maintain study streaks and daily habits"
  },
  {
    id: "xp",
    name: "Experience",
    icon: Star,
    color: "purple", 
    description: "Earn XP through learning activities"
  },
  {
    id: "tasks",
    name: "Task Master",
    icon: CheckCircle,
    color: "emerald",
    description: "Complete study tasks and challenges"
  },
  {
    id: "goals",
    name: "Goal Achiever",
    icon: Target,
    color: "blue",
    description: "Reach learning milestones and goals"
  }
];

const availableAchievements = [
  // Streak Achievements
  { id: 1, type: "streak", title: "Getting Started", description: "Complete your first day of study", requirement: 1, icon: "fas fa-play-circle", xpReward: 50 },
  { id: 2, type: "streak", title: "On Fire", description: "Maintain a 3-day study streak", requirement: 3, icon: "fas fa-fire", xpReward: 100 },
  { id: 3, type: "streak", title: "Consistent Learner", description: "Maintain a 7-day study streak", requirement: 7, icon: "fas fa-calendar-check", xpReward: 200 },
  { id: 4, type: "streak", title: "Dedication Master", description: "Maintain a 30-day study streak", requirement: 30, icon: "fas fa-medal", xpReward: 500 },

  // XP Achievements
  { id: 5, type: "xp", title: "First Steps", description: "Earn your first 100 XP", requirement: 100, icon: "fas fa-star", xpReward: 25 },
  { id: 6, type: "xp", title: "Knowledge Seeker", description: "Earn 500 XP", requirement: 500, icon: "fas fa-graduation-cap", xpReward: 75 },
  { id: 7, type: "xp", title: "Learning Machine", description: "Earn 1000 XP", requirement: 1000, icon: "fas fa-rocket", xpReward: 150 },
  { id: 8, type: "xp", title: "XP Master", description: "Earn 5000 XP", requirement: 5000, icon: "fas fa-crown", xpReward: 300 },

  // Task Achievements
  { id: 9, type: "tasks", title: "Task Starter", description: "Complete your first task", requirement: 1, icon: "fas fa-check", xpReward: 30 },
  { id: 10, type: "tasks", title: "Productive Day", description: "Complete 5 tasks in one day", requirement: 5, icon: "fas fa-check-double", xpReward: 100 },
  { id: 11, type: "tasks", title: "Task Crusher", description: "Complete 25 tasks total", requirement: 25, icon: "fas fa-trophy", xpReward: 250 },
  { id: 12, type: "tasks", title: "Completion Expert", description: "Complete 100 tasks total", requirement: 100, icon: "fas fa-gem", xpReward: 500 },

  // Goal Achievements
  { id: 13, type: "goals", title: "Goal Setter", description: "Create your first study goal", requirement: 1, icon: "fas fa-bullseye", xpReward: 50 },
  { id: 14, type: "goals", title: "Goal Achiever", description: "Complete your first study goal", requirement: 1, icon: "fas fa-flag-checkered", xpReward: 200 },
  { id: 15, type: "goals", title: "Multi-Achiever", description: "Complete 3 study goals", requirement: 3, icon: "fas fa-mountain", xpReward: 400 },
  { id: 16, type: "goals", title: "Learning Champion", description: "Complete 10 study goals", requirement: 10, icon: "fas fa-crown", xpReward: 1000 }
];

export default function Achievements() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { data: dashboardData } = useDashboardData(1);

  const { data: userAchievements } = useQuery<Achievement[]>({
    queryKey: ['/api/achievements/1'],
  });

  const unlockedAchievements = userAchievements || [];
  const unlockedIds = new Set(unlockedAchievements.map(a => a.title));

  // Calculate user progress for achievements
  const userStats = dashboardData ? {
    streak: dashboardData.stats.streak,
    totalXp: dashboardData.stats.totalXp,
    totalTasks: 15, // Mock data - in real app this would come from backend
    completedGoals: 1 // Mock data
  } : {
    streak: 0,
    totalXp: 0,
    totalTasks: 0,
    completedGoals: 0
  };

  const getAchievementProgress = (achievement: any) => {
    let current = 0;
    switch (achievement.type) {
      case "streak":
        current = userStats.streak;
        break;
      case "xp":
        current = userStats.totalXp;
        break;
      case "tasks":
        current = userStats.totalTasks;
        break;
      case "goals":
        current = userStats.completedGoals;
        break;
    }
    return Math.min(100, (current / achievement.requirement) * 100);
  };

  const isUnlocked = (achievement: any) => {
    return unlockedIds.has(achievement.title) || getAchievementProgress(achievement) >= 100;
  };

  const filteredAchievements = selectedCategory === "all" 
    ? availableAchievements
    : availableAchievements.filter(a => a.type === selectedCategory);

  const getColorClasses = (color: string) => {
    const colors = {
      amber: "from-amber-100 to-amber-50 border-amber-200",
      purple: "from-purple-100 to-purple-50 border-purple-200", 
      emerald: "from-emerald-100 to-emerald-50 border-emerald-200",
      blue: "from-blue-100 to-blue-50 border-blue-200"
    };
    return colors[color as keyof typeof colors] || colors.amber;
  };

  const getIconBgColor = (color: string) => {
    const colors = {
      amber: "bg-amber-500",
      purple: "bg-purple-500",
      emerald: "bg-emerald-500", 
      blue: "bg-blue-500"
    };
    return colors[color as keyof typeof colors] || colors.amber;
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Achievements</h1>
          <p className="text-neutral-600">Track your learning milestones and unlock rewards</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Trophy className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">{unlockedAchievements.length}</p>
              <p className="text-sm text-neutral-600">Unlocked</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="h-6 w-6 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">
                {unlockedAchievements.reduce((sum, a) => sum + a.xpReward, 0)}
              </p>
              <p className="text-sm text-neutral-600">XP Earned</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">
                {Math.round((unlockedAchievements.length / availableAchievements.length) * 100)}%
              </p>
              <p className="text-sm text-neutral-600">Completion</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-neutral-800">
                {availableAchievements.length - unlockedAchievements.length}
              </p>
              <p className="text-sm text-neutral-600">Remaining</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Categories</h3>
            
            <button
              onClick={() => setSelectedCategory("all")}
              className={`w-full text-left p-4 rounded-lg border transition-colors ${
                selectedCategory === "all"
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-neutral-200 hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center">
                  <Trophy className="h-5 w-5 text-neutral-600" />
                </div>
                <div>
                  <p className="font-medium">All Achievements</p>
                  <p className="text-sm text-neutral-500">{availableAchievements.length} total</p>
                </div>
              </div>
            </button>

            {categories.map((category) => {
              const Icon = category.icon;
              const categoryCount = availableAchievements.filter(a => a.type === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    selectedCategory === category.id
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-neutral-200 hover:bg-neutral-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${getIconBgColor(category.color)} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-neutral-500">{categoryCount} achievements</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Achievements Grid */}
          <div className="lg:col-span-3">
            {selectedCategory !== "all" && (
              <div className="mb-6">
                {(() => {
                  const category = categories.find(c => c.id === selectedCategory);
                  return category ? (
                    <div className="bg-white rounded-lg p-6 border">
                      <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 ${getIconBgColor(category.color)} rounded-lg flex items-center justify-center`}>
                          <category.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-neutral-800">{category.name}</h2>
                          <p className="text-neutral-600">{category.description}</p>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAchievements.map((achievement) => {
                const unlocked = isUnlocked(achievement);
                const progress = getAchievementProgress(achievement);
                const category = categories.find(c => c.id === achievement.type);
                
                return (
                  <Card
                    key={achievement.id}
                    className={`transition-all duration-200 ${
                      unlocked
                        ? `bg-gradient-to-r ${getColorClasses(category?.color || 'amber')} border`
                        : "border-neutral-200 bg-neutral-50"
                    }`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                            unlocked 
                              ? getIconBgColor(category?.color || 'amber')
                              : "bg-neutral-300"
                          }`}>
                            {unlocked ? (
                              <i className={`${achievement.icon} text-white text-lg`} />
                            ) : (
                              <Lock className="h-5 w-5 text-neutral-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className={`font-semibold ${unlocked ? "text-neutral-800" : "text-neutral-500"}`}>
                              {achievement.title}
                            </h3>
                            <p className={`text-sm ${unlocked ? "text-neutral-600" : "text-neutral-400"}`}>
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        <Badge 
                          variant={unlocked ? "secondary" : "outline"}
                          className={unlocked ? "bg-white/80" : ""}
                        >
                          +{achievement.xpReward} XP
                        </Badge>
                      </div>

                      {!unlocked && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">Progress</span>
                            <span className="font-medium">{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <p className="text-xs text-neutral-500">
                            {(() => {
                              let current = 0;
                              switch (achievement.type) {
                                case "streak": current = userStats.streak; break;
                                case "xp": current = userStats.totalXp; break;
                                case "tasks": current = userStats.totalTasks; break;
                                case "goals": current = userStats.completedGoals; break;
                              }
                              return `${current} / ${achievement.requirement}`;
                            })()}
                          </p>
                        </div>
                      )}

                      {unlocked && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-emerald-600 font-medium flex items-center">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Unlocked
                          </span>
                          {(() => {
                            const userAchievement = unlockedAchievements.find(a => a.title === achievement.title);
                            return userAchievement ? (
                              <span className="text-neutral-500">
                                {formatDistanceToNow(userAchievement.unlockedAt, { addSuffix: true })}
                              </span>
                            ) : null;
                          })()}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}