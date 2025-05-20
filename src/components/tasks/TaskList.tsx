import React from "react";
import { Loader2 } from "lucide-react";
import TaskItem from "@/components/tasks/TaskItem"; // Assuming this path is correct
import { ApiTask } from "@/types/tasks";
import { useQuery } from "@tanstack/react-query"; // Import useQuery
import { supabase } from "@/integrations/supabase/client"; // Import supabase client

// Define the interface for a category item, or import it if it's shared
interface TaskCategoryListItem {
  category_id: string;
  category_name: string;
}

interface TaskListProps {
  tasks: ApiTask[];
  isLoadingTasks: boolean; // This is for tasks loading specifically
  selectedTab: string;
  onStatusChange: (taskId: string) => void; // Consider passing the full task or more details if needed
  onEdit: (task: ApiTask) => void;
  onDelete: (task: ApiTask) => void;
  onTaskClick: (task: ApiTask) => void;
  // No need to pass taskCategoriesList as a prop to TaskList if fetched here
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  isLoadingTasks, // Loading state for tasks
  selectedTab,
  onStatusChange,
  onEdit,           // onEdit and onDelete are passed but not used in TaskItem in the snippet
  onDelete,         // Consider if TaskItem should have edit/delete buttons
  onTaskClick,
}) => {
  // Fetch all task categories
  const {
    data: taskCategories,
    isLoading: isLoadingCategories, // Loading state for categories
    error: categoriesError,
  } = useQuery<TaskCategoryListItem[]>({
    queryKey: ["taskCategoriesList"], // Unique query key for categories
    queryFn: async () => {
      const { data, error } = await supabase
        .from("task_categories") // Your table name for categories
        .select("category_id, category_name");
      if (error) {
        console.error("Error fetching task categories:", error.message);
        throw error; // Rethrow to let React Query handle the error state
      }
      return data || [];
    },
  });

  const renderTasks = () => {
    // Show loader if either tasks or categories are loading
    if (isLoadingTasks || isLoadingCategories) {
      return (
        <div className="p-8 text-center bg-white rounded-xl shadow-lg">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-600" />
          <p className="mt-3 text-gray-600 text-lg">
            {isLoadingTasks && isLoadingCategories ? "Loading tasks and categories..." : isLoadingTasks ? "Loading tasks..." : "Loading categories..."}
          </p>
        </div>
      );
    }

    if (categoriesError) {
        return (
            <div className="p-8 text-center bg-white rounded-xl shadow-lg">
                <p className="text-red-600 text-lg">Error loading categories: {(categoriesError as Error).message}</p>
            </div>
        )
    }

    if (tasks.length === 0) {
      return (
        <div className="p-8 text-center bg-white rounded-xl shadow-lg">
          <p className="text-gray-600 text-lg">
            {selectedTab === "all"
              ? "No tasks to display."
              : `No ${selectedTab.toLowerCase()} tasks to display.`}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4 animate-fade-in">
        {tasks.map((task) => (
          <TaskItem
            // Ensure task.task_id or a suitable unique identifier is present for the key
            key={task.task_id || task.task_instance_id || task.predefined_task_id || task.case_task_id || task.company_task_id || JSON.stringify(task)}
            taskData={task}
            userData={task.assignedUser} // This seems correct if ApiTask has assignedUser
            // Pass the fetched taskCategories here
            taskCategoriesList={taskCategories || []}
            // Ensure onStatusChange in TaskItemProps matches what TaskItem expects
            // The current TaskItem expects (id: string, currentStatus: string | null | undefined)
            // Adjusting the call here or the definition in TaskItem
            onStatusChange={(taskIdFromItem, currentStatus) => onStatusChange(taskIdFromItem)} // Simplified for now, ensure TaskItem calls it correctly
            onClick={() => onTaskClick(task)}
          />
        ))}
      </div>
    );
  };

  return <>{renderTasks()}</>;
};

export default TaskList;