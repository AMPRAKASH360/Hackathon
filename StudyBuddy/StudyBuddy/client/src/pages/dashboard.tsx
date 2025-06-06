import { useState } from "react";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import Sidebar from "@/components/sidebar";
import GoalCreationModal from "@/components/goal-creation-modal";
import TaskItem from "@/components/task-item";
import AchievementCard from "@/components/achievement-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Bell, Plus, Menu, Star, Clock, CheckCircle, Flame, Bot, TrendingUp, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { data, isLoading, refetch } = useDashboardData(1); // Using user ID 1 for demo
  const { toast } = useToast();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your study progress...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Failed to load dashboard data</p>
          <Button onClick={() => refetch()} className="mt-4">Try Again</Button>
        </div>
      </div>
    );
  }

  const handleTaskComplete = async () => {
    toast({
      title: "Great job! 🎉",
      description: `You earned ${50} XP for completing that task!`,
    });
    refetch();
  };

  const handleGoalCreated = () => {
    setIsModalOpen(false);
    toast({
      title: "Study plan created! ✨",
      description: "Your AI-generated study plan is ready. Let's start learning!",
    });
    refetch();
  };

  return (
    <div className="min-h-screen flex bg-neutral-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        user={data.user}
      />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-neutral-800">
                  Good morning, {data.user.displayName.split(' ')[0]}! 👋
                </h2>
                <p className="text-neutral-600">
                  {data.goalProgress ? 
                    `Ready to continue your ${data.goalProgress.title.toLowerCase()} journey?` :
                    "Ready to start your learning journey?"
                  }
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New Goal
              </Button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6 space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-medium">Current Streak</p>
                    <p className="text-2xl font-bold text-neutral-800 mt-1">
                      {data.stats.streak} days
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center">
                    <Flame className="text-amber-500 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-medium">Total XP</p>
                    <p className="text-2xl font-bold text-neutral-800 mt-1">
                      {data.stats.totalXp.toLocaleString()}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Star className="text-primary text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-medium">Tasks Completed</p>
                    <p className="text-2xl font-bold text-neutral-800 mt-1">
                      {data.stats.completedTasks}/{data.stats.totalDailyTasks}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <CheckCircle className="text-emerald-500 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 font-medium">Study Time</p>
                    <p className="text-2xl font-bold text-neutral-800 mt-1">
                      {data.stats.studyTimeToday}h
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-neutral-600 text-xl" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Goal Progress */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Current Goal Progress</CardTitle>
                    {data.goalProgress && (
                      <Button variant="outline" size="sm">
                        Edit Goal
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {data.goalProgress ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-neutral-800">
                            {data.goalProgress.title}
                          </h4>
                          <span className="text-sm text-neutral-600">
                            {data.goalProgress.completionPercentage}% Complete
                          </span>
                        </div>
                        <Progress value={data.goalProgress.completionPercentage} className="h-3" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-neutral-50 rounded-lg">
                          <div className="text-2xl font-bold text-neutral-800">7</div>
                          <div className="text-sm text-neutral-600">Days Left</div>
                        </div>
                        <div className="text-center p-4 bg-neutral-50 rounded-lg">
                          <div className="text-2xl font-bold text-emerald-500">
                            {data.goalProgress.completedTasks}
                          </div>
                          <div className="text-sm text-neutral-600">Tasks Done</div>
                        </div>
                        <div className="text-center p-4 bg-neutral-50 rounded-lg">
                          <div className="text-2xl font-bold text-amber-500">
                            {data.goalProgress.totalTasks - data.goalProgress.completedTasks}
                          </div>
                          <div className="text-sm text-neutral-600">Tasks Left</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="text-primary text-2xl" />
                      </div>
                      <h3 className="text-lg font-medium text-neutral-800 mb-2">
                        No Active Goal
                      </h3>
                      <p className="text-neutral-600 mb-4">
                        Create your first study goal to get started with personalized learning!
                      </p>
                      <Button onClick={() => setIsModalOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Goal
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Bot className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">AI Insights</h3>
                </div>

                <div className="space-y-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2 flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Performance Trend
                    </p>
                    <p className="text-sm opacity-90">
                      You're {data.goalProgress ? '23% ahead of schedule!' : 'ready to start your learning journey!'} 
                      {data.goalProgress && ' Great momentum on your studies.'}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2 flex items-center">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Smart Suggestion
                    </p>
                    <p className="text-sm opacity-90">
                      {data.stats.completedTasks > 0 
                        ? "Focus on practice problems tomorrow to reinforce today's concepts."
                        : "Start with shorter study sessions to build a consistent habit."
                      }
                    </p>
                  </div>

                  <Button 
                    variant="secondary" 
                    className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Bot className="h-4 w-4 mr-2" />
                    Optimize My Plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Today's Tasks */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Today's Tasks</CardTitle>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-neutral-600">
                    {data.stats.completedTasks} of {data.stats.totalDailyTasks} completed
                  </span>
                  <div className="w-16 h-2 bg-neutral-200 rounded-full">
                    <div 
                      className="h-2 bg-emerald-500 rounded-full transition-all" 
                      style={{ 
                        width: `${data.stats.totalDailyTasks > 0 ? (data.stats.completedTasks / data.stats.totalDailyTasks) * 100 : 0}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {data.todaysTasks.length > 0 ? (
                <div className="space-y-3">
                  {data.todaysTasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onComplete={handleTaskComplete}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-neutral-800 mb-2">
                    No Tasks Today
                  </h3>
                  <p className="text-neutral-600">
                    {data.goalProgress 
                      ? "All tasks completed! Great work today."
                      : "Create a study goal to get personalized daily tasks."
                    }
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Achievements & Study Reminders */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {data.recentAchievements.length > 0 ? (
                  <div className="space-y-4">
                    {data.recentAchievements.map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-neutral-800 mb-2">
                      No Achievements Yet
                    </h3>
                    <p className="text-neutral-600">
                      Complete tasks and reach milestones to unlock achievements!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Reminders */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Study Reminders</CardTitle>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.reminders.map((reminder) => (
                    <div key={reminder.id} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Bell className="text-primary h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-800">{reminder.title}</h4>
                          <p className="text-sm text-neutral-600">
                            {reminder.time && `${reminder.time} • `}{reminder.frequency}
                          </p>
                        </div>
                      </div>
                      <Switch defaultChecked={reminder.isActive} />
                    </div>
                  ))}
                </div>

                <Button variant="outline" className="w-full mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Reminder
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Goal Creation Modal */}
      <GoalCreationModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onGoalCreated={handleGoalCreated}
      />
    </div>
  );
}
