// src/components/tasks/TaskEditModal.tsx
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  // Updated to new instance-specific types
  // ApiTaskInstance,
  // TaskInstanceStatus,
  // TaskInstanceUpdateData,
} from "@/types/tasks"; // Adjust path as needed
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, AlertCircle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Import updated react-query hooks for task instances
// import {
//   useTaskInstanceByIdQuery,  // UPDATED hook name
//   useUpdateTaskInstanceMutation, // UPDATED hook name
// } from "@/hooks/useTasks"; // Adjust path as needed, or to useTaskInstances.ts

interface TaskEditModalProps {
  taskInstanceId: string; // UPDATED: The ID of the task instance to edit
  isOpen: boolean;
  onClose: () => void;
}

// Define a threshold for critical priority, e.g., 4 or 5
const CRITICAL_PRIORITY_THRESHOLD = 4;
const DEFAULT_NON_CRITICAL_PRIORITY = 1; // Or whatever your default non-critical priority is
const DEFAULT_CRITICAL_PRIORITY = CRITICAL_PRIORITY_THRESHOLD;

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  taskInstanceId,
  isOpen,
  onClose,
}) => {
  const {
    data: taskInstance, // RENAMED for clarity
    isLoading: isLoadingTask,
    error: fetchError,
  } = useTaskInstanceByIdQuery(taskInstanceId); // UPDATED hook and prop

  const updateMutation = useUpdateTaskInstanceMutation(); // UPDATED hook

  const [taskName, setTaskName] = useState("");
  const [description, setDescription] = useState("");
  // const [status, setStatus] = useState<TaskInstanceStatus>(TaskInstanceStatus.NOT_STARTED); // UPDATED type
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  const [priorityState, setPriorityState] = useState<number | null>(DEFAULT_NON_CRITICAL_PRIORITY); // Store actual priority

  useEffect(() => {
    if (isOpen && taskInstance) {
      setTaskName(taskInstance.task_name || "");
      setDescription(taskInstance.description || "");
      // setStatus(taskInstance.status || TaskInstanceStatus.NOT_STARTED);
      setDueDate(taskInstance.due_date ? new Date(taskInstance.due_date) : undefined);
      setPriorityState(taskInstance.priority || DEFAULT_NON_CRITICAL_PRIORITY);
    }
  }, [isOpen, taskInstance]);

  const isSubmitting = updateMutation.isPending;

  const handleSave = async () => {
    if (!taskName.trim()) {
      toast.error("Validation Error", {
        description: "Task name is required.",
      });
      return;
    }

    const updatedData: TaskInstanceUpdateData = {
      task_name: taskName,
      description: description || null,
      status: status,
      due_date: dueDate ? format(dueDate, "yyyy-MM-dd") : null,
      priority: priorityState,
      // Add other fields from TaskInstanceUpdateData as needed
      // e.g., notes, assigned_to, completed_at, actual_cost, etc.
    };

    updateMutation.mutate(
      {
        taskInstanceId: taskInstanceId, // UPDATED
        data: updatedData,
      },
      {
        onSuccess: (updatedTask) => {
          onClose();
        },
        // onError is handled by the hook's definition if you set it up there
      }
    );
  };

  if (isLoadingTask) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2">Loading task details...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (fetchError || !taskInstance) {
    const errorMessage = fetchError?.message || "Task instance not found.";
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error Loading Task Instance</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Task: {taskInstance.task_name}</DialogTitle>
          <DialogDescription>
            Edit details for task ID: {taskInstance.task_instance_id || "N/A"}. {/* UPDATED ID */}
          </DialogDescription>
        </DialogHeader>

        {updateMutation.isError && updateMutation.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Update Error</AlertTitle>
            <AlertDescription>{updateMutation.error.message}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="task-name">Task Name</Label>
            <Input
              id="task-name"
              value={taskName}
              onChange={(e) => setTaskName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="task-description">Description</Label>
            <Textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="task-status">Status</Label>
              {/* <Select
                value={status}
                onValueChange={(value: TaskInstanceStatus) => setStatus(value)} // UPDATED type
                disabled={isSubmitting}
              >
                <SelectTrigger id="task-status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(TaskInstanceStatus).map((statusValue) => ( // UPDATED enum
                    <SelectItem key={statusValue} value={statusValue}>
                      {statusValue.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select> */}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dueDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Priority Field (replaces isCritical checkbox) */}
          <div className="grid gap-2">
            <Label htmlFor="task-priority">Priority (1-5, e.g., 4+ is critical)</Label>
            <Select
              value={priorityState?.toString() || DEFAULT_NON_CRITICAL_PRIORITY.toString()}
              onValueChange={(value) => setPriorityState(value ? parseInt(value, 10) : null)}
              disabled={isSubmitting}
            >
              <SelectTrigger id="task-priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map(p => (
                  <SelectItem key={p} value={p.toString()}>
                    {p} {p >= CRITICAL_PRIORITY_THRESHOLD ? "(Critical)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* You can add other fields here like assigned_to (using a Select with user list), etc. */}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSave}
            disabled={isSubmitting || !taskName.trim()}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};