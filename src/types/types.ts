// src/types/types.ts (or appropriate path)

// --- ENUMS ---
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

export enum CaseStatus {
  NOT_STARTED = "NOT_STARTED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  ON_HOLD = "ON_HOLD",
  CANCELLED = "CANCELLED",
}

export enum CommunicationType {
  ANNOUNCEMENT = "ANNOUNCEMENT",
  CASE = "CASE",
  CLIENT = "CLIENT", // Possibly representing COMPANY contextually
  TASK = "TASK",
}

export enum PortalAccessStatus {
  ACTIVE = "ACTIVE",
  PENDING_ACTIVATION = "PENDING_ACTIVATION",
  NOT_REGISTERED = "NOT_REGISTERED",
  LOCKED = "LOCKED",
}

export enum ComplianceStatus {
  PENDING = "PENDING",
  MET = "MET",
  NOT_APPLICABLE = "NOT_APPLICABLE",
  OVERDUE = "OVERDUE",
}

// --- Core Interfaces (Reflecting Schema) ---

// User Profile (Represents profiles table)
export interface UserProfile {
  id: string; // PK: profiles.id
  full_name: string;
  role: UserRole;
  phone?: string | null;
  email: string | null; // Should likely be NOT NULL based on schema
  avatar_url?: string | null;
  is_active?: boolean | null;
  last_login?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

// Company (Represents companies table)
export interface Company {
  company_id: string; // PK: companies.company_id (Renamed)
  name: string;
  legal_structure?: string | null;
  country_of_origin?: string | null;
  industry?: string | null;
  registration_number?: string | null;
  tax_id?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact_phone?: string | null;
  account_manager_id?: string | null; // FK to profiles.id
  user_id: string | null; // Consider adding FK to profiles.id (role='CLIENT') if needed
  created_at?: string | null;
  updated_at?: string | null;
}

// Service Category (Represents service_categories table)
export interface ServiceCategory {
  category_id: string; // PK
  category_name: string;
  description?: string | null;
}

// Service (Represents services table)
export interface Service {
  service_id: string; // PK
  category?: {
    category_id: string;
    category_name: string;
    description?: string | null;
  } | null;
  service_name: string;
  description?: string | null;
  base_cost: number;
  estimated_duration_days?: number | null;
  is_mandatory?: boolean | null;
  government_portal_template?: string | null;
  required_documents_template?: string[] | null;
}

// Define the enriched case type (matches the data structure we want to display)
export interface ClientCase extends ApiCase {
  service?: Service | null; // Service details might be null if not found
  tasks_count?: number; // Counts might be undefined while loading
  documents_count?: number;
  pending_documents?: number;
}
// Case (Represents cases table)
// Note: Renamed from ApiCase for consistency if this is the base type
export interface Case {
  case_id: string; // PK
  //  company_id: string; // Assuming renamed to company_id
  company_id: string; // FK to companies.company_id (Assumed Renamed)
  service_id: string; // FK to services.service_id
  case_status: CaseStatus;
  priority?: number;
  start_date?: string;
  target_date?: string;
  actual_completion_date?: string;
  progress_percent?: number;
  assigned_to?: string | null; // FK to profiles.id
  notes?: string | null;
  total_budget?: number | null;
  total_spent?: number | null;
  remaining_budget?: number | null; // Generated column
  created_at?: string | null;
  updated_at?: string | null;
}

// Communication (Represents communications table)
// Note: Consolidated from ApiCommunication / CaseCommunication
export interface Communication {
  communication_id: string; // PK: communications.communication_id (Corrected from case_communication_id)
  case_id: string | null; // FK to cases.case_id
  user_id: string; // FK to profiles.id (Sender)
  comm_type: CommunicationType;
  content: string;
  sent_at: string;
  read: boolean;
  created_at: string;
  company_id: string | null; // FK to companies.company_id
  task_id: string | null; // FK to tasks.task_id
}

// --- API Response Interfaces (with joined data) ---

// User details often included in joins
export interface UserDetail {
  id: string; // profiles.id
  full_name: string;
  role: UserRole | null; // Role might be null if mapping fails
  email?: string | null;
}

// Company summary for lists/dropdowns
export interface ApiCompanySummary {
  id: string; // companies.company_id
  name: string;
}

// Communication with sender details
export interface ApiCommunication extends Communication {
  sender?: UserDetail; // Joined data from profiles table
}

// Case with related details (Service, Company, Assigned User)
export interface ApiCase extends Case {
  service?: Service | null; // Service details might be null if not found

  company?: {
    // Joined data from companies table
    company_id: string;
    name: string;
    primary_contact_name?: string | null;
  } | null;
  assignedUser?: UserDetail | null; // Joined data from profiles table
}
// Define the enriched case type (matches the data structure we want to display)
export interface ClientCase extends ApiCase {
  service?: Service | null; // Service details might be null if not found
  tasks_count?: number; // Counts might be undefined while loading
  documents_count?: number;
  pending_documents?: number;
}

// --- Input/Data Transfer Object Interfaces ---

// For creating a communication
export interface CreateCommunicationData {
  user_id: string;
  comm_type: CommunicationType;
  content: string;
  case_id?: string | null;
  company_id?: string | null;
  task_id?: string | null;
}

// For updating a communication
export interface UpdateCommunicationData {
  read?: boolean;
  content?: string;
  comm_type?: CommunicationType;
}

export interface CaseCreateData {
  company_id: string; // FK to companies.company_id - REQUIRED
  service_id: string; // FK to services.service_id - REQUIRED
  case_status?: CaseStatus; // Use default if not provided
  priority?: number;
  start_date?: string; // ISO date string
  target_date?: string; // ISO date string
  assigned_to?: string | null; // FK to profiles.id
  notes?: string | null;
  total_budget?: number | null;
  // Exclude: case_id, actual_completion_date, progress_percent,
  // total_spent, remaining_budget, created_at, updated_at
}

// For updating a Case - all fields are optional
export interface CaseUpdateData {
  company_id?: string;
  service_id?: string;
  case_status?: CaseStatus;
  priority?: number;
  start_date?: string; // ISO date string
  target_date?: string; // ISO date string
  actual_completion_date?: string | null; // ISO date string
  progress_percent?: number | null;
  assigned_to?: string | null; // FK to profiles.id
  notes?: string | null;
  total_budget?: number | null;
  total_spent?: number | null; // Can be updated
  // remaining_budget is GENERATED ALWAYS - DO NOT INCLUDE IN UPDATE DATA
  // Exclude: case_id, created_at, updated_at, remaining_budget
}
// For creating a Company - derived from Company interface, excluding PK and DB-set fields
export interface CompanyCreateData {
  name: string; // REQUIRED based on schema
  legal_structure?: string | null;
  country_of_origin?: string | null;
  industry?: string | null;
  registration_number?: string | null;
  tax_id?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact_phone?: string | null;
  account_manager_id?: string | null; // FK to profiles.id
  // Exclude: company_id, created_at, updated_at
}

// For updating a Company - all fields are optional
export interface CompanyUpdateData {
  name?: string;
  legal_structure?: string | null;
  country_of_origin?: string | null;
  industry?: string | null;
  registration_number?: string | null;
  tax_id?: string | null;
  primary_contact_name?: string | null;
  primary_contact_email?: string | null;
  primary_contact_phone?: string | null;
  account_manager_id?: string | null; // FK to profiles.id
  // Exclude: company_id, created_at, updated_at
}
