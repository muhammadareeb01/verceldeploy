// src/types/tasks.ts

export enum TaskOriginType {
  PREDEFINED = "PREDEFINED",
  COMPANY = "COMPANY",
  CASE = "CASE",
}

// Assuming UserRole is also used by other parts of your application
// If it's only for tasks, it could live here.
// If it's global, importing from "@/types/types" (as in your api/tasks.ts) is fine too.
export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  OFFICER = "OFFICER",
  STAFF = "STAFF",
  CLIENT = "CLIENT",
  ACCOUNT_MANAGER = "ACCOUNT_MANAGER",
  DOCUMENT_SPECIALIST = "DOCUMENT_SPECIALIST",
  FINANCE_OFFICER = "FINANCE_OFFICER",
}

// Task Definition Types
// Each type has its specific ID and the origin_type discriminator.
// The 'task_id' field here is the alias from your SELECT query (e.g., predefined_task_id AS task_id),
// so it holds the value of the specific ID.
export interface PredefinedTask {
  predefined_task_id: string; // Actual specific ID field in the database table
  task_id: string;            // Alias for the specific ID, used for convenience from query
  origin_type: TaskOriginType.PREDEFINED;

  task_name: string;
  description?: string;
  service_id?: string;
  task_category_id?: string;
  document_type_id?: string;
  default_responsible_user_role?: UserRole | string; // Use UserRole for better type safety
  typical_duration_days?: number;
  priority?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CompanyTask {
  company_task_id: string; // Actual specific ID
  task_id: string;         // Alias for the specific ID
  origin_type: TaskOriginType.COMPANY;

  company_id: string;
  task_name: string;
  description?: string;
  task_category_id?: string;
  document_type_id?: string;
  priority?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface CaseTask {
  case_task_id: string; // Actual specific ID
  task_id: string;      // Alias for the specific ID
  origin_type: TaskOriginType.CASE;

  case_id: string;
  task_name: string;
  description?: string;
  task_category_id?: string;
  document_type_id?: string;
  priority?: number;
  created_at?: string | Date;
  updated_at?: string | Date;
}

// Unified ApiTask type for Task Definitions
export type ApiTask = PredefinedTask | CompanyTask | CaseTask;


// --- Task Definition Form Data & Create Input (from previous response, for consistency) ---
export interface TaskDefinitionFormData {
  task_name: string;
  description?: string;
  priority?: number;
  task_category_id?: string;
  document_type_id?: string;
  service_id?: string;
  default_responsible_user_role?: UserRole | string;
  typical_duration_days?: number;
  case_id?: string;
  company_id?: string;
}

export type PredefinedTaskCreatePayload = Partial<Omit<PredefinedTask, 'predefined_task_id' | 'task_id' | 'origin_type' | 'created_at' | 'updated_at'>>;
export type CaseTaskCreatePayload = Partial<Omit<CaseTask, 'case_task_id' | 'task_id' | 'origin_type' | 'created_at' | 'updated_at'>>;
export type CompanyTaskCreatePayload = Partial<Omit<CompanyTask, 'company_task_id' | 'task_id' | 'origin_type' | 'created_at' | 'updated_at'>>;

export type TaskDefinitionCreateInput =
  | ({ formType: "predefined" } & PredefinedTaskCreatePayload)
  | ({ formType: "case" } & CaseTaskCreatePayload)
  | ({ formType: "company" } & CompanyTaskCreatePayload);


// --- Task Instance Related Types (from your original file structure) ---
export enum TaskInstanceStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  BLOCKED = "BLOCKED",
  ON_HOLD = "ON_HOLD",
}

export interface TaskStatus { // Your original TaskStatus, used by TaskInstance
  id: string; // Could be TaskInstanceStatus
  name: string;
}

export interface TaskInstance {
  task_instance_id: string;
  task_name: string;
  description?: string;
  origin_type: TaskOriginType;
  origin_task_id: string; // This would be predefined_task_id, case_task_id, or company_task_id values
  uploaded_document_id?: string;
  status: TaskStatus; // Using your TaskStatus definition
  assigned_to?: string;
  start_date?: Date;
  due_date?: Date;
  completed_at?: Date | null;
  actual_duration_days?: number;
  priority?: number;
  active?: boolean;
  notes?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
}