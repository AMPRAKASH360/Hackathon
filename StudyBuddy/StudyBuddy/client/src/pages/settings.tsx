import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { User, Bell, Shield, Palette, Download, Trash2, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDashboardData } from "@/hooks/use-dashboard-data";

const profileSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

const notificationSchema = z.object({
  dailyReminders: z.boolean(),
  breakReminders: z.boolean(),
  weeklyReports: z.boolean(),
  achievementNotifications: z.boolean(),
  reminderTime: z.string(),
  studyReminderFrequency: z.string(),
});

const studyPreferencesSchema = z.object({
  defaultStudyTime: z.string(),
  preferredPace: z.string(),
  autoScheduleTasks: z.boolean(),
  showProgress: z.boolean(),
  theme: z.string(),
});

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: dashboardData } = useDashboardData(1);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: dashboardData?.user.displayName || "",
      username: dashboardData?.user.username || "",
    },
  });

  const notificationForm = useForm<z.infer<typeof notificationSchema>>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      dailyReminders: true,
      breakReminders: true,
      weeklyReports: false,
      achievementNotifications: true,
      reminderTime: "09:00",
      studyReminderFrequency: "daily",
    },
  });

  const studyForm = useForm<z.infer<typeof studyPreferencesSchema>>({
    resolver: zodResolver(studyPreferencesSchema),
    defaultValues: {
      defaultStudyTime: "1 hour",
      preferredPace: "moderate",
      autoScheduleTasks: true,
      showProgress: true,
      theme: "light",
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: z.infer<typeof profileSchema>) => {
      const response = await apiRequest("PATCH", "/api/users/1", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/1"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    },
  });

  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof notificationSchema>) => {
      const response = await apiRequest("PATCH", "/api/users/1/notifications", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
  });

  const updateStudyPreferencesMutation = useMutation({
    mutationFn: async (data: z.infer<typeof studyPreferencesSchema>) => {
      const response = await apiRequest("PATCH", "/api/users/1/preferences", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Study preferences updated",
        description: "Your study preferences have been saved.",
      });
    },
  });

  const exportDataMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", "/api/users/1/export");
      return response.json();
    },
    onSuccess: (data) => {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'studyverse-data.json';
      a.click();
      URL.revokeObjectURL(url);
      toast({
        title: "Data exported",
        description: "Your data has been downloaded successfully.",
      });
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/users/1");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
        variant: "destructive",
      });
    },
  });

  const onProfileSubmit = (data: z.infer<typeof profileSchema>) => {
    updateProfileMutation.mutate(data);
  };

  const onNotificationSubmit = (data: z.infer<typeof notificationSchema>) => {
    updateNotificationsMutation.mutate(data);
  };

  const onStudySubmit = (data: z.infer<typeof studyPreferencesSchema>) => {
    updateStudyPreferencesMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Settings</h1>
          <p className="text-neutral-600">Manage your account and study preferences</p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="study" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Study</span>
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Privacy</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="flex items-center space-x-4 mb-6">
                      <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">
                          {dashboardData?.user.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-800">Profile Picture</h3>
                        <p className="text-sm text-neutral-600">Update your avatar image</p>
                        <Button variant="outline" size="sm" className="mt-2">
                          Change Photo
                        </Button>
                      </div>
                    </div>

                    <FormField
                      control={profileForm.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Display Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your display name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={profileForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter your username" />
                          </FormControl>
                          <FormDescription>
                            This is your unique identifier on StudyVerse
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <h4 className="font-medium text-neutral-800">Study Statistics</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-neutral-50 rounded-lg">
                          <p className="text-sm text-neutral-600">Member Since</p>
                          <p className="font-semibold">January 2024</p>
                        </div>
                        <div className="p-4 bg-neutral-50 rounded-lg">
                          <p className="text-sm text-neutral-600">Total Study Time</p>
                          <p className="font-semibold">47.5 hours</p>
                        </div>
                      </div>
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Changes</span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...notificationForm}>
                  <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium text-neutral-800">Study Reminders</h4>
                      
                      <FormField
                        control={notificationForm.control}
                        name="dailyReminders"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Daily Study Reminders</FormLabel>
                              <FormDescription>
                                Get reminded to study at your scheduled time
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="breakReminders"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Break Reminders</FormLabel>
                              <FormDescription>
                                Get reminded to take breaks during study sessions
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="reminderTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reminder Time</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="07:00">7:00 AM</SelectItem>
                                <SelectItem value="08:00">8:00 AM</SelectItem>
                                <SelectItem value="09:00">9:00 AM</SelectItem>
                                <SelectItem value="10:00">10:00 AM</SelectItem>
                                <SelectItem value="19:00">7:00 PM</SelectItem>
                                <SelectItem value="20:00">8:00 PM</SelectItem>
                                <SelectItem value="21:00">9:00 PM</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-neutral-800">Progress Updates</h4>
                      
                      <FormField
                        control={notificationForm.control}
                        name="weeklyReports"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Weekly Progress Reports</FormLabel>
                              <FormDescription>
                                Receive weekly summaries of your study progress
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={notificationForm.control}
                        name="achievementNotifications"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Achievement Notifications</FormLabel>
                              <FormDescription>
                                Get notified when you unlock new achievements
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateNotificationsMutation.isPending}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Preferences</span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Study Preferences */}
          <TabsContent value="study">
            <Card>
              <CardHeader>
                <CardTitle>Study Preferences</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...studyForm}>
                  <form onSubmit={studyForm.handleSubmit(onStudySubmit)} className="space-y-6">
                    <FormField
                      control={studyForm.control}
                      name="defaultStudyTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Study Session Length</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="30 minutes">30 minutes</SelectItem>
                              <SelectItem value="1 hour">1 hour</SelectItem>
                              <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                              <SelectItem value="2 hours">2 hours</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studyForm.control}
                      name="preferredPace"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Learning Pace</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select pace" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="relaxed">Relaxed</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="intensive">Intensive</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={studyForm.control}
                      name="theme"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Theme</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select theme" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="light">Light</SelectItem>
                              <SelectItem value="dark">Dark</SelectItem>
                              <SelectItem value="auto">Auto</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-medium text-neutral-800">Study Features</h4>
                      
                      <FormField
                        control={studyForm.control}
                        name="autoScheduleTasks"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Auto-schedule Tasks</FormLabel>
                              <FormDescription>
                                Automatically schedule tasks based on your availability
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={studyForm.control}
                        name="showProgress"
                        render={({ field }) => (
                          <FormItem className="flex items-center justify-between">
                            <div>
                              <FormLabel>Show Progress Indicators</FormLabel>
                              <FormDescription>
                                Display progress bars and completion percentages
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateStudyPreferencesMutation.isPending}
                      className="flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Preferences</span>
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy & Data */}
          <TabsContent value="privacy">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Data & Privacy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-medium text-neutral-800 mb-4">Export Your Data</h4>
                    <p className="text-sm text-neutral-600 mb-4">
                      Download a copy of all your study data, goals, and progress.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => exportDataMutation.mutate()}
                      disabled={exportDataMutation.isPending}
                      className="flex items-center space-x-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Export Data</span>
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-neutral-800 mb-4">Privacy Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Profile Visibility</Label>
                          <p className="text-sm text-neutral-600">Control who can see your profile</p>
                        </div>
                        <Select defaultValue="private">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="friends">Friends</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Study Statistics</Label>
                          <p className="text-sm text-neutral-600">Show study stats on profile</p>
                        </div>
                        <Switch defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Achievement Sharing</Label>
                          <p className="text-sm text-neutral-600">Allow sharing achievements</p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h4 className="font-medium text-red-600 mb-4">Danger Zone</h4>
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <h5 className="font-medium text-red-800 mb-2">Delete Account</h5>
                      <p className="text-sm text-red-700 mb-4">
                        This action cannot be undone. This will permanently delete your account and remove all your data.
                      </p>
                      <Button 
                        variant="destructive" 
                        onClick={() => {
                          if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                            deleteAccountMutation.mutate();
                          }
                        }}
                        disabled={deleteAccountMutation.isPending}
                        className="flex items-center space-x-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete Account</span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}