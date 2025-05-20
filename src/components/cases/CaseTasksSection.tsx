// src/components/cases/CaseTasksSection.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

// Updated imports for types and hooks
import {
  // Using useTaskInstancesByCaseIdQuery for fetching tasks specific to this case
  useTaskInstancesByCaseIdQuery, // UPDATED
  useDeleteTaskInstanceMutation,  // UPDATED
  // useToggleTaskInstanceStatusMutation, // Import if you plan to use status toggling directly here
} from "@/hooks/useTasks"; // Or from "@/hooks/useTaskInstances" if you renamed the file

import {
  ApiTaskInstance,
  TaskInstanceStatus,
  // TaskInstanceFilter, // Not directly used for filtering within this component, but by the hook
} from "@/types/tasks";

import { TaskEditModal } from "@/components/tasks/TaskEditModal";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"; // Assuming this path is correct

interface CaseTasksSectionProps {
  caseId: string;
}

const CaseTasksSection: React.FC<CaseTasksSectionProps> = ({ caseId }) => {
  const {
    data: taskInstances = [], // RENAMED data variable for clarity
    isLoading,
    error,
  } = useTaskInstancesByCaseIdQuery(caseId); // UPDATED to specific hook for clarity

  const deleteInstanceMutation = useDeleteTaskInstanceMutation(); // UPDATED hook name
  const isDeleting = deleteInstanceMutation.isPending; // Or .isLoading for TanStack Query v4

  const [selectedTaskInstance, setSelectedTaskInstance] = useState<ApiTaskInstance | null>(null); // UPDATED type
  const [isTaskEditModalOpen, setIsTaskEditModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskInstanceToDelete, setTaskInstanceToDelete] = useState<ApiTaskInstance | null>(null); // UPDATED type

  if (error) {
    return (
      <Card>
        <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
        <CardContent><div className="text-red-600">Error loading tasks: {error.message}</div></CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader><CardTitle>Tasks</CardTitle></CardHeader>
        <CardContent><div className="flex justify-center p-4"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></CardContent>
      </Card>
    );
  }

  const handleTaskEdit = (task: ApiTaskInstance) => { // UPDATED type
    setSelectedTaskInstance(task);
    setIsTaskEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsTaskEditModalOpen(false);
    setSelectedTaskInstance(null);
  };

  const handleDeleteClick = (task: ApiTaskInstance) => { // UPDATED type
    setTaskInstanceToDelete(task);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!taskInstanceToDelete || !taskInstanceToDelete.task_instance_id) return; // UPDATED ID check

    deleteInstanceMutation.mutate(taskInstanceToDelete.task_instance_id, { // UPDATED ID
      onSuccess: () => {
        // Toast is handled by the hook's onSuccess
        setDeleteDialogOpen(false);
        setTaskInstanceToDelete(null);
      },
      onError: (err) => { // Type error if needed: (err: Error)
        // Toast is handled by the hook's onError
        setDeleteDialogOpen(false);
        setTaskInstanceToDelete(null);
      },
    });
  };

  const getStatusBadge = (status?: TaskInstanceStatus | null) => { // UPDATED type
    switch (status) {
      case TaskInstanceStatus.COMPLETED: // UPDATED enum usage
        return <Badge variant="default"><CheckCircle className="h-4 w-4 mr-1" />Completed</Badge>;
      case TaskInstanceStatus.IN_PROGRESS: // UPDATED enum usage
        return <Badge variant="secondary">In Progress</Badge>;
      case TaskInstanceStatus.NOT_STARTED: // UPDATED enum usage
      case TaskInstanceStatus.BLOCKED:     // UPDATED enum usage
      case TaskInstanceStatus.ON_HOLD:     // UPDATED enum usage
      default:
        return <Badge variant="outline"><XCircle className="h-4 w-4 mr-1" />{status ? status.replace(/_/g, " ") : "Pending"}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Tasks ({taskInstances.length})</CardTitle> {/* UPDATED variable */}
          <Button asChild size="sm">
            {/* This link implies a separate page/route for creating tasks for a specific case */}
            {/* Ensure TaskFormDialog or the target page can handle caseId to create TaskInstanceCreateData */}
            <Link to={`/cases/${caseId}/tasks/new`}>Add Task Instance</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {taskInstances.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Task Name</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {taskInstances.map((taskInstance) => ( // UPDATED variable
                <TableRow key={taskInstance.task_instance_id}> {/* UPDATED ID */}
                  <TableCell className="font-medium">{taskInstance.task_name}</TableCell>
                  <TableCell>
                    {taskInstance.due_date
                      ? format(new Date(taskInstance.due_date), "MMM dd, yyyy")
                      : "N/A"}
                  </TableCell>
                  <TableCell>{getStatusBadge(taskInstance.status)}</TableCell>
                  <TableCell>{taskInstance.assignedUser?.full_name || "Unassigned"}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleTaskEdit(taskInstance)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(taskInstance)}
                          className="text-destructive"
                          disabled={isDeleting && taskInstanceToDelete?.task_instance_id === taskInstance.task_instance_id} // UPDATED ID
                        >
                          {isDeleting && taskInstanceToDelete?.task_instance_id === taskInstance.task_instance_id ? ( // UPDATED ID
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Trash className="mr-2 h-4 w-4" />
                          )}
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground">No tasks assigned to this case yet.</p>
        )}
      </CardContent>

      {selectedTaskInstance && isTaskEditModalOpen && ( // Ensure modal renders only when intended
        <TaskEditModal
          taskInstanceId={selectedTaskInstance.task_instance_id} // UPDATED prop and ID
          isOpen={isTaskEditModalOpen}
          onClose={handleEditModalClose}
        />
      )}

      {taskInstanceToDelete && (
        <ConfirmationDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          title="Delete Task Instance"
          description={`Are you sure you want to delete "${taskInstanceToDelete.task_name}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
          onConfirm={handleDeleteConfirm}
          variant="destructive"
        />
      )}
    </Card>
  );
};

export default CaseTasksSection;