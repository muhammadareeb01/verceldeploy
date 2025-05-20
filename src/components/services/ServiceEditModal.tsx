
// src/components/services/ServiceEditModal.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Service, ServiceCategory } from "@/types/types";
import { useServiceCategoriesQuery } from "@/hooks/useServices";

interface ServiceEditModalProps {
  service?: Service | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (service: Partial<Service>) => Promise<void>;
  title: string;
}

const ServiceEditModal = ({
  service,
  open,
  onOpenChange,
  onSave,
  title,
}: ServiceEditModalProps) => {
  const [formState, setFormState] = useState<Partial<Service>>({
    service_name: "",
    description: "",
    category: null,
    base_cost: 0,
    is_mandatory: false,
    estimated_duration_days: 1,
    required_documents_template: [],
  });

  const [categoryId, setCategoryId] = useState<string>(""); // Separate state for category ID
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [documentsText, setDocumentsText] = useState("");

  // Use the query hook to load categories
  const { data: categories = [], isLoading: loading } =
    useServiceCategoriesQuery();

  useEffect(() => {
    if (open) {
      // Categories are already loaded via the query hook
      console.log("Categories loaded:", categories);
    }
  }, [open, categories]);

  useEffect(() => {
    if (service) {
      // For editing an existing service
      setFormState({
        service_name: service.service_name,
        description: service.description || "",
        category: service.category || null, // Use the category object directly
        base_cost: service.base_cost || 0,
        is_mandatory: service.is_mandatory !== false, // Default to true if undefined
        estimated_duration_days: service.estimated_duration_days || 0,
        required_documents_template: service.required_documents_template || [],
      });

      // If service has a category, set the category ID
      if (service.category) {
        setCategoryId(service.category.category_id);
      }

      setDocumentsText(
        service.required_documents_template
          ? service.required_documents_template.join("\n")
          : ""
      );
    } else {
      resetForm();
    }
  }, [service, open]);

  const resetForm = () => {
    setFormState({
      service_name: "",
      description: "",
      category: null,
      base_cost: 0,
      is_mandatory: false,
      estimated_duration_days: 1,
      required_documents_template: [],
    });
    setCategoryId("");
    setDocumentsText("");
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (name === "base_cost" || name === "estimated_duration_days") {
      const numValue =
        name === "base_cost" ? parseFloat(value) : parseInt(value, 10);
      setFormState((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
    } else {
      setFormState((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormState((prev) => ({ ...prev, is_mandatory: checked }));
  };

  const handleCategoryChange = (selectedCategoryId: string) => {
    // Find the selected category object
    const selectedCategory = categories.find(
      (cat) => cat.category_id === selectedCategoryId
    );
    setCategoryId(selectedCategoryId);

    // Update the form state with the full category object
    setFormState((prev) => ({
      ...prev,
      category: selectedCategory || null,
    }));
  };

  const handleDocumentsTextChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    setDocumentsText(e.target.value);

    // Parse the text into an array, filtering out empty lines
    const documents = e.target.value
      .split("\n")
      .map((doc) => doc.trim())
      .filter((doc) => doc.length > 0);

    setFormState((prev) => ({
      ...prev,
      required_documents_template: documents.length > 0 ? documents : [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formState.service_name?.trim()) {
      toast.error("Service name is required");
      return;
    }

    if (!categoryId || !formState.category) {
      toast.error("Category is required");
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave(formState);
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving service:", error);
      toast.error("Failed to save service");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="service_name">Service Name *</Label>
            <Input
              id="service_name"
              name="service_name"
              value={formState.service_name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={categoryId}
              onValueChange={handleCategoryChange}
              disabled={loading || categories.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {categories.length === 0 && !loading && (
              <p className="text-sm text-muted-foreground mt-1">
                No categories available. Please create a category first.
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formState.description || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="base_cost">Base Cost *</Label>
              <Input
                id="base_cost"
                name="base_cost"
                type="number"
                value={formState.base_cost}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div>
              <Label htmlFor="estimated_duration_days">
                Estimated Duration (days)
              </Label>
              <Input
                id="estimated_duration_days"
                name="estimated_duration_days"
                type="number"
                value={formState.estimated_duration_days || ""}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_mandatory"
              checked={formState.is_mandatory}
              onCheckedChange={handleSwitchChange}
            />
            <Label htmlFor="is_mandatory">Mandatory Service</Label>
          </div>
          <div>
            <Label htmlFor="required_documents_template">
              Required Documents (one per line)
            </Label>
            <Textarea
              id="required_documents_template"
              value={documentsText}
              onChange={handleDocumentsTextChange}
              placeholder="Enter each required document on a new line"
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || loading}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ServiceEditModal;
