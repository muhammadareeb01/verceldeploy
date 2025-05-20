import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useTaskCategoriesQuery,
  useDeleteTaskCategoryMutation,
  useCreateTaskCategoryMutation,
  useUpdateTaskCategoryMutation,
} from "@/hooks/useTaskCategories";
import { toast } from "sonner";
import { Pencil, PlusCircle, Trash, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskCategory } from "@/types/tasks";
import TaskCategoryForm from "../components/tasks/TaskCategoryForm";

const TaskCategories: React.FC = () => {
  const { data: categories = [], isLoading, error } = useTaskCategoriesQuery();
  const createMutation = useCreateTaskCategoryMutation();
  const updateMutation = useUpdateTaskCategoryMutation();
  const deleteMutation = useDeleteTaskCategoryMutation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<
    TaskCategory | undefined
  >();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<TaskCategory | null>(
    null
  );

  const handleCreateCategory = (category: Partial<TaskCategory>) => {
    createMutation.mutate(
      {
        category_name: category.category_name || "",
        description: category.description,
      },
      {
        onSuccess: () => {
          toast("Category created successfully");
          setIsFormOpen(false);
        },
        onError: (error) => {
          toast.error("Failed to create category", {
            description: error.message,
          });
        },
      }
    );
  };

  const handleUpdateCategory = (category: Partial<TaskCategory>) => {
    if (!selectedCategory) return;

    updateMutation.mutate(
      {
        categoryId: selectedCategory.category_id,
        updates: {
          category_name: category.category_name,
          description: category.description,
        },
      },
      {
        onSuccess: () => {
          toast("Category updated successfully");
          setIsFormOpen(false);
          setSelectedCategory(undefined);
        },
        onError: (error) => {
          toast.error("Failed to update category", {
            description: error.message,
          });
        },
      }
    );
  };

  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;

    deleteMutation.mutate(categoryToDelete.category_id, {
      onSuccess: () => {
        toast("Category deleted successfully");
        setIsDeleteDialogOpen(false);
        setCategoryToDelete(null);
      },
      onError: (error) => {
        toast.error("Failed to delete category", {
          description: error.message,
        });
      },
    });
  };

  const openEditForm = (category: TaskCategory) => {
    setSelectedCategory(category);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (category: TaskCategory) => {
    setCategoryToDelete(category);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveCategory = (category: Partial<TaskCategory>) => {
    if (selectedCategory) {
      handleUpdateCategory(category);
    } else {
      handleCreateCategory(category);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-2 text-muted-foreground">
            Loading task categories...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/15 p-4 my-4">
        <p className="text-destructive">
          Error loading task categories: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Categories</h1>
        <Button
          onClick={() => {
            setSelectedCategory(undefined);
            setIsFormOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add New Category
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>
            A list of task categories used to organize tasks.
          </TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Category Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.category_id}>
                  <TableCell className="font-medium">
                    {category.category_name}
                  </TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditForm(category)}
                      >
                        <Pencil className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(category)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-4 align-middle"
                >
                  No task categories found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "
              {categoryToDelete?.category_name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Task Category Form Dialog */}
      <TaskCategoryForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedCategory(undefined);
        }}
        onSave={handleSaveCategory}
        category={selectedCategory}
        isEdit={!!selectedCategory}
        isMutating={createMutation.isPending || updateMutation.isPending}
        mutationError={createMutation.error || updateMutation.error || null}
      />
    </div>
  );
};

export default TaskCategories;
