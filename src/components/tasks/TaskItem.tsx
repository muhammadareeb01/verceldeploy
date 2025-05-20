import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
// Checkbox is imported but not used, consider removing if not planned for future use.
// import { Checkbox } from "@/components/ui/checkbox"; 
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Button is imported but commented out in usage, AssignTaskButton is used instead.
// import { Button } from "@/components/ui/button"; 
import { CalendarIcon, AlertCircle } from "lucide-react";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/lib/utils";
import { ApiTask, TaskOriginType } from "@/types/tasks";
import AssignTaskButton from "./assignedTaskBtn"; // Ensure filename matches, e.g., assignedTaskBtn.tsx or AssignedTaskButton.tsx

// Interface for related data
interface TaskCategoryListItem { category_id: string; category_name: string; }
interface Service { service_id: string; service_name: string; }
interface Company { company_id: string; name: string; } // Assuming 'name' is the company name field

export interface TaskItemProps {
  taskData: ApiTask;
  userData?: { // This seems to be for a default/logged-in user if taskData.assignedUser is not present
    id: string;
    full_name: string;
    role: string;
    email?: string;
    avatarUrl?: string;
  };
  taskCategoriesList?: TaskCategoryListItem[]; // This list is used to map task_category_id to category_name
  onStatusChange?: (id: string, currentStatus: string | null | undefined) => void;
  onClick?: (task: ApiTask) => void;
}

// CSS classes for priority badges
const priorityClasses: { [key: string]: string } = {
  HIGH: "bg-red-50 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-50 text-yellow-700 border-yellow-200",
  LOW: "bg-green-50 text-green-700 border-green-200",
  NONE: "bg-gray-50 text-gray-700 border-gray-200",
};

// Function to determine priority display string
const getPriorityFromTask = (task: ApiTask): "HIGH" | "MEDIUM" | "LOW" | "NONE" => {
  if (task.is_critical) return "HIGH";
  if (task.priority !== undefined && task.priority !== null) {
    if (task.priority >= 4) return "HIGH";
    if (task.priority === 3) return "MEDIUM";
    if (task.priority <= 2) return "LOW"; // Includes 0, 1, 2
  }
  return "NONE";
};

const TaskItem: React.FC<TaskItemProps> = ({
  taskData,
  userData,
  taskCategoriesList = [], // Default to empty array if not provided
  onStatusChange,
  onClick,
}) => {
  const navigate = useNavigate();

  // Extract necessary values from taskData
  // Ensure one of these ID fields is always present in your ApiTask type for tasks/instances
  const id = taskData.task_id || taskData.task_instance_id || taskData.predefined_task_id || taskData.case_task_id || taskData.company_task_id;
  const title = taskData.task_name || "Untitled Task";
  const description = taskData.description;
  const dueDate = taskData.due_date;
  const priority = getPriorityFromTask(taskData);
  const taskCategoryId = taskData.task_category_id;

  // Fetch service name for predefined tasks
  const { data: service } = useQuery<Service | null>({ // Added | null for return type consistency
    queryKey: ["service", taskData.service_id],
    queryFn: async () => {
      if (taskData.origin_type !== TaskOriginType.PREDEFINED || !taskData.service_id) return null;
      const { data, error } = await supabase
        .from("services")
        .select("service_id, service_name")
        .eq("service_id", taskData.service_id)
        .single();
      if (error) {
        // console.warn(`Failed to fetch service ${taskData.service_id}:`, error.message);
        return null; // Return null on error to prevent query from failing if service not found
      }
      return data || null;
    },
    enabled: taskData.origin_type === TaskOriginType.PREDEFINED && !!taskData.service_id,
  });

  // Fetch company name for company tasks
  const { data: company } = useQuery<Company | null>({ // Added | null
    queryKey: ["company", taskData.company_id],
    queryFn: async () => {
      if (taskData.origin_type !== TaskOriginType.COMPANY || !taskData.company_id) return null;
      const { data, error } = await supabase
        .from("companies") // Ensure this is your companies table name
        .select("company_id, name") // Ensure 'name' is the correct column for company name
        .eq("company_id", taskData.company_id)
        .single();
      if (error) {
        // console.warn(`Failed to fetch company ${taskData.company_id}:`, error.message);
        return null;
      }
      return data || null;
    },
    enabled: taskData.origin_type === TaskOriginType.COMPANY && !!taskData.company_id,
  });

  // Memoize category name lookup. This logic correctly uses the taskCategoriesList prop.
  const categoryName = React.useMemo(() => {
    if (taskCategoryId && taskCategoriesList && taskCategoriesList.length > 0) {
      const category = taskCategoriesList.find((cat) => cat.category_id === taskCategoryId);
      return category ? category.category_name : null;
    }
    return null;
  }, [taskCategoryId, taskCategoriesList]);

  // Determine assigned user information
  const assignedTo = taskData.assignedUser
    ? {
        id: taskData.assignedUser.id,
        name: taskData.assignedUser.full_name,
        avatarUrl: taskData.assignedUser.avatar_url || undefined,
      }
    : userData // Fallback to userData if taskData.assignedUser is not present
    ? {
        id: userData.id,
        name: userData.full_name,
        avatarUrl: userData.avatarUrl,
      }
    : undefined;

  // Handler for checkbox change (Checkbox component is currently commented out)
  // const handleCheckboxChange = (checked: boolean | "indeterminate") => {
  //   if (onStatusChange && id) {
  //     onStatusChange(id, taskData.status); // Pass the current status or the new status based on 'checked'
  //   }
  // };

  // Handler for clicking the card
  const handleCardClick = () => {
    if (onClick) {
      onClick(taskData);
    }
    // Example: navigate to a task detail page if id is available
    // else if (id) {
    //   navigate(`/task-details/${id}`); // Adjust path as needed
    // }
  };

  // Handler for Assign Task button
  const handleAssignTask = () => {
    let formType: "predefined" | "case" | "company";
    let taskIdToAssign: string | undefined; // Use a different variable name to avoid confusion with 'id'

    switch (taskData.origin_type) {
      case TaskOriginType.PREDEFINED:
        formType = "predefined";
        taskIdToAssign = taskData.predefined_task_id;
        break;
      case TaskOriginType.CASE:
        formType = "case";
        taskIdToAssign = taskData.case_task_id;
        break;
      case TaskOriginType.COMPANY:
        formType = "company";
        taskIdToAssign = taskData.company_task_id;
        break;
      default:
        // Attempt to use the generic task_id if origin_type specific ID is not found
        if (taskData.task_id) {
            // You might need a way to determine formType if only task_id is available
            // For now, let's assume if it's not PREDEFINED, CASE, or COMPANY, we can't assign
            console.error("Cannot determine assignment type for task:", taskData);
            return;
        } else {
            console.error("Unknown task type or missing ID for assignment:", taskData);
            return;
        }
    }
    
    if (!taskIdToAssign) {
        console.error("No valid ID found for task assignment:", taskData);
        return;
    }

    navigate(`/task/${taskIdToAssign}?typeform=${formType}`);
  };

  return (
    <Card
      className="mb-4 rounded-lg border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300"
      // Add cursor-pointer only if there's an onClick action
      onClick={onClick || id ? handleCardClick : undefined}
      role={onClick || id ? "button" : undefined}
      tabIndex={onClick || id ? 0 : undefined}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && (onClick || id)) handleCardClick();
      }}
    >
      <CardHeader className="pb-2 border-b border-gray-100">
        <CardTitle className="text-lg text-left font-semibold text-blue-700">
         Task Name : {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-4 px-6">
        <div className="space-y-2 text-left mb-4">
          {/* Company/Service/Case Name */}
          {taskData.origin_type === TaskOriginType.PREDEFINED && service && (
            <div>
              <span className="font-medium text-sm text-gray-500">Service: </span>
              <span className="text-sm text-gray-700">{service.service_name}</span>
            </div>
          )}
          {taskData.origin_type === TaskOriginType.CASE && taskData.case_id && (
            <div>
              <span className="font-medium text-sm text-gray-500">Case ID: </span>
              <span className="text-sm text-gray-700">{taskData.case_id}</span>
            </div>
          )}
          {taskData.origin_type === TaskOriginType.COMPANY && company && (
            <div>
              <span className="font-medium text-sm text-gray-500">Company: </span>
              <span className="text-sm text-gray-700">{company.name}</span>
            </div>
          )}

          {/* Task Category: Displayed if categoryName is found */}
          {categoryName && (
            <div>
              <span className="font-medium text-sm text-gray-500">Category: </span>
              <span className="text-sm text-gray-700">{categoryName}</span>
            </div>
          )}

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-600 line-clamp-2 pt-1" title={description}>
              Description :  {description}
            </p>
          )}
        </div>

        {/* Bottom section: Assignee, Priority, Due Date, Actions */}
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <div className="flex items-center gap-2"> {/* Reduced gap slightly */}
           
          </div>
          <div className="flex items-center gap-3">
            {priority !== "NONE" && (
              <Badge
                variant="outline"
                className={cn("px-2 py-0.5 text-xs", priorityClasses[priority])} // Smaller padding and text
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1).toLowerCase()}
              </Badge>
            )}
            {dueDate && (
              <span className="text-xs text-gray-500 flex items-center">
                <CalendarIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                {formatDate(dueDate)}
              </span>
            )}
            {taskData.is_critical && priority !== "HIGH" && ( // Show critical icon if not already covered by HIGH priority
              <AlertCircle className="h-4 w-4 text-red-500" title="This is a critical task" />
            )}

            <AssignTaskButton
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click event
                handleAssignTask();
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TaskItem;