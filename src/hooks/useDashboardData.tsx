// hooks/useDashboardData.tsx

import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getCaseStatusData,
  getRecentCases,
  getTaskGroups,
} from "@/api/dashboard";
import type {
  DashboardSummary,
  CaseStatusChartData,
  TaskOverviewGroup,
} from "@/types/dashboard";
import { RecentCaseInfo as RecentCase } from "@/types/dashboard";

/**
 * Hook to fetch and manage dashboard statistics data
 */
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch and manage case status chart data
 */
export const useCaseStatusData = () => {
  return useQuery({
    queryKey: ["caseStatusData"],
    queryFn: getCaseStatusData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch and manage recent cases data
 */
export const useRecentCases = (limit = 5) => {
  return useQuery({
    queryKey: ["recentCases", limit],
    queryFn: () => getRecentCases(limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

/**
 * Hook to fetch and manage task groups data
 */
export const useTaskGroups = () => {
  return useQuery({
    queryKey: ["taskGroups"],
    queryFn: getTaskGroups,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Combined hook to fetch all dashboard data
 */
export const useDashboardData = () => {
  const statsQuery = useDashboardStats();
  const caseStatusQuery = useCaseStatusData();
  const recentCasesQuery = useRecentCases();
  const taskGroupsQuery = useTaskGroups();

  const isLoading =
    statsQuery.isLoading ||
    caseStatusQuery.isLoading ||
    recentCasesQuery.isLoading ||
    taskGroupsQuery.isLoading;

  const isError =
    statsQuery.isError ||
    caseStatusQuery.isError ||
    recentCasesQuery.isError ||
    taskGroupsQuery.isError;

  const error =
    statsQuery.error ||
    caseStatusQuery.error ||
    recentCasesQuery.error ||
    taskGroupsQuery.error;

  return {
    stats: statsQuery.data as DashboardSummary,
    caseStatusData: caseStatusQuery.data as CaseStatusChartData[],
    recentCases: recentCasesQuery.data as RecentCase[],
    taskGroups: taskGroupsQuery.data as TaskOverviewGroup[],
    isLoading,
    isError,
    error,
    refetch: () => {
      statsQuery.refetch();
      caseStatusQuery.refetch();
      recentCasesQuery.refetch();
      taskGroupsQuery.refetch();
    },
  };
};
