// --- Enum for Payment Status ---
// Ensure this enum exists if you haven't defined it already
export enum PaymentStatus {
  DUE = "DUE",
  PAID = "PAID",
  PARTIAL = "PARTIAL",
  UNPAID = "UNPAID",
  OVERDUE = "OVERDUE",
  WAIVED = "WAIVED",
  CANCELLED = "CANCELLED", // Added CANCELLED based on common payment workflows
  // Add other payment statuses if they exist in your database schema
}

// --- Core Payment Interface ---
// Represents the full structure of a payment record as stored in the database
export interface CasePayment {
  payment_id: string; // Primary Key (UUID)
  case_id: string; // Foreign Key to cases table (UUID)
  milestone_description: string | null; // Description of the payment milestone
  amount_due: number; // The total amount expected for this payment
  amount_paid: number; // The amount that has been paid so far
  due_date: string; // The date the payment is due (ISO date string)
  status: PaymentStatus; // The current status of the payment
  invoice_number: string | null; // Optional invoice number
  payment_date: string | null; // The date the payment was made (if applicable) (ISO date string)
  payment_method: string | null; // The method used for payment (if applicable)
  notes: string | null; // Any additional notes about the payment
  created_at: string; // Timestamp when the record was created
  updated_at: string; // Timestamp when the record was last updated
  // Add any other fields from your 'payments' table schema
}

// --- Input/Data Transfer Object Interfaces ---

// For creating a Payment - derived from CasePayment, excluding PK and DB-set fields
export interface PaymentCreateData {
  case_id: string; // REQUIRED - Link to the case
  milestone_description?: string | null; // Optional description
  amount_due: number; // REQUIRED - The amount expected
  due_date: string; // REQUIRED - The due date (ISO date string)
  // amount_paid typically starts at 0, status defaults to DUE in DB
  // Exclude: payment_id, amount_paid, status, invoice_number, payment_date, payment_method, notes, created_at, updated_at
  // Include optional fields if they can be set on creation:
  invoice_number?: string | null;
  payment_method?: string | null;
  notes?: string | null;
  // If status or amount_paid can be set on creation, add them here as optional
  // status?: PaymentStatus;
  // amount_paid?: number;
}

// For updating an existing Payment - all fields are optional
export interface PaymentUpdateData {
  case_id?: string; // Can potentially change the linked case? (Less common)
  milestone_description?: string | null;
  amount_due?: number;
  amount_paid?: number; // Can be updated as payments are made
  due_date?: string; // ISO date string
  status?: PaymentStatus; // Can be updated (e.g., to PAID, OVERDUE)
  invoice_number?: string | null;
  payment_date?: string | null; // ISO date string
  payment_method?: string | null;
  notes?: string | null;
  // Exclude: payment_id, created_at, updated_at
}
