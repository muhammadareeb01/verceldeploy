
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getCommunications,
  getCommunicationById,
  createCommunication,
  updateCommunication,
  deleteCommunication,
} from "@/api/communications";
import { toast } from "sonner";
import {
  ApiCommunication,
  CreateCommunicationData,
  UpdateCommunicationData,
} from "@/types/types";

// --- Query Keys ---
export const communicationKeys = {
  all: ["communications"] as const,
  lists: (filters?: {
    caseId?: string;
    companyId?: string;
    taskId?: string;
    userId?: string;
    general?: boolean;
  }) => [...communicationKeys.all, "list", filters] as const,
  detail: (communicationId: string) =>
    [...communicationKeys.all, "detail", communicationId] as const,
  clientCommunications: (userId?: string) => 
    [...communicationKeys.all, "client", userId] as const,
  clientCases: (userId?: string) =>
    [...communicationKeys.all, "clientCases", userId] as const,
};

// --- Communication Hooks (Queries) ---

/**
 * Fetches communications based on filters.
 * @param filters - Optional filters { caseId, companyId, taskId, userId, general }.
 * @returns useQueryResult for ApiCommunication[]
 */
export const useCommunicationsQuery = (filters?: {
  caseId?: string;
  companyId?: string;
  taskId?: string;
  userId?: string;
  general?: boolean;
}) => {
  return useQuery<ApiCommunication[], Error>({
    queryKey: communicationKeys.lists(filters),
    queryFn: () => getCommunications(filters),
  });
};

/**
 * Fetches communications for a client user.
 * @param userId - The user ID of the client.
 * @returns useQueryResult for ApiCommunication[]
 */
export const useClientCommunicationsQuery = (userId?: string) => {
  return useQuery<ApiCommunication[], Error>({
    queryKey: communicationKeys.clientCommunications(userId),
    queryFn: () => getCommunications({ userId }),
    enabled: !!userId,
  });
};

/**
 * Fetches cases for a client user.
 * @param userId - The user ID of the client.
 * @returns useQueryResult for Array of case objects
 */
export const useClientCasesQuery = (userId?: string) => {
  return useQuery<any[], Error>({
    queryKey: communicationKeys.clientCases(userId),
    queryFn: () => {
      // This should be replaced with actual API call to get cases for client
      // For now returning empty array for type safety
      return Promise.resolve([]);
    },
    enabled: !!userId,
  });
};

/**
 * Fetches a single communication by ID.
 * @param communicationId - The ID of the communication to fetch.
 * @returns useQueryResult for ApiCommunication | null
 */
export const useCommunicationByIdQuery = (communicationId?: string) => {
  return useQuery<ApiCommunication | null, Error>({
    queryKey: communicationKeys.detail(communicationId || ""),
    queryFn: () => getCommunicationById(communicationId || ""),
    enabled: !!communicationId, // Only run the query if communicationId is provided
  });
};

// --- Communication Hooks (Mutations) ---

/**
 * Mutation to create a new communication.
 * Invalidates relevant communication lists on success.
 * @returns useMutationResult for creating a communication
 */
export const useCreateCommunicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiCommunication, Error, CreateCommunicationData>({
    mutationFn: createCommunication,
    onSuccess: (newCommunication) => {
      // Invalidate all communication lists as a fallback, or be more specific
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists({}) });
      // More specific invalidation based on the created communication's links
      if (newCommunication.case_id) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({
            caseId: newCommunication.case_id,
          }),
        });
      }
      if (newCommunication.company_id) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({
            companyId: newCommunication.company_id,
          }),
        });
      }
      if (newCommunication.task_id) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({
            taskId: newCommunication.task_id,
          }),
        });
      }
      if (newCommunication.user_id) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({
            userId: newCommunication.user_id,
          }),
        });
      }
      if (
        !newCommunication.case_id &&
        !newCommunication.company_id &&
        !newCommunication.task_id
      ) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({ general: true }),
        });
      }
      // Add to detail cache
      queryClient.setQueryData(
        communicationKeys.detail(newCommunication.communication_id),
        newCommunication
      );

      toast.success(`Communication created successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to create communication: ${error.message}`);
    },
  });
};

/**
 * Mutation to update an existing communication.
 * Invalidates the specific communication detail and relevant lists on success.
 * @returns useMutationResult for updating a communication
 */
export const useUpdateCommunicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<
    ApiCommunication,
    Error,
    { communicationId: string; data: UpdateCommunicationData }
  >({
    mutationFn: ({ communicationId, data }) =>
      updateCommunication(communicationId, data),
    onSuccess: (updatedCommunication) => {
      queryClient.invalidateQueries({
        queryKey: communicationKeys.detail(
          updatedCommunication.communication_id
        ),
      });
      // Invalidating lists is complex as status/content change might not affect list queries.
      // If list queries involve 'read' status, you might need to invalidate lists.
      // For safety, you could invalidate all lists, or focus on those filtered by the linked entity.
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists({}) }); // Invalidate all lists as a fallback
      if (updatedCommunication.case_id) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({
            caseId: updatedCommunication.case_id,
          }),
        });
      }
      if (updatedCommunication.company_id) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({
            companyId: updatedCommunication.company_id,
          }),
        });
      }
      if (updatedCommunication.task_id) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({
            taskId: updatedCommunication.task_id,
          }),
        });
      }
      if (updatedCommunication.user_id) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({
            userId: updatedCommunication.user_id,
          }),
        });
      }
      if (
        !updatedCommunication.case_id &&
        !updatedCommunication.company_id &&
        !updatedCommunication.task_id
      ) {
        queryClient.invalidateQueries({
          queryKey: communicationKeys.lists({ general: true }),
        });
      }

      toast.success(
        `Communication "${updatedCommunication.communication_id}" updated successfully.`
      );
    },
    onError: (error) => {
      toast.error(`Failed to update communication: ${error.message}`);
    },
  });
};

/**
 * Mutation to delete a communication.
 * Invalidates relevant communication lists and removes the deleted communication from cache.
 * @returns useMutationResult for deleting a communication
 */
export const useDeleteCommunicationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteCommunication,
    onSuccess: (data, deletedCommunicationId) => {
      // Invalidate all communication lists as a fallback (cannot easily know linked entity for invalidation)
      queryClient.invalidateQueries({ queryKey: communicationKeys.lists({}) });
      queryClient.removeQueries({
        queryKey: communicationKeys.detail(deletedCommunicationId),
      });
      toast.success(
        `Communication "${deletedCommunicationId}" deleted successfully.`
      );
    },
    onError: (error) => {
      toast.error(`Failed to delete communication: ${error.message}`);
    },
  });
};
