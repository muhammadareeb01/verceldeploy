import React from "react";
import { ConfirmationDialog } from "@/components/shared/ConfirmationDialog";
import { ApiTask } from "@/types/tasks";

interface DeleteTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ApiTask | null;
  onConfirm: () => void;
  isMutating: boolean;
}

const DeleteTaskDialog: React.FC<DeleteTaskDialogProps> = ({
  open,
  onOpenChange,
  task,
  onConfirm,
  isMutating,
}) => {
  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Task"
      description="Are you sure you want to delete this task? This action cannot be undone."
      confirmLabel="Delete"
      cancelLabel="Cancel"
      onConfirm={onConfirm}
      variant="destructive"
    >
      {task && (
        <div className="py-4">
          <p className="font-medium">{task.task_name}</p>
          {task.description && (
            <p className="text-muted-foreground text-sm mt-1">
              {task.description}
            </p>
          )}
        </div>
      )}
    </ConfirmationDialog>
  );
};

export default DeleteTaskDialog;
