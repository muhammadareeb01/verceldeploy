import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTasksByFilters,
  getTaskById,
  getTasksByCaseId,
  getTasksByCompanyId,
  getTasksByAssignedUserId,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  GetTasksFilters,
  getTasksCountByFilters,
} from "@/api/tasks";
import { toast } from "sonner";
import {
  ApiTask,
  TaskCreateData,
  TaskUpdateData,
  TaskStatus,
  TaskFilter,
  TaskSort,
} from "@/types/tasks";

// --- Query Keys ---
export const taskKeys = {
  all: ["tasks"] as const,
  lists: (filters?: {
    caseId?: string;
    companyId?: string;
    assignedToUserId?: string;
    status?: TaskStatus | TaskStatus[];
    isCritical?: boolean;
    taskCategoryId?: string;
  }) => [...taskKeys.all, "list", filters] as const,
  detail: (taskId: string) => [...taskKeys.all, "detail", taskId] as const,
  byCase: (caseId: string) => [...taskKeys.all, "byCase", caseId] as const,
  byCompany: (companyId: string) =>
    [...taskKeys.all, "byCompany", companyId] as const,
  byAssignedUser: (userId: string) =>
    [...taskKeys.all, "byAssignedUser", userId] as const,
  countByCase: (caseId: string | undefined) =>
    [...taskKeys.all, "countByCase", caseId] as const,
  count: (filters: GetTasksFilters) => ["tasks", "count", filters] as const,
};

// --- Task Hooks (Queries) ---

/**
 * Fetches tasks based on filters.
 * @param filters - Optional filters { caseId, companyId, assignedToUserId, status, isCritical, taskCategoryId }.
 * @param sort - Optional sort configuration { field, direction }.
 * @returns useQueryResult for ApiTask[]
 */
export const useTasksQuery = (filters?: TaskFilter, sort?: TaskSort) => {
  return useQuery<ApiTask[], Error>({
    queryKey: taskKeys.lists(filters),
    queryFn: () => getTasksByFilters(filters),
  });
};

/**
 * Fetches tasks based on filters.
 * @param filters - Optional filters { caseId, companyId, assignedToUserId, status, isCritical, taskCategoryId }.
 * @returns useQueryResult for ApiTask[]
 */
export const useTasksByFilterQuery = (filters?: TaskFilter) => {
  return useQuery<ApiTask[], Error>({
    queryKey: taskKeys.lists(filters),
    queryFn: () => getTasksByFilters(filters),
  });
};

/**
 * Fetches tasks for a specific case ID.
 * @param caseId - The UUID of the case.
 * @returns useQueryResult for ApiTask[]
 */
export const useTasksByCaseIdQuery = (caseId?: string) => {
  return useQuery<ApiTask[], Error>({
    queryKey: taskKeys.byCase(caseId || ""),
    queryFn: () => getTasksByCaseId(caseId || ""),
    enabled: !!caseId, // Only run the query if caseId is provided
  });
};

/**
 * Fetches tasks for a specific company ID.
 * @param companyId - The UUID of the company.
 * @returns useQueryResult for ApiTask[]
 */
export const useTasksByCompanyIdQuery = (companyId?: string) => {
  return useQuery<ApiTask[], Error>({
    queryKey: taskKeys.byCompany(companyId || ""),
    queryFn: () => getTasksByCompanyId(companyId || ""),
    enabled: !!companyId, // Only run the query if companyId is provided
  });
};

/**
 * Fetches tasks assigned to a specific user ID.
 * @param userId - The UUID of the assigned user.
 * @returns useQueryResult for ApiTask[]
 */
export const useTasksByAssignedUserIdQuery = (userId?: string) => {
  return useQuery<ApiTask[], Error>({
    queryKey: taskKeys.byAssignedUser(userId || ""),
    queryFn: () => getTasksByAssignedUserId(userId || ""),
    enabled: !!userId, // Only run the query if userId is provided
  });
};

/**
 * Fetches a single task by ID.
 * @param taskId - The ID of the task to fetch.
 * @returns useQueryResult for ApiTask | null
 */
export const useTaskByIdQuery = (taskId?: string) => {
  return useQuery<ApiTask | null, Error>({
    queryKey: taskKeys.detail(taskId || ""),
    queryFn: () => getTaskById(taskId || ""),
    enabled: !!taskId, // Only run the query if taskId is provided
  });
};

// --- Task Hooks (Mutations) ---

/**
 * Mutation to create a new task.
 * Invalidates task lists (especially relevant ones by case/company/user) on success.
 * @returns useMutationResult for creating a task
 */
export const useCreateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiTask, Error, TaskCreateData>({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Invalidate lists that might include this new task
      queryClient.invalidateQueries({ queryKey: taskKeys.lists({}) }); // Invalidate all lists as a fallback
      if (newTask.case_id) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byCase(newTask.case_id),
        });
      }
      if (newTask.company_id) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byCompany(newTask.company_id),
        });
      }
      if (newTask.assigned_to) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byAssignedUser(newTask.assigned_to),
        });
      }
      queryClient.setQueryData(taskKeys.detail(newTask.task_id), newTask); // Add/update detail cache
      toast.success(`Task "${newTask.task_name}" created successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`);
    },
  });
};

/**
 * Mutation to update an existing task.
 * Invalidates the specific task detail and relevant lists on success.
 * @returns useMutationResult for updating a task
 */
export const useUpdateTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiTask, Error, { taskId: string; data: TaskUpdateData }>({
    mutationFn: ({ taskId, data }) => updateTask(taskId, data),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(updatedTask.task_id),
      });
      // Invalidate lists that might be affected (e.g., if status, assigned_to, case_id, or company_id changed)
      queryClient.invalidateQueries({ queryKey: taskKeys.lists({}) }); // Invalidate all lists as a fallback
      if (updatedTask.case_id) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byCase(updatedTask.case_id),
        });
      }
      if (updatedTask.company_id) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byCompany(updatedTask.company_id),
        });
      }
      if (updatedTask.assigned_to) {
        queryClient.invalidateQueries({
          queryKey: taskKeys.byAssignedUser(updatedTask.assigned_to),
        });
      }
      toast.success(`Task "${updatedTask.task_name}" updated successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`);
    },
  });
};

/**
 * Mutation to delete a task.
 * Invalidates relevant task lists and removes the deleted task from cache.
 * @returns useMutationResult for deleting a task
 */
export const useDeleteTaskMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTask,
    onSuccess: (data, deletedTaskId) => {
      // Invalidate relevant lists (requires knowing caseId/companyId/assignedToUserId of deleted task, which delete fn doesn't return)
      queryClient.invalidateQueries({ queryKey: taskKeys.lists({}) }); // Invalidate all lists as a fallback
      queryClient.removeQueries({ queryKey: taskKeys.detail(deletedTaskId) });
      toast.success(`Task "${deletedTaskId}" deleted successfully.`);
    },
    onError: (error) => {
      toast.error(`Failed to delete task: ${error.message}`);
    },
  });
};

/**
 * Mutation hook to toggle the status of a task.
 * Invalidates the task detail and relevant task lists on success.
 * @returns useMutationResult for toggling task status
 */
export const useToggleTaskStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation<ApiTask, Error, string>({
    // Input is the task ID (string)
    mutationFn: toggleTaskStatus, // Call the API function
    onSuccess: (updatedTask) => {
      // Invalidate the specific task detail query
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(updatedTask.task_id),
      });
      // Invalidate task lists that might include this task (e.g., list for the case)
      // If your taskKeys.lists function accepts filters, you can be more specific.
      // For example: queryClient.invalidateQueries({ queryKey: taskKeys.lists({ caseId: updatedTask.case_id }) });
      queryClient.invalidateQueries({ queryKey: taskKeys.lists({}) }); // Invalidate all lists as a fallback

      toast.success(
        `Task "${updatedTask.task_name}" status updated to ${updatedTask.status}.`
      );
    },
    onError: (error) => {
      toast.error(`Failed to update task status: ${error.message}`);
    },
  });
};

// Hook to get task count by filters
export const useTasksCountByFilters = (filters: GetTasksFilters = {}) => {
  return useQuery({
    queryKey: taskKeys.count(filters),
    queryFn: () => getTasksCountByFilters(filters),
  });
};
