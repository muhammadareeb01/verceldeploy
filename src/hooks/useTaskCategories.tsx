
// src/hooks/useTaskCategories.ts
// Using standard Tanstack Query hook naming conventions (with 'use' prefix)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTaskCategories, createTaskCategory, updateTaskCategory, deleteTaskCategory } from "@/api/task-categories";
import { TaskCategory } from "@/types/tasks";

// --- Query Keys ---
// Define query keys for consistent cache management
export const taskCategoryKeys = {
  all: ["taskCategories"] as const,
  lists: () => [...taskCategoryKeys.all, "list"] as const,
  // Add a key for detail if you have a getTaskCategoryById function
  // detail: (categoryId: string) => [...taskCategoryKeys.all, "detail", categoryId] as const,
};

// --- Task Category Hook (Query) ---

/**
 * Hook to fetch a list of all task categories.
 * @returns useQueryResult for TaskCategory[]
 */
export const useTaskCategoriesQuery = () => {
  // Standard hook naming
  return useQuery<TaskCategory[], Error>({
    queryKey: taskCategoryKeys.lists(), // Use the defined query key
    queryFn: getTaskCategories, // Call the API function
  });
};

/**
 * Hook to create a new task category
 */
export const useCreateTaskCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (category: { category_name: string; description?: string }) =>
      createTaskCategory(category.category_name, category.description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing task category
 */
export const useUpdateTaskCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { categoryId: string; updates: { category_name?: string; description?: string } }) =>
      updateTaskCategory(data.categoryId, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.lists() });
    },
  });
};

/**
 * Hook to delete a task category
 */
export const useDeleteTaskCategoryMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (categoryId: string) => deleteTaskCategory(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskCategoryKeys.lists() });
    },
  });
};
