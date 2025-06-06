import { Achievement } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface AchievementCardProps {
  achievement: Achievement;
}

const getAchievementGradient = (type: string) => {
  switch (type) {
    case "streak":
      return "from-amber-100 to-amber-50 border-amber-200";
    case "xp":
      return "from-purple-100 to-purple-50 border-purple-200";
    case "tasks":
      return "from-emerald-100 to-emerald-50 border-emerald-200";
    case "goals":
      return "from-blue-100 to-blue-50 border-blue-200";
    default:
      return "from-neutral-100 to-neutral-50 border-neutral-200";
  }
};

const getAchievementIconColor = (type: string) => {
  switch (type) {
    case "streak":
      return "bg-amber-500";
    case "xp":
      return "bg-purple-500";
    case "tasks":
      return "bg-emerald-500";
    case "goals":
      return "bg-blue-500";
    default:
      return "bg-neutral-500";
  }
};

export default function AchievementCard({ achievement }: AchievementCardProps) {
  const timeAgo = formatDistanceToNow(achievement.unlockedAt, { addSuffix: true });

  return (
    <Card className={`bg-gradient-to-r ${getAchievementGradient(achievement.type)} border`}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 ${getAchievementIconColor(achievement.type)} rounded-lg flex items-center justify-center`}>
            <i className={`${achievement.icon} text-white text-lg`} />
          </div>
          <div className="flex-1">
            <h4 className="font-medium text-neutral-800">{achievement.title}</h4>
            <p className="text-sm text-neutral-600">{achievement.description}</p>
          </div>
          <div className="text-right">
            <Badge variant="secondary" className="mb-1">
              +{achievement.xpReward} XP
            </Badge>
            <p className="text-xs text-neutral-500">{timeAgo}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
