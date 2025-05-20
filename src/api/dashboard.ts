import { CaseStatus } from "../types/types";
import { supabase } from "@/integrations/supabase/client";
import type {
  CaseStatusChartData,
  RecentCaseInfo,
  DashboardSummary,
  TaskOverviewGroup,
} from "@/types/dashboard";

// Dashboard Data Functions
export const getDashboardStats = async (): Promise<DashboardSummary> => {
  try {
    // Get total cases count
    const { count: totalCases } = await supabase
      .from("cases")
      .select("*", { count: "exact", head: true });

    // Get active tasks count
    const { count: activeTasks } = await supabase
      .from("tasks")
      .select("*", { count: "exact", head: true })
      .not("status", "eq", "COMPLETED");

    // Get total documents
    const { count: totalDocuments } = await supabase
      .from("documents")
      .select("*", { count: "exact", head: true });

    // Get active clients
    const { count: activeClients } = await supabase
      .from("companies")
      .select("*", { count: "exact", head: true });

    return {
      totalCases: totalCases || 0,
      activeTasks: activeTasks || 0,
      totalDocuments: totalDocuments || 0,
      activeCompanies: activeClients || 0,
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return {
      totalCases: 0,
      activeTasks: 0,
      totalDocuments: 0,
      activeCompanies: 0,
    };
  }
};

export const getCaseStatusData = async (): Promise<CaseStatusChartData[]> => {
  try {
    const statusColors = {
      NOT_STARTED: "#CBD5E0",
      IN_PROGRESS: "#4299E1",
      COMPLETED: "#48BB78",
      ON_HOLD: "#ECC94B",
      CANCELLED: "#F56565",
    };

    const { data } = await supabase
      .from("cases")
      .select("case_status")
      .order("case_status");

    if (!data) return [];

    // Count occurrences of each status
    const statusCounts: Record<string, number> = {};
    data.forEach((item) => {
      const status = item.case_status;
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // Format for chart
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.replace(/_/g, " "),
      value: count,
      color: statusColors[status as keyof typeof statusColors] || "#CBD5E0",
    }));
  } catch (error) {
    console.error("Error fetching case status data:", error);
    return [];
  }
};

export const getRecentCases = async (limit = 5): Promise<RecentCaseInfo[]> => {
  try {
    const { data } = await supabase
      .from("cases")
      .select(
        `
        case_id,
        created_at,
        case_status,
        companies!inner(name),
        services!inner(service_name)
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (!data) return [];

    return data.map((item) => ({
      case_id: item.case_id,
      companyName: item.companies.name,
      serviceName: item.services.service_name,
      case_status: item.case_status as CaseStatus, // Cast to CaseStatus enum
      created_at: item.created_at, // Use the original string timestamp
    }));
  } catch (error) {
    console.error("Error fetching recent cases:", error);
    return [];
  }
};

export const getTaskGroups = async (): Promise<TaskOverviewGroup[]> => {
  try {
    // Get tasks grouped by service
    const { data } = await supabase
      .from("tasks")
      .select(
        `
        status,
        case:case_id(service:service_id(service_name))
      `
      )
      .order("case_id");

    if (!data) return [];

    // Group tasks by service name and count completed vs total
    const groupedTasks: Record<string, { completed: number; total: number }> =
      {};

    data.forEach((task) => {
      const category = task.case?.service?.service_name || "Uncategorized";

      if (!groupedTasks[category]) {
        groupedTasks[category] = { completed: 0, total: 0 };
      }

      groupedTasks[category].total += 1;

      if (task.status === "COMPLETED") {
        groupedTasks[category].completed += 1;
      }
    });

    return Object.entries(groupedTasks).map(([category, counts]) => ({
      categoryName: category, // Map category to categoryName
      completed: counts.completed,
      total: counts.total,
    }));
  } catch (error) {
    console.error("Error fetching task groups:", error);
    return [];
  }
};

// Cases API Functions
export const getCases = async () => {
  try {
    const { data, error } = await supabase
      .from("cases")
      .select(
        `
        *,
        companies:client_id(*),
        services:service_id(*),
        assignedTo:assigned_to(*)
      `
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching cases:", error);
    return [];
  }
};

export const getCaseById = async (caseId: string) => {
  try {
    const { data, error } = await supabase
      .from("cases")
      .select(
        `
        *,
        companies:client_id(*),
        services:service_id(*),
        assignedTo:assigned_to(*)
      `
      )
      .eq("case_id", caseId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching case with ID ${caseId}:`, error);
    return null;
  }
};

// Tasks API Functions
export const getCaseTasks = async (caseId: string) => {
  try {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        assignedTo:assigned_to(*)
      `
      )
      .eq("case_id", caseId)
      .order("start_date", { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching tasks for case ${caseId}:`, error);
    return [];
  }
};

// Documents API Functions
export const getCaseDocuments = async (caseId: string) => {
  try {
    const { data, error } = await supabase
      .from("documents")
      .select(
        `
        *,
        submittedUser:submitted_by(*),
        reviewUser:review_by(*)
      `
      )
      .eq("case_id", caseId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching documents for case ${caseId}:`, error);
    return [];
  }
};

// Export other necessary functions for CRUD operations as needed
