// Suggested file: src/api/communications.ts
import { supabase } from "@/integrations/supabase/client";
import {
  ApiCommunication,
  UserRole,
  CommunicationType,
  Communication,
  UserDetail,
  CreateCommunicationData,
  UpdateCommunicationData,
} from "@/types/types"; // Import necessary types

// --- Helper Functions ---

// Helper to map role string to UserRole enum
const mapToUserRole = (role: string | null | undefined): UserRole | null => {
  if (!role || typeof role !== "string") {
    return null;
  }
  const validUserRoles: UserRole[] = Object.values(UserRole);
  return validUserRoles.includes(role as UserRole) ? (role as UserRole) : null;
};

// Transforms raw communication data (with joins) into the ApiCommunication structure
const transformApiCommunication = (comm: any): ApiCommunication | null => {
  if (!comm) return null;

  const baseCommunication: Communication = {
    communication_id: comm.communication_id,
    case_id: comm.case_id,
    user_id: comm.user_id,
    comm_type: comm.comm_type,
    content: comm.content,
    sent_at: comm.sent_at,
    read: comm.read,
    created_at: comm.created_at,
    company_id: comm.company_id,
    task_id: comm.task_id,
  };

  const apiCommunication: ApiCommunication = {
    ...baseCommunication,
    sender: comm.sender // Assuming 'sender:profiles' alias in select
      ? {
          id: comm.sender.id,
          full_name: comm.sender.full_name,
          role: mapToUserRole(comm.sender.role),
          email: comm.sender.email,
        }
      : null,
  };

  return apiCommunication;
};

// --- Communication API Functions ---

interface GetCommunicationsFilters {
  caseId?: string;
  companyId?: string;
  taskId?: string;
  userId?: string; // Changed from clientId to userId to reflect schema (profiles.id)
  general?: boolean; // Communications not linked to a specific entity
}

/**
 * Fetches communications based on filters, with sender details.
 * Can filter by case, company, task, or user, or fetch general communications.
 * Note: The DB constraint prevents a single communication from being linked to
 * more than one of case_id, company_id, or task_id simultaneously.
 */
export const getCommunications = async (
  filters: GetCommunicationsFilters = {}
): Promise<ApiCommunication[]> => {
  try {
    const appliedFilters = [
      filters.taskId && "taskId",
      filters.caseId && "caseId",
      filters.companyId && "companyId",
      filters.userId && "userId",
      filters.general && "general",
    ].filter(Boolean);

    if (appliedFilters.length > 1) {
      throw new Error(
        `Only one filter can be applied at a time: received ${appliedFilters.join(
          ", "
        )}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    let query = supabase.from("communications").select(
      `
        *,
        sender:profiles!communications_user_id_fkey ( id, full_name, role, email )
      `
    );

    if (filters.taskId) {
      query = query.eq("task_id", filters.taskId);
    } else if (filters.caseId) {
      query = query.eq("case_id", filters.caseId);
    } else if (filters.companyId) {
      query = query.eq("company_id", filters.companyId);
    } else if (filters.userId) {
      query = query.eq("user_id", filters.userId);
    } else if (filters.general) {
      query = query
        .is("case_id", null)
        .is("company_id", null)
        .is("task_id", null);
    }

    const { data, error } = await query.order("sent_at", { ascending: true });

    if (error) {
      console.error("Supabase error fetching communications:", error);
      throw new Error(
        `Failed to fetch communications: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return (data || [])
      .map(transformApiCommunication)
      .filter((comm): comm is ApiCommunication => comm !== null);
  } catch (error: any) {
    console.error("Error in getCommunications:", error);
    throw new Error(
      `${
        error.message ||
        "An unexpected error occurred while fetching communications"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Fetches a single communication by ID with sender details.
 * @param communicationId - The UUID of the communication.
 */
export const getCommunicationById = async (
  communicationId: string
): Promise<ApiCommunication | null> => {
  if (!communicationId) return null;
  try {
    const { data, error } = await supabase
      .from("communications")
      .select(
        `
        *,
        sender:profiles!communications_user_id_fkey ( id, full_name, role, email )
        `
      )
      .eq("communication_id", communicationId)
      .single();

    if (error) {
      console.error(
        `Supabase error fetching communication ${communicationId}:`,
        error
      );
      if (error.code === "PGRST116") return null; // Not Found
      throw new Error(
        `Failed to fetch communication ${communicationId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    return transformApiCommunication(data);
  } catch (error: any) {
    console.error(`Error in getCommunicationById ${communicationId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching communication ${communicationId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Creates a new communication.
 * @param communicationData - The data for the new communication.
 */
export const createCommunication = async (
  communicationData: CreateCommunicationData
): Promise<ApiCommunication> => {
  try {
    // Ensure only one related entity FK is set based on DB constraint
    if (
      (communicationData.case_id && communicationData.company_id) ||
      (communicationData.case_id && communicationData.task_id) ||
      (communicationData.company_id && communicationData.task_id)
    ) {
      throw new Error(
        "A communication can only be linked to one entity (case, company, or task) at a time."
      );
    }

    const { data, error } = await supabase
      .from("communications")
      .insert([
        {
          case_id: communicationData.case_id,
          company_id: communicationData.company_id,
          task_id: communicationData.task_id,
          user_id: communicationData.user_id,
          comm_type: communicationData.comm_type,
          content: communicationData.content,
          // sent_at and created_at will use DB defaults if not provided
          read: false, // Default to unread for new messages? Adjust if needed.
        },
      ])
      .select(
        // Select with joins to return the full ApiCommunication object
        `
        *,
        sender:profiles!communications_user_id_fkey ( id, full_name, role, email )
        `
      )
      .single();

    if (error) {
      console.error("Supabase error creating communication:", error);
      throw new Error(
        `Failed to create communication: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    const newCommunication = transformApiCommunication(data);
    if (!newCommunication)
      throw new Error("Failed to transform created communication data.");

    return newCommunication;
  } catch (error: any) {
    console.error("Error in createCommunication:", error);
    throw new Error(
      `${
        error.message ||
        "An unexpected error occurred while creating the communication"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Updates an existing communication.
 * @param communicationId - The ID of the communication to update.
 * @param communicationData - The data to update.
 */
export const updateCommunication = async (
  communicationId: string,
  communicationData: UpdateCommunicationData
): Promise<ApiCommunication> => {
  try {
    // Note: This update function doesn't prevent changing FKs in a way that violates the constraint
    // if multiple are being set non-null simultaneously. Relying on DB constraint for validation.

    const { data, error } = await supabase
      .from("communications")
      .update(communicationData)
      .eq("communication_id", communicationId)
      .select(
        // Select with joins to return the full updated ApiCommunication object
        `
        *,
        sender:profiles!communications_user_id_fkey ( id, full_name, role, email )
        `
      )
      .single();

    if (error) {
      console.error(
        `Supabase error updating communication ${communicationId}:`,
        error
      );
      throw new Error(
        `Failed to update communication ${communicationId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    const updatedCommunication = transformApiCommunication(data);
    if (!updatedCommunication)
      throw new Error("Failed to transform updated communication data.");

    return updatedCommunication;
  } catch (error: any) {
    console.error(`Error in updateCommunication ${communicationId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while updating communication ${communicationId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Deletes a communication.
 * @param communicationId - The ID of the communication to delete.
 */
export const deleteCommunication = async (
  communicationId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from("communications")
      .delete()
      .eq("communication_id", communicationId);

    if (error) {
      console.error(
        `Supabase error deleting communication ${communicationId}:`,
        error
      );
      throw new Error(
        `Failed to delete communication ${communicationId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
  } catch (error: any) {
    console.error(`Error in deleteCommunication ${communicationId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while deleting communication ${communicationId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};
