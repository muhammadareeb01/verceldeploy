// Suggested file: src/api/companies.ts
import { supabase } from "@/integrations/supabase/client";
import type {
  ApiCompanySummary,
  Company,
  CompanyCreateData,
  CompanyUpdateData,
  UserProfile, // Assuming UserProfile is defined
} from "@/types/types"; // Adjust import path to your types file

// --- Helper Functions ---
// Add any necessary helper functions here

// --- Company API Functions ---

/**
 * Fetches a list of companies.
 * @returns Promise<Company[]>
 */
export const getCompanies = async (): Promise<Company[]> => {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*") // Select all fields for Company type
      .order("name", { ascending: true });

    if (error) {
      console.error("Supabase error fetching companies:", error);
      throw new Error(
        `Failed to fetch companies: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return data || []; // Data structure should match Company[]
  } catch (error: any) {
    console.error("Error in getCompanies:", error);
    throw new Error(
      `${
        error.message || "An unexpected error occurred while fetching companies"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Fetches a single company by ID.
 * @param companyId - The UUID of the company.
 * @returns Promise<Company | null>
 */
export const getCompanyById = async (
  companyId: string
): Promise<Company | null> => {
  if (!companyId) return null;
  try {
    const { data, error } = await supabase
      .from("companies")
      .select("*")
      .eq("company_id", companyId) // Assuming PK is company_id
      .maybeSingle(); // Use maybeSingle to return null if not found

    if (error) {
      console.error(`Supabase error fetching company ${companyId}:`, error);
      throw new Error(
        `Failed to fetch company ${companyId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return data; // Data structure should match Company | null
  } catch (error: any) {
    console.error(`Error in getCompanyById ${companyId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching company ${companyId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Fetches a company associated with a specific user ID.
 * Assumes the link is via the user's email matching company.primary_contact_email.
 * @param userId - The ID of the user.
 * @returns Promise<Company | null>
 */
export const getCompanyByUserId = async (
  userId: string
): Promise<Company | null> => {
  if (!userId) return null;
  try {
    // First, fetch the user's email from the profiles table
    const { data: userData, error: userError } = await supabase
      .from("profiles") // Assuming 'profiles' table stores user data including email
      .select("email")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error(
        `Supabase error fetching email for user ${userId}:`,
        userError
      );
      throw new Error(
        `Failed to fetch user email: ${userError.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!userData || !userData.email) {
      console.warn(
        `No email found for user ID ${userId}. Cannot fetch company.`
      );
      return null; // No email means no company can be linked this way
    }

    // Then, fetch the company where primary_contact_email matches the user's email
    const { data: companyData, error: companyError } = await supabase
      .from("companies")
      .select("*") // Select all fields for Company type
      .eq("primary_contact_email", userData.email) // Link via email
      .maybeSingle(); // Use maybeSingle to return null if not found

    if (companyError) {
      console.error(
        `Supabase error fetching company by email ${userData.email}:`,
        companyError
      );
      throw new Error(
        `Failed to fetch company by user email: ${companyError.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return companyData; // Data structure should match Company | null
  } catch (error: any) {
    console.error(`Error in getCompanyByUserId ${userId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching company for user ${userId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Fetches a list of users who can be account managers.
 * Assumes these are users with a specific role (e.g., 'ACCOUNT_MANAGER').
 * @returns Promise<UserProfile[]>
 */
export const getAccountManagers = async (): Promise<UserProfile[]> => {
  try {
    // Assuming account managers have a specific role in the 'profiles' table
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, role, email") // Select fields needed for UserProfile
      .eq("role", "ACCOUNT_MANAGER") // Filter by the 'ACCOUNT_MANAGER' role
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Supabase error fetching account managers:", error);
      throw new Error(
        `Failed to fetch account managers: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // Data structure should match UserProfile[] based on select fields
    return (data || []).map((user) => ({
      ...user,
      role: user.role as UserProfile["role"],
    }));
  } catch (error: any) {
    console.error("Error in getAccountManagers:", error);
    throw new Error(
      `${
        error.message ||
        "An unexpected error occurred while fetching account managers"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Creates a new company.
 * @param companyData - The data for the new company.
 * @returns Promise<Company>
 */
export const createCompany = async (
  companyData: CompanyCreateData
): Promise<Company> => {
  try {
    // Basic validation
    if (!companyData.name || companyData.name.trim() === "") {
      throw new Error("Company name is required.");
    }

    const { data, error } = await supabase
      .from("companies")
      .insert([companyData])
      .select("*") // Select the inserted row
      .single(); // Expect a single result

    if (error) {
      console.error("Supabase error creating company:", error);
      throw new Error(
        `Failed to create company: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      throw new Error("Failed to retrieve created company data.");
    }

    return data; // Data structure should match Company
  } catch (error: any) {
    console.error("Error in createCompany:", error);
    throw new Error(
      `${
        error.message ||
        "An unexpected error occurred while creating the company"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Updates an existing company.
 * @param companyId - The ID of the company to update.
 * @param companyData - The data to update.
 * @returns Promise<Company>
 */
export const updateCompany = async (
  companyId: string,
  companyData: CompanyUpdateData
): Promise<Company> => {
  if (!companyId) {
    throw new Error("Company ID is required for update.");
  }
  if (Object.keys(companyData).length === 0) {
    throw new Error("No update data provided.");
  }
  try {
    const { data, error } = await supabase
      .from("companies")
      .update(companyData)
      .eq("company_id", companyId)
      .select("*") // Select the updated row
      .single(); // Expect a single result

    if (error) {
      console.error(`Supabase error updating company ${companyId}:`, error);
      throw new Error(
        `Failed to update company ${companyId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      throw new Error(
        `Failed to retrieve updated company data for ID ${companyId}.`
      );
    }

    return data; // Data structure should match Company
  } catch (error: any) {
    console.error(`Error in updateCompany ${companyId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while updating company ${companyId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Deletes a company.
 * @param companyId - The ID of the company to delete.
 * @returns Promise<void>
 */
export const deleteCompany = async (companyId: string): Promise<void> => {
  if (!companyId) {
    throw new Error("Company ID is required for deletion.");
  }
  try {
    const { error } = await supabase
      .from("companies")
      .delete()
      .eq("company_id", companyId);

    if (error) {
      console.error(`Supabase error deleting company ${companyId}:`, error);
      throw new Error(
        `Failed to delete company ${companyId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
    // Supabase delete returns null data on success
  } catch (error: any) {
    console.error(`Error in deleteCompany ${companyId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while deleting company ${companyId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};
