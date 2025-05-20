
// src/hooks/useCases.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCases, getCaseById, createCase, updateCase, deleteCase } from "@/api/cases";
import { toast } from "sonner";
import { ApiCase, CaseCreateData, CaseUpdateData } from "@/types/types";

// Define query keys for caching
const caseKeys = {
  all: ["cases"] as const,
  lists: () => [...caseKeys.all, "list"] as const,
  list: (filters: any) => [...caseKeys.lists(), filters] as const,
  details: () => [...caseKeys.all, "detail"] as const,
  detail: (id: string) => [...caseKeys.details(), id] as const,
};

/**
 * Hook to fetch cases with optional filters
 */
export const useCasesQuery = (filters?: {
  companyId?: string;
  userId?: string;
  status?: string;
  serviceId?: string;
}) => {
  return useQuery<ApiCase[], Error>({
    queryKey: caseKeys.list(filters || {}),
    queryFn: () => getCases(filters),
  });
};

/**
 * Hook to fetch a specific case by ID
 */
export const useCaseByIdQuery = (caseId?: string) => {
  return useQuery<ApiCase | null, Error>({
    queryKey: caseKeys.detail(caseId || ""),
    queryFn: () => getCaseById(caseId || ""),
    enabled: !!caseId, // Only run query if caseId exists
  });
};

/**
 * Alias for useCasesQuery filtering by company ID
 */
export const useCasesByCompanyIdQuery = (companyId?: string) => {
  return useCasesQuery({ companyId });
};

/**
 * Hook to create a new case
 */
export const useCreateCaseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiCase, Error, CaseCreateData>({
    mutationFn: createCase,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: caseKeys.all,
      });
      toast.success("Case created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create case: ${error.message}`);
    },
  });
};

/**
 * Hook to update an existing case
 */
export const useUpdateCaseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<ApiCase, Error, { caseId: string; data: CaseUpdateData }>({
    mutationFn: ({ caseId, data }) => updateCase(caseId, data),
    onSuccess: (data, { caseId }) => {
      queryClient.invalidateQueries({
        queryKey: caseKeys.detail(caseId),
      });
      queryClient.invalidateQueries({
        queryKey: caseKeys.lists(),
      });
      toast.success("Case updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update case: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a case
 */
export const useDeleteCaseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, string>({
    mutationFn: deleteCase,
    onSuccess: (_, caseId) => {
      queryClient.invalidateQueries({
        queryKey: caseKeys.lists(),
      });
      queryClient.removeQueries({
        queryKey: caseKeys.detail(caseId),
      });
      toast.success("Case deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete case: ${error.message}`);
    },
  });
};
