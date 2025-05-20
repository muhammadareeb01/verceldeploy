
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Service, ServiceCategory } from "@/types/types";
import { Info, Lock } from "lucide-react";

export interface ServiceCategoryGroupProps {
  category: ServiceCategory;
  services: Service[];
  selectedServiceIds: string[];
  onServiceToggle: (serviceId: string) => void;
}

const ServiceCategoryGroup: React.FC<ServiceCategoryGroupProps> = ({
  category,
  services,
  selectedServiceIds,
  onServiceToggle,
}) => {
  return (
    <div className="space-y-2">
      <h3 className="text-lg font-medium">{category.category_name}</h3>
      {category.description && (
        <p className="text-sm text-muted-foreground mb-2">
          {category.description}
        </p>
      )}

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {services.map((service) => {
          const isSelected = selectedServiceIds.includes(service.service_id);
          const isMandatory = service.is_mandatory;

          return (
            <div
              key={service.service_id}
              className="flex items-start space-x-3 px-2 py-1.5 rounded hover:bg-gray-100"
            >
              <Checkbox
                id={`service-${service.service_id}`}
                checked={isSelected}
                onCheckedChange={() =>
                  !isMandatory && onServiceToggle(service.service_id)
                }
                disabled={isMandatory}
                className="mt-1"
              />
              <div className="space-y-1.5 flex-1">
                <label
                  htmlFor={`service-${service.service_id}`}
                  className={`text-base font-medium flex items-center cursor-pointer ${
                    isMandatory ? "text-primary" : ""
                  }`}
                >
                  {service.service_name}
                  {isMandatory && (
                    <span className="ml-2 flex items-center text-xs font-normal text-amber-600">
                      <Lock className="h-3 w-3 mr-1" /> Required
                    </span>
                  )}
                </label>
                {service.description && (
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                )}
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>
                    Base Cost:{" "}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(service.base_cost)}
                  </span>
                  {service.estimated_duration_days && (
                    <span className="flex items-center">
                      <Info className="h-3 w-3 mr-1" />
                      Est. Duration: {service.estimated_duration_days} days
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceCategoryGroup;
