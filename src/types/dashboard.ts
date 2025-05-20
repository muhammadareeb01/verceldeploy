import { CaseStatus } from "./types";

export interface TaskOverviewGroup {
  categoryName: string; // From task_categories
  completed: number;
  total: number;
}
export interface CaseStatusChartData {
  name: string; // e.g., CaseStatus value
  value: number; // Count
  color: string; // Hex color for chart
}

export interface RecentCaseInfo {
  case_id: string;
  companyName: string; // Name from companies table
  serviceName: string; // Name from services table
  case_status: CaseStatus;
  created_at: string; // Or other relevant date
}

// --- Dashboard Specific Types ---
export interface DashboardSummary {
  totalCases: number;
  activeTasks: number;
  totalDocuments: number;
  activeCompanies: number; // Renamed from activeClients
}
