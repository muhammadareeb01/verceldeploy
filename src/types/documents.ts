// Suggested file: src/types/types.ts
// Add the following interfaces to your existing types/types.ts file
import { UserDetail, UserRole } from "./types";

// --- Core Document Interface ---
// Represents the full structure of a document record as stored in the database
// This should match the structure returned by your API functions before transformation
export interface Document {
  document_id: string; // Primary Key (UUID)
  case_id: string | null; // FK to cases
  company_id: string | null; // FK to companies
  doc_name: string;
  doc_type_id: string; // FK to document_types(doc_type_id)
  status: DocStatus;
  provided_by: string | null; // FK to profiles.id
  submitted_by: string | null; // FK to profiles.id
  submission_date: string | null; // ISO date string
  review_by: string | null; // FK to profiles.id
  review_date: string | null; // ISO date string
  storage_path: string | null; // Path or URL
  version: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface ApiDocument extends Document {
  doc_type: DocumentType | null; // Joined document_types data
  submittedByUser: UserDetail | null;
  reviewByUser: UserDetail | null;
}

// --- Enums ---
export enum DocStatus {
  NOT_SUBMITTED = "NOT_SUBMITTED",
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CLIENT_ACTION_REQUIRED = "CLIENT_ACTION_REQUIRED",
}

// --- Interfaces ---
export interface DocumentType {
  doc_type_id: string; // UUID
  service_id: string; // UUID, FK to services
  doc_type_name: string; // e.g., "IDENTIFICATION"
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ApiDocument extends Document {
  doc_type: DocumentType | null; // Joined document_types data
  submittedByUser: UserDetail | null;
  reviewByUser: UserDetail | null;
}

export interface DocumentCreateData {
  case_id?: string | null;
  company_id: string; // Required per Supabase schema
  doc_name: string; // Required per Supabase schema
  doc_type_id: string; // FK to document_types, required
  status?: DocStatus;
  provided_by?: string | null;
  submitted_by?: string | null;
  submission_date?: string | null;
  review_by?: string | null;
  review_date?: string | null;
  storage_path: string; // Required per Supabase schema
  version?: number;
  notes?: string | null;
}
export interface DocumentUpdateData {
  case_id?: string | null;
  company_id?: string | null;
  doc_name?: string;
  doc_type_id?: string; // FK to document_types
  status?: DocStatus;
  provided_by?: string | null;
  submitted_by?: string | null;
  submission_date?: string | null;
  review_by?: string | null;
  review_date?: string | null;
  storage_path?: string | null;
  version?: number;
  notes?: string | null;
}

export interface GetDocumentsFilters {
  caseId?: string;
  companyId?: string;
  status?: DocStatus | DocStatus[];
  docTypeId?: string | string[]; // Filter by doc_type_id
  serviceId?: string | string[]; // Filter by service_id
  providedByUserId?: string;
  submittedByUserId?: string;
  reviewByUserId?: string;
}
