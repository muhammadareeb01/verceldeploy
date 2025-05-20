// Suggested file: src/api/cases.ts
import { supabase } from "@/integrations/supabase/client";
import {
  UserRole,
  ApiCase,
  Case,
  CaseCreateData,
  CaseUpdateData,
  ApiCompanySummary,
  UserDetail,
  Service,
  Company,
  CaseStatus,
} from "@/types/types"; // Import necessary types

// --- Helper Functions ---

// Helper to map role string to UserRole enum
const mapToUserRole = (role: string | null | undefined): UserRole | null => {
  if (!role || typeof role !== "string") {
    return null;
  }
  
  // Use type assertion to match the enum values
  if (
    role === UserRole.ADMIN ||
    role === UserRole.MANAGER ||
    role === UserRole.OFFICER ||
    role === UserRole.STAFF ||
    role === UserRole.CLIENT ||
    role === UserRole.ACCOUNT_MANAGER ||
    role === UserRole.DOCUMENT_SPECIALIST ||
    role === UserRole.FINANCE_OFFICER
  ) {
    return role as UserRole;
  }
  
  return null;
};

// Transforms raw case data (with joins) into the ApiCase structure
const transformApiCase = (c: any): ApiCase | null => {
  if (!c) return null;

  // Basic case data from the 'cases' table row
  const baseCase: Case = {
    case_id: c.case_id,
    company_id: c.company_id,
    service_id: c.service_id,
    case_status: c.case_status,
    priority: c.priority,
    start_date: c.start_date,
    target_date: c.target_date,
    actual_completion_date: c.actual_completion_date,
    progress_percent: c.progress_percent,
    assigned_to: c.assigned_to,
    notes: c.notes,
    total_budget: c.total_budget,
    total_spent: c.total_spent,
    remaining_budget: c.remaining_budget,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };

  // Construct the final ApiCase object with joined data
  const apiCase: ApiCase = {
    ...baseCase,
    service: c.services
      ? {
          service_id: c.services.service_id,
          service_name: c.services.service_name,
          description: c.services.description,
          base_cost: c.services.base_cost || 0, // Add base_cost property
        }
      : null,
    company: c.companies
      ? {
          company_id: c.companies.company_id,
          name: c.companies.name,
          primary_contact_name: c.companies.primary_contact_name,
        }
      : null,
    assignedUser: c.assignedUser // Assuming 'assignedUser:profiles!cases_assigned_to_fkey' alias
      ? {
          id: c.assignedUser.id,
          full_name: c.assignedUser.full_name,
          role: mapToUserRole(c.assignedUser.role),
          email: c.assignedUser.email,
        }
      : null,
  };

  return apiCase;
};

// --- Case API Functions ---

/**
 * Fetches all cases with related service, company, and assigned user details.
 */
export const getCases = async (): Promise<ApiCase[]> => {
  try {
    const { data, error } = await supabase
      .from("cases")
      .select(
        `
        *,
        services ( service_id, service_name, description ),
        companies ( company_id, name, primary_contact_name ),
        assignedUser:profiles!cases_assigned_to_fkey ( id, full_name, role, email )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error fetching cases:", error);
      throw new Error(
        `Failed to fetch cases: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return (data || [])
      .map(transformApiCase)
      .filter((c): c is ApiCase => c !== null);
  } catch (error: any) {
    console.error("Error in getCases:", error);
    throw new Error(
      `${
        error.message || "An unexpected error occurred while fetching cases"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Fetches a single case by ID with related details.
 * @param caseId - The UUID of the case.
 */
export const getCaseById = async (caseId: string): Promise<ApiCase | null> => {
  if (!caseId) return null;
  try {
    const { data, error } = await supabase
      .from("cases")
      .select(
        `
        *,
        services ( service_id, service_name, description ),
        companies ( company_id, name, primary_contact_name ),
        assignedUser:profiles!cases_assigned_to_fkey ( id, full_name, role, email )
        `
      )
      .eq("case_id", caseId)
      .single();

    if (error) {
      console.error(`Supabase error fetching case ${caseId}:`, error);
      if (error.code === "PGRST116") return null; // Not Found
      throw new Error(
        `Failed to fetch case ${caseId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return transformApiCase(data);
  } catch (error: any) {
    console.error(`Error in getCaseById ${caseId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching case ${caseId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Fetches cases for a specific company ID with related details.
 * @param companyId - The UUID of the company (companies.company_id).
 */
export const getCasesByCompanyId = async (
  companyId: string
): Promise<ApiCase[]> => {
  if (!companyId) return [];

  try {
    const { data, error } = await supabase
      .from("cases")
      .select(
        `
        *,
        services ( service_id, service_name, description ),
        companies ( company_id, name, primary_contact_name ),
        assignedUser:profiles!cases_assigned_to_fkey ( id, full_name, role, email )
      `
      )
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error(
        `Supabase error fetching cases for company ${companyId}:`,
        error
      );
      throw new Error(
        `Failed to fetch cases for company ${companyId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return (data || [])
      .map(transformApiCase)
      .filter((c): c is ApiCase => c !== null);
  } catch (error: any) {
    console.error(`Error in getCasesByCompanyId for ${companyId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching cases for company ${companyId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Creates a new case.
 * @param caseData - The data for the new case.
 */
export const createCase = async (
  caseData: CaseCreateData
): Promise<ApiCase> => {
  try {
    const { data, error } = await supabase
      .from("cases")
      .insert([caseData])
      .select(
        // Select with joins to return the full ApiCase object
        `
        *,
        services ( service_id, service_name, description ),
        companies ( company_id, name, primary_contact_name ),
        assignedUser:profiles!cases_assigned_to_fkey ( id, full_name, role, email )
        `
      )
      .single();

    if (error) {
      console.error("Supabase error creating case:", error);
      throw new Error(
        `Failed to create case: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    const newCase = transformApiCase(data);
    if (!newCase) throw new Error("Failed to transform created case data.");

    return newCase;
  } catch (error: any) {
    console.error("Error in createCase:", error);
    throw new Error(
      `${
        error.message || "An unexpected error occurred while creating the case"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Updates an existing case.
 * @param caseId - The ID of the case to update.
 * @param caseData - The data to update.
 */
export const updateCase = async (
  caseId: string,
  caseData: CaseUpdateData
): Promise<ApiCase> => {
  try {
    const { data, error } = await supabase
      .from("cases")
      .update(caseData)
      .eq("case_id", caseId)
      .select(
        // Select with joins to return the full updated ApiCase object
        `
        *,
        services ( service_id, service_name, description ),
        companies ( company_id, name, primary_contact_name ),
        assignedUser:profiles!cases_assigned_to_fkey ( id, full_name, role, email )
        `
      )
      .single();

    if (error) {
      console.error(`Supabase error updating case ${caseId}:`, error);
      throw new Error(
        `Failed to update case ${caseId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    const updatedCase = transformApiCase(data);
    if (!updatedCase) throw new Error("Failed to transform updated case data.");

    return updatedCase;
  } catch (error: any) {
    console.error(`Error in updateCase ${caseId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while updating case ${caseId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Deletes a case.
 * @param caseId - The ID of the case to delete.
 */
export const deleteCase = async (caseId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("cases")
      .delete()
      .eq("case_id", caseId);

    if (error) {
      console.error(`Supabase error deleting case ${caseId}:`, error);
      throw new Error(
        `Failed to delete case ${caseId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
  } catch (error: any) {
    console.error(`Error in deleteCase ${caseId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while deleting case ${caseId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};
