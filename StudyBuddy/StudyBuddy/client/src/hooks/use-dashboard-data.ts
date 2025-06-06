import { useQuery } from "@tanstack/react-query";
import { DashboardData } from "@/lib/types";

export function useDashboardData(userId: number) {
  return useQuery<DashboardData>({
    queryKey: [`/api/dashboard/${userId}`],
    refetchInterval: 30000, // Refresh every 30 seconds
  });
}
