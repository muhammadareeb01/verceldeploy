
import React, { useState, useEffect } from "react";
import {
  FormControl,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { ServiceCategory } from "@/types/types";
import { 
  useCreateServiceCategoryMutation, 
  useUpdateServiceCategoryMutation 
} from "@/hooks/useServices";

interface CategoryFormProps {
  initialData?: ServiceCategory | null;
}

const CategoryForm: React.FC<CategoryFormProps> = ({ initialData }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ServiceCategory>>({
    category_name: "",
    description: "",
  });
  const navigate = useNavigate();
  
  const createMutation = useCreateServiceCategoryMutation();
  const updateMutation = useUpdateServiceCategoryMutation();

  useEffect(() => {
    if (initialData) {
      setFormData({
        category_name: initialData.category_name,
        description: initialData.description,
      });
    }
  }, [initialData]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (initialData) {
        // Update existing category
        const updatedCategoryData: ServiceCategory = {
          category_id: initialData.category_id,
          category_name: formData.category_name || initialData.category_name,
          description: formData.description !== undefined ? formData.description : initialData.description,
        };

        await updateMutation.mutateAsync({
          categoryId: initialData.category_id,
          updates: updatedCategoryData
        });
        
        toast("Category updated successfully");
      } else {
        // Create new category
        const newCategoryId = uuidv4();
        const newCategoryData: ServiceCategory = {
          category_id: newCategoryId,
          category_name: formData.category_name || "",
          description: formData.description || null,
        };

        await createMutation.mutateAsync(newCategoryData);
        
        toast("Category created successfully");
      }
      navigate("/service-categories");
    } catch (error: any) {
      toast("Failed to save category. Please try again.", {
        description: error?.message
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto mt-4">
      <h1 className="text-2xl font-bold mb-4">
        {initialData ? "Edit Category" : "Create Category"}
      </h1>
      <form onSubmit={onSubmit}>
        <CustomFormField
          value={formData.category_name || ""}
          onChange={(e) =>
            setFormData({ ...formData, category_name: e.target.value })
          }
          label="Category Name"
          placeholder="Enter category name"
          name="category_name"
        />
        <CustomFormField
          value={formData.description || ""}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          label="Description"
          placeholder="Enter description"
          name="description"
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </form>
    </div>
  );
};

interface CustomFormFieldProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label: string;
  placeholder: string;
  name: string;
}

const CustomFormField: React.FC<CustomFormFieldProps> = ({
  value,
  onChange,
  label,
  placeholder,
  name,
}) => (
  <div className="mb-4">
    <FormLabel>{label}</FormLabel>
    <FormControl>
      <Input placeholder={placeholder} value={value} onChange={onChange} name={name} />
    </FormControl>
    <FormMessage />
  </div>
);

export default CategoryForm;
