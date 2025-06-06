import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import { TrendingUp, Clock, Target, CheckCircle, Flame, Star, BookOpen, Trophy } from "lucide-react";
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { useDashboardData } from "@/hooks/use-dashboard-data";

export default function Progress() {
  const { data: dashboardData, isLoading } = useDashboardData(1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-destructive">Failed to load progress data</p>
      </div>
    );
  }

  const weeklyData = generateWeeklyData();
  const monthlyData = generateMonthlyData();

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Progress Tracking</h1>
          <p className="text-neutral-600">Monitor your learning journey and achievements</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium">Current Streak</p>
                  <p className="text-3xl font-bold text-neutral-800 mt-1">
                    {dashboardData.stats.streak}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">days</p>
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
                  <p className="text-3xl font-bold text-neutral-800 mt-1">
                    {dashboardData.stats.totalXp.toLocaleString()}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1">+250 this week</p>
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
                  <p className="text-sm text-neutral-600 font-medium">Study Time</p>
                  <p className="text-3xl font-bold text-neutral-800 mt-1">
                    {Math.round(dashboardData.stats.studyTimeToday * 7)}h
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">this week</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Clock className="text-blue-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600 font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-neutral-800 mt-1">
                    {dashboardData.goalProgress ? 
                      `${dashboardData.goalProgress.completionPercentage}%` : '0%'
                    }
                  </p>
                  <p className="text-xs text-neutral-500 mt-1">current goal</p>
                </div>
                <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <Target className="text-emerald-500 text-xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Progress Charts */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="weekly" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                <TabsTrigger value="monthly">Monthly View</TabsTrigger>
              </TabsList>

              <TabsContent value="weekly" className="space-y-6 mt-6">
                {/* Weekly Study Time Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2" />
                      Weekly Study Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {weeklyData.map((day, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-neutral-600">{day.name}</span>
                            <span className="font-medium">{day.hours}h</span>
                          </div>
                          <ProgressBar value={day.progress} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Weekly Tasks Completion */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Tasks Completed This Week
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-2">
                      {weeklyData.map((day, index) => (
                        <div key={index} className="text-center">
                          <div className="text-xs text-neutral-500 mb-1">{day.name.slice(0, 3)}</div>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                            day.tasksCompleted > 0 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-neutral-100 text-neutral-500'
                          }`}>
                            {day.tasksCompleted}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="monthly" className="space-y-6 mt-6">
                {/* Monthly Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-2" />
                      Monthly Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-neutral-600 mb-3">Study Hours by Week</h4>
                        <div className="space-y-3">
                          {monthlyData.weeks.map((week, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex items-center justify-between text-sm">
                                <span className="text-neutral-600">Week {index + 1}</span>
                                <span className="font-medium">{week.hours}h</span>
                              </div>
                              <ProgressBar value={week.progress} className="h-1.5" />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-neutral-600 mb-3">Study Types</h4>
                        <div className="space-y-3">
                          {monthlyData.studyTypes.map((type, index) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${type.color}`}></div>
                                <span className="text-sm text-neutral-600">{type.name}</span>
                              </div>
                              <span className="text-sm font-medium">{type.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Current Goal Progress */}
            {dashboardData.goalProgress && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Current Goal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-2">
                      {dashboardData.goalProgress.title}
                    </h4>
                    <ProgressBar value={dashboardData.goalProgress.completionPercentage} className="h-3 mb-2" />
                    <div className="flex justify-between text-sm text-neutral-600">
                      <span>{dashboardData.goalProgress.completedTasks} completed</span>
                      <span>{dashboardData.goalProgress.totalTasks} total tasks</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-neutral-50 rounded-lg">
                      <div className="text-lg font-bold text-neutral-800">
                        {Math.max(0, Math.floor(Math.random() * 14) + 1)}
                      </div>
                      <div className="text-xs text-neutral-600">Days Left</div>
                    </div>
                    <div className="text-center p-3 bg-emerald-50 rounded-lg">
                      <div className="text-lg font-bold text-emerald-600">
                        {dashboardData.goalProgress.pace}
                      </div>
                      <div className="text-xs text-neutral-600">Pace</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="h-5 w-5 mr-2" />
                  Recent Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.recentAchievements.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.recentAchievements.map((achievement) => (
                      <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gradient-to-r from-amber-50 to-amber-25 rounded-lg border border-amber-200">
                        <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                          <i className={`${achievement.icon} text-white text-sm`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-800">{achievement.title}</p>
                          <p className="text-xs text-neutral-600">{achievement.description}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          +{achievement.xpReward}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Trophy className="h-12 w-12 text-neutral-300 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">No achievements yet</p>
                    <p className="text-xs text-neutral-500">Complete tasks to unlock achievements!</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Study Calendar */}
            <Card>
              <CardHeader>
                <CardTitle>Study Calendar</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  className="rounded-md"
                  modifiers={{
                    studyDay: (date) => {
                      // Mark random days as study days for demo
                      return Math.random() > 0.7;
                    }
                  }}
                  modifiersStyles={{
                    studyDay: {
                      backgroundColor: 'hsl(var(--primary))',
                      color: 'white',
                      borderRadius: '50%'
                    }
                  }}
                />
                <div className="flex items-center justify-center space-x-4 mt-4 text-xs text-neutral-600">
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span>Study days</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function generateWeeklyData() {
  const today = new Date();
  const startWeek = startOfWeek(today);
  const endWeek = endOfWeek(today);
  const days = eachDayOfInterval({ start: startWeek, end: endWeek });

  return days.map((day) => {
    const hours = Math.random() * 3 + 0.5; // 0.5 to 3.5 hours
    return {
      name: format(day, 'EEEE'),
      hours: Math.round(hours * 10) / 10,
      progress: Math.min(100, (hours / 3) * 100),
      tasksCompleted: Math.floor(Math.random() * 6),
    };
  });
}

function generateMonthlyData() {
  return {
    weeks: [
      { hours: 12.5, progress: 80 },
      { hours: 15.2, progress: 95 },
      { hours: 10.8, progress: 68 },
      { hours: 8.3, progress: 52 },
    ],
    studyTypes: [
      { name: 'Videos', percentage: 35, color: 'bg-blue-500' },
      { name: 'Reading', percentage: 25, color: 'bg-green-500' },
      { name: 'Practice', percentage: 25, color: 'bg-orange-500' },
      { name: 'Quizzes', percentage: 15, color: 'bg-purple-500' },
    ]
  };
}