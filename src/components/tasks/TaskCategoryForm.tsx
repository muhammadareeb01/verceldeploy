import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { TaskCategory } from "@/types/tasks";
import { toast } from "sonner";

interface TaskCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Partial<TaskCategory>) => void;
  category?: TaskCategory;
  isEdit?: boolean;
  isMutating: boolean;
  mutationError: Error | null;
}

const TaskCategoryForm: React.FC<TaskCategoryFormProps> = ({
  isOpen,
  onClose,
  onSave,
  category,
  isEdit = false,
  isMutating,
  mutationError,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (isOpen) {
      if (isEdit && category) {
        setCategoryName(category.category_name || "");
        setDescription(category.description || "");
      } else {
        setCategoryName("");
        setDescription("");
      }
    }
  }, [isOpen, isEdit, category]);

  const handleSubmit = () => {
    if (!categoryName.trim()) {
      toast.error("Category name is required");
      return;
    }

    const categoryData: Partial<TaskCategory> = {
      category_name: categoryName.trim(),
      description: description.trim() || undefined,
    };

    onSave(categoryData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Task Category" : "Create Task Category"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details of the task category."
              : "Add a new task category to organize your tasks."}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {mutationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{mutationError.message}</AlertDescription>
            </Alert>
          )}
          <div>
            <Label htmlFor={`${isEdit ? "edit" : "create"}-categoryName`}>
              Category Name
            </Label>
            <Input
              id={`${isEdit ? "edit" : "create"}-categoryName`}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Enter category name"
              disabled={isMutating}
            />
          </div>
          <div>
            <Label htmlFor={`${isEdit ? "edit" : "create"}-description`}>
              Description (Optional)
            </Label>
            <Textarea
              id={`${isEdit ? "edit" : "create"}-description`}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the category"
              rows={3}
              disabled={isMutating}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isMutating}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!categoryName.trim() || isMutating}
          >
            {isMutating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Saving..." : "Creating..."}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Category"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskCategoryForm;