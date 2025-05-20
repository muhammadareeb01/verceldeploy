import React from "react";
import StatCard from "@/components/dashboard/StatCard";
import CaseStatusChart from "@/components/dashboard/CaseStatusChart";
import RecentCases from "@/components/dashboard/RecentCases";
import TasksOverview from "@/components/dashboard/TasksOverview";
import { Briefcase, CheckSquare, FileText, Users } from "lucide-react";
import { useDashboardData } from "@/hooks/useDashboardData";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { stats, caseStatusData, recentCases, taskGroups, isLoading, isError } =
    useDashboardData();

  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to the Tabadl Case Flow Management System
        </p>
      </div>

      {isError && (
        <div className="bg-red-50 p-4 mb-6 rounded-md border border-red-200">
          <p className="text-red-700">
            Error loading dashboard data. Please try again or contact Talha Khan
            at 442-421-5593 or info@dijitze.com.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Cases"
          value={isLoading ? "..." : stats?.totalCases.toString() || "0"}
          change="12%"
          icon={<Briefcase size={24} />}
        />
        <StatCard
          title="Active Tasks"
          value={isLoading ? "..." : stats?.activeTasks.toString() || "0"}
          change="8%"
          icon={<CheckSquare size={24} />}
        />
        <StatCard
          title="Documents"
          value={isLoading ? "..." : stats?.totalDocuments.toString() || "0"}
          change="15%"
          icon={<FileText size={24} />}
        />
        <StatCard
          title="Active Clients"
          value={isLoading ? "..." : stats?.activeCompanies.toString() || "0"}
          change="5%"
          positive={false}
          icon={<Users size={24} />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {isLoading ? (
          <>
            <Skeleton className="h-[350px] rounded-lg" />
            <Skeleton className="h-[350px] col-span-2 rounded-lg" />
          </>
        ) : (
          <>
            <div className="bg-white p-4 rounded-lg shadow">
              {caseStatusData?.length ? (
                <CaseStatusChart data={caseStatusData} />
              ) : (
                <p className="text-muted-foreground text-center">
                  No case status data available.
                </p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow col-span-2">
              {recentCases?.length ? (
                <RecentCases cases={recentCases} />
              ) : (
                <p className="text-muted-foreground text-center">
                  No recent cases available.
                </p>
              )}
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <Skeleton className="h-[300px] rounded-lg" />
        ) : (
          <div className="bg-white p-4 rounded-lg shadow">
            {taskGroups?.length ? (
              <TasksOverview tasks={taskGroups} />
            ) : (
              <p className="text-muted-foreground text-center">
                No task groups available.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;
