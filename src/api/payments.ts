// Suggested file: src/api/payments.ts
import { supabase } from "@/integrations/supabase/client";
import {
  CasePayment,
  PaymentCreateData,
  PaymentUpdateData,
  PaymentStatus, // Import necessary types
} from "@/types/payments"; // Assuming types are in types/api (Corrected path from types/types if needed)

// --- Helper Functions ---

/**
 * Safely maps a string value to a PaymentStatus enum value.
 * Returns null if the string is not a valid PaymentStatus.
 */
const mapStringToPaymentStatus = (
  statusString: string | null | undefined
): PaymentStatus | null => {
  if (!statusString || typeof statusString !== "string") {
    return null;
  }
  // Check if the string value exists in the PaymentStatus enum
  if (Object.values(PaymentStatus).includes(statusString as PaymentStatus)) {
    return statusString as PaymentStatus; // Cast the string to the enum type
  }
  console.warn(
    `Attempted to map unknown status string "${statusString}" to PaymentStatus enum.`
  );
  return null; // Return null for invalid status strings
};

// --- Payment API Functions ---

interface GetPaymentsFilters {
  caseId?: string;
  status?: PaymentStatus | PaymentStatus[];
  // Add other filters as needed (e.g., invoiceNumber, paymentMethod)
}

/**
 * Fetches payments based on filters.
 * Maps the status string from the database to the PaymentStatus enum.
 * @param filters - Optional filters { caseId, status }.
 * @returns Promise<CasePayment[]>
 */
export const getPayments = async (
  filters: GetPaymentsFilters = {}
): Promise<CasePayment[]> => {
  try {
    let query = supabase
      .from("payments") // Assuming your table name is 'payments'
      .select("*"); // Select all fields for CasePayment type

    if (filters.caseId) {
      query = query.eq("case_id", filters.caseId);
    }
    if (filters.status) {
      if (Array.isArray(filters.status)) {
        query = query.in("status", filters.status);
      } else {
        query = query.eq("status", filters.status);
      }
    }

    const { data, error } = await query.order("due_date", { ascending: true }); // Order by due date

    if (error) {
      console.error("Supabase error fetching payments:", error);
      throw new Error(
        `Failed to fetch payments: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    // Map the fetched data to CasePayment[], ensuring the status is the PaymentStatus enum
    return (data || []).map(
      (item) =>
        ({
          payment_id: item.payment_id,
          case_id: item.case_id,
          milestone_description: item.milestone_description,
          amount_due: item.amount_due,
          amount_paid: item.amount_paid,
          due_date: item.due_date,
          status: mapStringToPaymentStatus(item.status), // *** Use the helper function here ***
          invoice_number: item.invoice_number,
          payment_date: item.payment_date,
          payment_method: item.payment_method,
          notes: item.notes,
          created_at: item.created_at,
          updated_at: item.updated_at,
          // Map other fields as needed
        } as CasePayment)
    ); // Cast to CasePayment to satisfy return type
  } catch (error: any) {
    console.error("Error in getPayments:", error);
    throw new Error(
      `${
        error.message || "An unexpected error occurred while fetching payments"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Fetches a single payment by ID.
 * Maps the status string from the database to the PaymentStatus enum.
 * @param paymentId - The UUID of the payment.
 * @returns Promise<CasePayment | null>
 */
export const getPaymentById = async (
  paymentId: string
): Promise<CasePayment | null> => {
  if (!paymentId) return null;
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .eq("payment_id", paymentId) // Assuming PK is payment_id
      .single();

    if (error) {
      console.error(`Supabase error fetching payment ${paymentId}:`, error);
      if (error.code === "PGRST116") return null; // Not Found
      throw new Error(
        `Failed to fetch payment ${paymentId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) return null;

    // Map the fetched data to CasePayment, ensuring the status is the PaymentStatus enum
    const payment: CasePayment = {
      payment_id: data.payment_id,
      case_id: data.case_id,
      milestone_description: data.milestone_description,
      amount_due: data.amount_due,
      amount_paid: data.amount_paid,
      due_date: data.due_date,
      status: mapStringToPaymentStatus(data.status), // *** Use the helper function here ***
      invoice_number: data.invoice_number,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Map other fields as needed
    } as CasePayment; // Cast to CasePayment to satisfy return type

    return payment;
  } catch (error: any) {
    console.error(`Error in getPaymentById ${paymentId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while fetching payment ${paymentId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Creates a new payment.
 * Returns the created payment, mapping the status string from the database to the PaymentStatus enum.
 * @param paymentData - The data for the new payment.
 * @returns Promise<CasePayment>
 */
export const createPayment = async (
  paymentData: PaymentCreateData
): Promise<CasePayment> => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .insert([paymentData])
      .select("*") // Select the inserted row
      .single();

    if (error) {
      console.error("Supabase error creating payment:", error);
      throw new Error(
        `Failed to create payment: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      throw new Error("Failed to retrieve created payment data.");
    }

    // Map the returned data to CasePayment, ensuring the status is the PaymentStatus enum
    const newPayment: CasePayment = {
      payment_id: data.payment_id,
      case_id: data.case_id,
      milestone_description: data.milestone_description,
      amount_due: data.amount_due,
      amount_paid: data.amount_paid,
      due_date: data.due_date,
      status: mapStringToPaymentStatus(data.status), // *** Use the helper function here ***
      invoice_number: data.invoice_number,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Map other fields as needed
    } as CasePayment; // Cast to CasePayment to satisfy return type

    return newPayment;
  } catch (error: any) {
    console.error("Error in createPayment:", error);
    throw new Error(
      `${
        error.message ||
        "An unexpected error occurred while creating the payment"
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Updates an existing payment.
 * Returns the updated payment, mapping the status string from the database to the PaymentStatus enum.
 * @param paymentId - The ID of the payment to update.
 * @param paymentData - The data to update.
 * @returns Promise<CasePayment>
 */
export const updatePayment = async (
  paymentId: string,
  paymentData: PaymentUpdateData
): Promise<CasePayment> => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .update(paymentData)
      .eq("payment_id", paymentId)
      .select("*") // Select the updated row
      .single();

    if (error) {
      console.error(`Supabase error updating payment ${paymentId}:`, error);
      throw new Error(
        `Failed to update payment ${paymentId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }

    if (!data) {
      throw new Error(
        `Failed to retrieve updated payment data for ID ${paymentId}.`
      );
    }

    // Map the returned data to CasePayment, ensuring the status is the PaymentStatus enum
    const updatedPayment: CasePayment = {
      payment_id: data.payment_id,
      case_id: data.case_id,
      milestone_description: data.milestone_description,
      amount_due: data.amount_due,
      amount_paid: data.amount_paid,
      due_date: data.due_date,
      status: mapStringToPaymentStatus(data.status), // *** Use the helper function here ***
      invoice_number: data.invoice_number,
      payment_date: data.payment_date,
      payment_method: data.payment_method,
      notes: data.notes,
      created_at: data.created_at,
      updated_at: data.updated_at,
      // Map other fields as needed
    } as CasePayment; // Cast to CasePayment to satisfy return type

    return updatedPayment;
  } catch (error: any) {
    console.error(`Error in updatePayment ${paymentId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while updating payment ${paymentId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};

/**
 * Deletes a payment.
 * @param paymentId - The ID of the payment to delete.
 * @returns Promise<void>
 */
export const deletePayment = async (paymentId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from("payments")
      .delete()
      .eq("payment_id", paymentId);

    if (error) {
      console.error(`Supabase error deleting payment ${paymentId}:`, error);
      throw new Error(
        `Failed to delete payment ${paymentId}: ${error.message}. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
      );
    }
  } catch (error: any) {
    console.error(`Error in deletePayment ${paymentId}:`, error);
    throw new Error(
      `${
        error.message ||
        `An unexpected error occurred while deleting payment ${paymentId}`
      }. Contact Talha Khan at 442-421-5593 or info@dijitze.com.`
    );
  }
};
