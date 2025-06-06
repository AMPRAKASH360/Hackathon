import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudyGoal, StudyTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GoalCreationModal from "@/components/goal-creation-modal";
import { Plus, BookOpen, Clock, Target, CheckCircle, Play, Pause, Archive } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

export default function StudyPlans() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: goals, isLoading } = useQuery<StudyGoal[]>({
    queryKey: ['/api/goals/1'], // Using user ID 1 for demo
  });

  const updateGoalMutation = useMutation({
    mutationFn: async ({ goalId, status }: { goalId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/goals/${goalId}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/goals/1'] });
      toast({
        title: "Goal updated successfully",
        description: "Your study plan has been updated.",
      });
    },
  });

  const handleGoalCreated = () => {
    setIsModalOpen(false);
    queryClient.invalidateQueries({ queryKey: ['/api/goals/1'] });
    toast({
      title: "Study plan created!",
      description: "Your AI-generated study plan is ready. Let's start learning!",
    });
  };

  const handleStatusChange = (goalId: number, status: string) => {
    updateGoalMutation.mutate({ goalId, status });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeGoals = goals?.filter(goal => goal.status === 'active') || [];
  const completedGoals = goals?.filter(goal => goal.status === 'completed') || [];
  const pausedGoals = goals?.filter(goal => goal.status === 'paused') || [];

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-2">Study Plans</h1>
              <p className="text-neutral-600">Manage your learning goals and track progress</p>
            </div>
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Study Plan
            </Button>
          </div>
        </div>

        {/* Study Plans Tabs */}
        <Tabs defaultValue="active" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="active">
              Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="paused">
              Paused ({pausedGoals.length})
            </TabsTrigger>
          </TabsList>

          {/* Active Goals */}
          <TabsContent value="active" className="space-y-4">
            {activeGoals.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {activeGoals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Active Study Plans"
                description="Create your first study plan to start learning"
                onCreateClick={() => setIsModalOpen(true)}
              />
            )}
          </TabsContent>

          {/* Completed Goals */}
          <TabsContent value="completed" className="space-y-4">
            {completedGoals.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {completedGoals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Completed Study Plans"
                description="Complete your active study plans to see them here"
              />
            )}
          </TabsContent>

          {/* Paused Goals */}
          <TabsContent value="paused" className="space-y-4">
            {pausedGoals.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pausedGoals.map((goal) => (
                  <GoalCard 
                    key={goal.id} 
                    goal={goal} 
                    onStatusChange={handleStatusChange}
                  />
                ))}
              </div>
            ) : (
              <EmptyState 
                title="No Paused Study Plans"
                description="Pause active study plans when you need a break"
              />
            )}
          </TabsContent>
        </Tabs>

        <GoalCreationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onGoalCreated={handleGoalCreated}
        />
      </div>
    </div>
  );
}

interface GoalCardProps {
  goal: StudyGoal;
  onStatusChange: (goalId: number, status: string) => void;
}

function GoalCard({ goal, onStatusChange }: GoalCardProps) {
  const { data: tasks } = useQuery<StudyTask[]>({
    queryKey: [`/api/goals/${goal.id}/tasks`],
  });

  const completedTasks = tasks?.filter(task => task.isCompleted).length || 0;
  const totalTasks = tasks?.length || 0;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-amber-100 text-amber-800';
      default: return 'bg-neutral-100 text-neutral-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <CardTitle className="text-xl">{goal.title}</CardTitle>
            <div className="flex items-center space-x-4 text-sm text-neutral-600">
              <span className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {goal.timeline}
              </span>
              <span className="flex items-center">
                <Target className="h-4 w-4 mr-1" />
                {goal.dailyStudyTime}/day
              </span>
            </div>
          </div>
          <Badge className={getStatusColor(goal.status)}>
            {getStatusIcon(goal.status)}
            <span className="ml-1 capitalize">{goal.status}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goal.description && (
            <p className="text-neutral-600 text-sm">{goal.description}</p>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">Progress</span>
              <span className="font-medium">{progressPercentage}% complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{completedTasks} of {totalTasks} tasks completed</span>
              <span>Created {formatDistanceToNow(goal.createdAt, { addSuffix: true })}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 pt-2">
            {goal.status === 'active' && (
              <>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onStatusChange(goal.id, 'paused')}
                >
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onStatusChange(goal.id, 'completed')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Complete
                </Button>
              </>
            )}
            {goal.status === 'paused' && (
              <Button 
                size="sm" 
                onClick={() => onStatusChange(goal.id, 'active')}
              >
                <Play className="h-4 w-4 mr-1" />
                Resume
              </Button>
            )}
            {goal.status === 'completed' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => onStatusChange(goal.id, 'archived')}
              >
                <Archive className="h-4 w-4 mr-1" />
                Archive
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  onCreateClick?: () => void;
}

function EmptyState({ title, description, onCreateClick }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <BookOpen className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-600 mb-6">{description}</p>
      {onCreateClick && (
        <Button onClick={onCreateClick}>
          <Plus className="h-4 w-4 mr-2" />
          Create Study Plan
        </Button>
      )}
    </div>
  );
}