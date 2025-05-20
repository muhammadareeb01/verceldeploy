// Suggested file: src/hooks/usePayments.ts
// Using standard Tanstack Query hook naming conventions (with 'use' prefix)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
} from "@/api/payments"; // Adjust import path to your payments API file
import { toast } from "sonner"; // Assuming you use sonner for toasts
import {
  CasePayment,
  PaymentCreateData,
  PaymentUpdateData,
  PaymentStatus,
} from "@/types/payments"; // Import from payments.ts
// --- Query Keys ---
// Define query keys for consistent cache management across your application.
export const paymentKeys = {
  all: ["payments"] as const,
  lists: (filters?: {
    caseId?: string;
    status?: PaymentStatus | PaymentStatus[];
  }) => [...paymentKeys.all, "list", filters] as const,
  detail: (paymentId: string) =>
    [...paymentKeys.all, "detail", paymentId] as const,
};

// --- Payment Hooks (Queries) ---

/**
 * Fetches payments based on filters.
 * @param filters - Optional filters { caseId, status }.
 * @returns useQueryResult for CasePayment[]
 */
export const usePaymentsQuery = (filters?: {
  caseId?: string;
  status?: PaymentStatus | PaymentStatus[];
}) => {
  return useQuery<CasePayment[], Error>({
    queryKey: paymentKeys.lists(filters),
    queryFn: () => getPayments(filters), // Call the API function with filters
  });
};

/**
 * Fetches a single payment by ID.
 * @param paymentId - The ID of the payment to fetch.
 * @returns useQueryResult for CasePayment | null
 */
export const usePaymentByIdQuery = (paymentId?: string) => {
  return useQuery<CasePayment | null, Error>({
    queryKey: paymentKeys.detail(paymentId || ""),
    queryFn: () => getPaymentById(paymentId || ""), // Call the API function
    enabled: !!paymentId, // Only run the query if paymentId is provided
  });
};

// --- Payment Hooks (Mutations) ---

/**
 * Mutation to create a new payment.
 * Invalidates payment lists (especially relevant ones by case) on success.
 * @returns useMutationResult for creating a payment
 */
export const useCreatePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<CasePayment, Error, PaymentCreateData>({
    mutationFn: createPayment, // Call the API function
    onSuccess: (newPayment) => {
      // Invalidate lists that might include this new payment
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists({}) }); // Invalidate all lists as a fallback
      if (newPayment.case_id) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.lists({ caseId: newPayment.case_id }),
        });
      }
      queryClient.setQueryData(
        paymentKeys.detail(newPayment.payment_id),
        newPayment
      ); // Add/update detail cache
      toast.success(
        `Payment "${
          newPayment.milestone_description || newPayment.payment_id
        }" created successfully.`
      );
    },
    onError: (error) => {
      toast.error(`Failed to create payment: ${error.message}`);
    },
  });
};

/**
 * Mutation to update an existing payment.
 * Invalidates the specific payment detail and relevant lists on success.
 * @returns useMutationResult for updating a payment
 */
export const useUpdatePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    CasePayment,
    Error,
    { paymentId: string; data: PaymentUpdateData }
  >({
    mutationFn: ({ paymentId, data }) => updatePayment(paymentId, data), // Call the API function
    onSuccess: (updatedPayment) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.detail(updatedPayment.payment_id),
      });
      // Invalidate lists that might be affected (e.g., if status, due_date, case_id changed)
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists({}) }); // Invalidate all lists as a fallback
      if (updatedPayment.case_id) {
        queryClient.invalidateQueries({
          queryKey: paymentKeys.lists({ caseId: updatedPayment.case_id }),
        });
      }

      toast.success(
        `Payment "${
          updatedPayment.milestone_description || updatedPayment.payment_id
        }" updated successfully.`
      );
    },
    onError: (error) => {
      toast.error(`Failed to update payment: ${error.message}`);
    },
  });
};

/**
 * Mutation to delete a payment.
 * Invalidates relevant payment lists and removes the deleted payment from cache.
 * @returns useMutationResult for deleting a payment
 */
export const useDeletePaymentMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deletePayment, // Call the API function
    onSuccess: (data, deletedPaymentId) => {
      // Invalidate relevant lists (requires knowing caseId of deleted payment, which delete fn doesn't return by default)
      // As a fallback, invalidate all lists.
      queryClient.invalidateQueries({ queryKey: paymentKeys.lists({}) });
      queryClient.removeQueries({
        queryKey: paymentKeys.detail(deletedPaymentId),
      });
      toast.success(`Payment "${deletedPaymentId}" deleted successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to delete payment: ${error.message}`);
    },
  });
};
