import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StudyTask } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Play, Book, Brain, Code, Trophy, Clock } from "lucide-react";

interface TaskItemProps {
  task: StudyTask;
  onComplete?: () => void;
}

const getTaskIcon = (type: string) => {
  switch (type) {
    case "video":
      return <Play className="h-4 w-4" />;
    case "reading":
      return <Book className="h-4 w-4" />;
    case "quiz":
      return <Brain className="h-4 w-4" />;
    case "practice":
      return <Code className="h-4 w-4" />;
    case "project":
      return <Trophy className="h-4 w-4" />;
    default:
      return <Book className="h-4 w-4" />;
  }
};

const getTaskTypeLabel = (type: string) => {
  switch (type) {
    case "video":
      return "Video";
    case "reading":
      return "Reading";
    case "quiz":
      return "Quiz";
    case "practice":
      return "Practice";
    case "project":
      return "Project";
    default:
      return "Task";
  }
};

const getTaskTypeColor = (type: string) => {
  switch (type) {
    case "video":
      return "bg-blue-100 text-blue-800";
    case "reading":
      return "bg-green-100 text-green-800";
    case "quiz":
      return "bg-purple-100 text-purple-800";
    case "practice":
      return "bg-orange-100 text-orange-800";
    case "project":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function TaskItem({ task, onComplete }: TaskItemProps) {
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const updateTaskMutation = useMutation({
    mutationFn: async (isCompleted: boolean) => {
      const response = await apiRequest("PATCH", `/api/tasks/${task.id}/complete`, {
        isCompleted
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/1"] });
      if (onComplete) {
        onComplete();
      }
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
    },
  });

  const handleTaskToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      await updateTaskMutation.mutateAsync(checked);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartTask = () => {
    // In a real app, this would navigate to the task or open appropriate interface
    console.log("Starting task:", task.title);
  };

  const isCurrentTask = !task.isCompleted; // Simplified logic for demo

  return (
    <Card 
      className={cn(
        "transition-all duration-200",
        task.isCompleted 
          ? "bg-neutral-50 border-neutral-200" 
          : isCurrentTask 
            ? "border-2 border-primary bg-primary/5 shadow-sm" 
            : "border-neutral-200"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <Checkbox
              checked={task.isCompleted}
              onCheckedChange={handleTaskToggle}
              disabled={isLoading}
              className="w-5 h-5"
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 
              className={cn(
                "font-medium",
                task.isCompleted 
                  ? "line-through opacity-60 text-neutral-600" 
                  : "text-neutral-800"
              )}
            >
              {task.title}
            </h4>
            <div className="flex items-center space-x-4 mt-1">
              <span className="text-sm text-neutral-600 flex items-center">
                {getTaskIcon(task.type)}
                <span className="ml-1">{getTaskTypeLabel(task.type)}</span>
              </span>
              <span className="text-sm text-neutral-600 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {task.estimatedMinutes} minutes
              </span>
              <span className="text-sm text-neutral-600">
                {task.xpReward} XP
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-neutral-600 mt-1">{task.description}</p>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              className={cn(
                "text-xs",
                task.isCompleted 
                  ? "bg-emerald-100 text-emerald-800" 
                  : isCurrentTask 
                    ? "bg-amber-100 text-amber-800"
                    : "bg-neutral-200 text-neutral-600"
              )}
            >
              {task.isCompleted 
                ? "Completed" 
                : isCurrentTask 
                  ? "Current" 
                  : "Upcoming"
              }
            </Badge>
            
            {isCurrentTask && !task.isCompleted && (
              <Button size="sm" onClick={handleStartTask}>
                Start
              </Button>
            )}
            
            {!isCurrentTask && !task.isCompleted && (
              <div className="text-neutral-400">
                {getTaskIcon(task.type)}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
