
// src/pages/ServiceCategories.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Loader2, Pencil, Trash } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/utils/formatters";
import DeleteCategoryDialog from "@/components/service-categories/DeleteCategoryDialog";
import CategoryForm from "@/components/service-categories/CategoryForm";
import { ServiceCategory } from "@/types/types";
import {
  useServiceCategoriesQuery,
  useUpdateServiceCategoryMutation,
  useDeleteServiceCategoryMutation,
} from "@/hooks/useServices";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ServiceCategories: React.FC = () => {
  const { data: categories, isLoading, isError, error } = useServiceCategoriesQuery();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const updateMutation = useUpdateServiceCategoryMutation();
  const deleteMutation = useDeleteServiceCategoryMutation();

  const isAdmin = userRole === "ADMIN" || userRole === "MANAGER";

  const handleEditCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedCategory(null);
    setIsAddModalOpen(true);
  };

  const handleSaveCategory = async (categoryData: ServiceCategory) => {
    try {
      if (selectedCategory) {
        await updateMutation.mutateAsync({
          categoryId: selectedCategory.category_id,
          updates: categoryData,
        });
        toast({
          title: "Success",
          description: "Category updated successfully."
        });
      } else {
        // Creation is handled in the CategoryForm component
      }
      setIsAddModalOpen(false);
      setIsEditModalOpen(false);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to save category"
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedCategory) return;

    try {
      await deleteMutation.mutateAsync(selectedCategory.category_id);
      toast({
        title: "Success",
        description: "Category deleted successfully."
      });
      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to delete category"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 flex flex-col items-center justify-center h-96">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-primary" />
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto py-10 text-center">
        <p className="text-destructive mb-2">Error loading categories</p>
        <p className="text-muted-foreground">{error?.message}</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/dashboard")}
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Service Categories</h1>
        {isAdmin && (
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add New Category
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableCaption>List of available service categories.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Category Name</TableHead>
              <TableHead>Description</TableHead>
              {isAdmin && <TableHead className="w-[100px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories && categories.length > 0 ? (
              categories.map((category) => (
                <TableRow key={category.category_id}>
                  <TableCell className="font-medium">
                    {category.category_name}
                  </TableCell>
                  <TableCell>{category.description || "-"}</TableCell>
                  {isAdmin && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditCategory(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAdmin ? 3 : 2} className="text-center">
                  No categories found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {isAddModalOpen && (
        <CategoryForm 
          initialData={null}
        />
      )}

      {isEditModalOpen && selectedCategory && (
        <CategoryForm 
          initialData={selectedCategory}
        />
      )}

      <DeleteCategoryDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        categoryName={selectedCategory?.category_name || ""}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ServiceCategories;
