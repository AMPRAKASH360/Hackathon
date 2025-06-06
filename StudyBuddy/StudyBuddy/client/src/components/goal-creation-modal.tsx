import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bot, Loader2, Sparkles } from "lucide-react";

const goalSchema = z.object({
  title: z.string().min(3, "Goal title must be at least 3 characters"),
  timeline: z.string().min(1, "Please select a timeline"),
  dailyStudyTime: z.string().min(1, "Please select daily study time"),
  pace: z.string().min(1, "Please select a pace"),
  description: z.string().optional(),
  userId: z.number(),
});

interface GoalCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoalCreated: () => void;
}

export default function GoalCreationModal({ isOpen, onClose, onGoalCreated }: GoalCreationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm<z.infer<typeof goalSchema>>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      timeline: "",
      dailyStudyTime: "",
      pace: "moderate",
      description: "",
      userId: 1, // Using user ID 1 for demo
    },
  });

  const createGoalMutation = useMutation({
    mutationFn: async (data: z.infer<typeof goalSchema>) => {
      const response = await apiRequest("POST", "/api/goals", data);
      return response.json();
    },
    onSuccess: () => {
      form.reset();
      onGoalCreated();
    },
    onError: (error) => {
      console.error("Failed to create goal:", error);
    },
  });

  const handleSubmit = async (data: z.infer<typeof goalSchema>) => {
    setIsGenerating(true);
    try {
      await createGoalMutation.mutateAsync(data);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      form.reset();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Study Goal</DialogTitle>
          <DialogDescription>
            Tell us what you want to learn and we'll create a personalized study plan for you.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What do you want to learn?</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Learn Python, Master React, Study Data Science"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="timeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Timeline</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timeline" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1 week">1 week</SelectItem>
                        <SelectItem value="2 weeks">2 weeks</SelectItem>
                        <SelectItem value="1 month">1 month</SelectItem>
                        <SelectItem value="2 months">2 months</SelectItem>
                        <SelectItem value="3 months">3 months</SelectItem>
                        <SelectItem value="6 months">6 months</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dailyStudyTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Daily Study Time</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select daily time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="30 minutes">30 minutes</SelectItem>
                        <SelectItem value="1 hour">1 hour</SelectItem>
                        <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                        <SelectItem value="2 hours">2 hours</SelectItem>
                        <SelectItem value="3+ hours">3+ hours</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="pace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Study Pace Preference</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-3 gap-3"
                    >
                      <div className="flex items-center space-x-2 p-4 border border-neutral-300 rounded-lg">
                        <RadioGroupItem value="relaxed" id="relaxed" />
                        <Label htmlFor="relaxed" className="cursor-pointer flex-1">
                          <div className="font-medium text-neutral-800">Relaxed</div>
                          <div className="text-xs text-neutral-600">Steady progress</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border-2 border-primary bg-primary/5 rounded-lg">
                        <RadioGroupItem value="moderate" id="moderate" />
                        <Label htmlFor="moderate" className="cursor-pointer flex-1">
                          <div className="font-medium text-neutral-800">Moderate</div>
                          <div className="text-xs text-neutral-600">Balanced approach</div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 border border-neutral-300 rounded-lg">
                        <RadioGroupItem value="intensive" id="intensive" />
                        <Label htmlFor="intensive" className="cursor-pointer flex-1">
                          <div className="font-medium text-neutral-800">Intensive</div>
                          <div className="text-xs text-neutral-600">Fast-track</div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Details (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any specific areas you want to focus on, prior experience, or learning preferences..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
              <p className="text-sm text-neutral-600 flex items-center">
                <Bot className="text-primary mr-2 h-4 w-4" />
                AI will create a personalized study plan for you
              </p>
              <div className="flex space-x-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={isGenerating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isGenerating}
                  className="min-w-[140px]"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Generate Plan
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
