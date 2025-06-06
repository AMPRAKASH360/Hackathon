import { User } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Home, BookOpen, TrendingUp, Trophy, Settings, GraduationCap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Study Plans", href: "/plans", icon: BookOpen },
  { name: "Progress", href: "/progress", icon: TrendingUp },
  { name: "Achievements", href: "/achievements", icon: Trophy },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const [location] = useLocation();
  const userInitials = user.displayName
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-64 bg-white shadow-lg border-r border-neutral-200 fixed h-full z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <GraduationCap className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-neutral-800">StudyVerse</h1>
                <p className="text-sm text-neutral-500">AI Study Companion</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || (item.href === "/" && location === "/dashboard");
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-neutral-600 hover:bg-neutral-100"
                )}
                onClick={onClose}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-4 left-4 right-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{userInitials}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {user.streak} day streak 🔥
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </>
  );
}
