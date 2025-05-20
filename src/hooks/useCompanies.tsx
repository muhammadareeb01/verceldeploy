// Suggested file: src/hooks/useCompanies.ts
// Using standard Tanstack Query hook naming conventions (with 'use' prefix)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  getAccountManagers,
  getCompanyByUserId,
} from "@/api/companies"; // Adjust import path to your companies API file
import { toast } from "sonner"; // Assuming you use sonner for toasts
import {
  ApiCompanySummary,
  Company,
  CompanyCreateData,
  CompanyUpdateData,
  UserProfile, // Import UserProfile
} from "@/types/types";

// --- Query Keys ---
// Define query keys for consistent cache management across your application.
export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const, // For lists (now full Company[])
  detail: (companyId: string) =>
    [...companyKeys.all, "detail", companyId] as const,
  accountManagers: () => [...companyKeys.all, "accountManagers"] as const, // Example key
  byUserId: (userId: string | undefined) =>
    [...companyKeys.all, "byUserId", userId] as const,
};

// --- Company Hooks (Queries) ---

/**
 * Fetches a list of companies with details required for the table view.
 * Now returns Company[] instead of ApiCompanySummary[].
 * @returns useQueryResult for Company[]
 */
export const useCompaniesQuery = () => {
  // Standard hook naming
  return useQuery<Company[], Error>({
    // Updated return type
    queryKey: companyKeys.lists(),
    queryFn: getCompanies, // This now returns Company[]
  });
};
/**
 * Hook to fetch potential account managers.
 * Calls the getAccountManagers API function.
 * @returns useQueryResult for UserProfile[]
 */
export const useAccountManagersQuery = () => {
  // Standard hook naming
  return useQuery<UserProfile[], Error>({
    queryKey: companyKeys.accountManagers(), // Use the defined query key
    queryFn: getAccountManagers, // Call the new API function
    // Optional: Add `enabled` property if you only want the query to run conditionally
    // enabled: someCondition, // e.g., enabled: modalIsOpen
  });
};
/**
 * Fetches a single company by ID.
 * @param companyId - The ID of the company to fetch.
 * @returns useQueryResult for Company | null
 */
export const useCompanyByIdQuery = (companyId?: string) => {
  // Standard hook naming
  return useQuery<Company | null, Error>({
    queryKey: companyKeys.detail(companyId || ""),
    queryFn: () => getCompanyById(companyId || ""),
    enabled: !!companyId, // Only run the query if companyId is provided
  });
};

// --- Company Hooks (Mutations) ---

/**
 * Mutation to create a new company.
 * Invalidates the companies list on success.
 * @returns useMutationResult for creating a company
 */
export const useCreateCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<Company, Error, CompanyCreateData>({
    mutationFn: createCompany,
    onSuccess: (newCompany) => {
      // Invalidate the list of companies to refetch and include the new company
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      // Optionally, add the new company to the detail cache
      queryClient.setQueryData(
        companyKeys.detail(newCompany.company_id),
        newCompany
      );
      toast.success(`Company "${newCompany.name}" created successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to create company: ${error.message}`);
    },
  });
};

/**
 * Mutation to update an existing company.
 * Invalidates the specific company detail and the companies list on success.
 * @returns useMutationResult for updating a company
 */
export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    Company,
    Error,
    { companyId: string; data: CompanyUpdateData }
  >({
    mutationFn: ({ companyId, data }) => updateCompany(companyId, data),
    onSuccess: (updatedCompany) => {
      // Invalidate the specific company detail
      queryClient.invalidateQueries({
        queryKey: companyKeys.detail(updatedCompany.company_id),
      });
      // Invalidate the list of companies as details like name, industry might affect display/sorting
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      toast.success(`Company "${updatedCompany.name}" updated successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to update company: ${error.message}`);
    },
  });
};

/**
 * Mutation to delete a company.
 * Invalidates the companies list and removes the deleted company from cache.
 * @returns useMutationResult for deleting a company
 */
export const useDeleteCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCompany,
    onSuccess: (data, deletedCompanyId) => {
      // Invalidate the list of companies
      queryClient.invalidateQueries({ queryKey: companyKeys.lists() });
      // Remove the deleted company from the cache
      queryClient.removeQueries({
        queryKey: companyKeys.detail(deletedCompanyId),
      });
      // Also invalidate lists of entities linked to companies if necessary (e.g., cases, communications)
      queryClient.invalidateQueries({ queryKey: ["cases"] });
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["communications"] });

      toast.success(`Company "${deletedCompanyId}" deleted successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to delete company: ${error.message}`);
    },
  });
};
/**
 * Hook to fetch a company associated with a specific user ID.
 * Calls the getCompanyByUserId API function.
 * @param userId - The ID of the user.
 * @returns useQueryResult for Company | null
 */
export const useCompanyByUserIdQuery = (userId?: string) => {
  // Accept optional userId
  return useQuery<Company | null, Error>({
    queryKey: companyKeys.byUserId(userId), // Use the defined query key with userId
    queryFn: () => getCompanyByUserId(userId!), // Call the API function (use non-null assertion as enabled check handles null)
    enabled: !!userId, // Only run the query if userId is provided
    staleTime: 1000 * 60 * 5, // Cache data for 5 minutes
  });
};
