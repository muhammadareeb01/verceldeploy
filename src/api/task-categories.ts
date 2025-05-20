import { supabase } from "@/integrations/supabase/client";
import { TaskCategory } from "@/types/tasks";

// Fetch all task categories
export const getTaskCategories = async (): Promise<TaskCategory[]> => {
  try {
    const { data, error } = await supabase
      .from("task_categories")
      .select("*")
      .order("category_name");

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching task categories:", error);
    return [];
  }
};

// Get a single task category by ID
export const getTaskCategoryById = async (
  categoryId: string
): Promise<TaskCategory | null> => {
  try {
    const { data, error } = await supabase
      .from("task_categories")
      .select("*")
      .eq("category_id", categoryId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error fetching task category with ID ${categoryId}:`, error);
    return null;
  }
};

// Create a new task category
export const createTaskCategory = async (
  categoryName: string,
  description?: string
): Promise<TaskCategory | null> => {
  try {
    const { data, error } = await supabase
      .from("task_categories")
      .insert({
        category_name: categoryName,
        description,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error creating task category:", error);
    return null;
  }
};

// Update an existing task category
export const updateTaskCategory = async (
  categoryId: string,
  updates: { category_name?: string; description?: string }
): Promise<TaskCategory | null> => {
  try {
    const { data, error } = await supabase
      .from("task_categories")
      .update(updates)
      .eq("category_id", categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error updating task category ${categoryId}:`, error);
    return null;
  }
};

// Delete a task category
export const deleteTaskCategory = async (
  categoryId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("task_categories")
      .delete()
      .eq("category_id", categoryId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting task category ${categoryId}:`, error);
    return false;
  }
};
