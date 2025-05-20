import React, { useState, useEffect } from "react";
import { AlertCircle, ChevronLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ServiceCategoryGroup from "@/components/onboarding/ServiceCategoryGroup";
import { Service, ServiceCategory } from "@/types/types";

interface ServiceSelectionFormProps {
  services: Service[];
  categories: ServiceCategory[];
  selectedServices: string[];
  toggleServiceSelection: (serviceId: string) => void;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  onBack: () => void;
  onSubmit: () => void;
}

const ServiceSelectionForm: React.FC<ServiceSelectionFormProps> = ({
  services,
  categories,
  selectedServices,
  toggleServiceSelection,
  isLoading,
  isSubmitting,
  error,
  fetchServices,
  onBack,
  onSubmit,
}) => {
  const [categoryGroups, setCategoryGroups] = useState<
    {
      category: ServiceCategory;
      services: Service[];
    }[]
  >([]);

  useEffect(() => {
    if (categories.length > 0 && services.length > 0) {
      // Group services by category
      const grouped = categories.map((category) => {
        return {
          category,
          services: services.filter(
            (service) => service.category.category_id === category.category_id
          ),
        };
      });

      // Add uncategorized services if any
      const uncategorizedServices = services.filter(
        (service) => !service.category.category_id
      );
      if (uncategorizedServices.length > 0) {
        grouped.push({
          category: {
            category_id: "uncategorized",
            category_name: "Other Services",
            description: "Services without a specific category",
          },
          services: uncategorizedServices,
        });
      }

      setCategoryGroups(grouped.filter((group) => group.services.length > 0));
    }
  }, [categories, services]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading available services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4 mr-2" />
        <AlertDescription>{error}</AlertDescription>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={fetchServices}
        >
          Try Again
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-medium mb-2">Select Services</h2>
        <p className="text-muted-foreground">
          Choose the services your company requires. Required services are
          pre-selected.
        </p>
      </div>

      <div className="space-y-8">
        {categoryGroups.map((group) => (
          <ServiceCategoryGroup
            key={group.category.category_id}
            category={group.category}
            services={group.services}
            selectedServiceIds={selectedServices}
            onServiceToggle={toggleServiceSelection}
          />
        ))}
      </div>

      <div className="pt-6 flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button
          onClick={onSubmit}
          disabled={isSubmitting || selectedServices.length === 0}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Complete Onboarding"
          )}
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelectionForm;
